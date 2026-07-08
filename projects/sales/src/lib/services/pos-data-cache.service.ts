import { Injectable } from '@angular/core';

/** A queued, locally-completed sale awaiting sync to the server. */
export interface OutboxOrder {
  /** Client-generated unique id — the idempotency key (maps to SalesOrder.OfflineOrderNumber). */
  uid: string;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  attempts: number;
  lastError?: string;
  /** The checkout payload to replay against the sync endpoint. */
  payload: unknown;
  // ── Reconciliation (filled in after sync) ──
  /** Total the device printed on the offline receipt. */
  deviceTotal?: number;
  /** Total the server booked after re-pricing. */
  serverTotal?: number;
  /** serverTotal − deviceTotal. Kept (status 'synced') when non-zero so it shows for review. */
  variance?: number;
  serverReceiptNumber?: string | null;
  serverOrderNumber?: string | null;
}

/**
 * IndexedDB-backed cache for the offline POS.
 *
 *  - `kv`     : key→value snapshots of reference data (catalog, prices, customers,
 *               config, templates) so the till opens and browses with no network.
 *  - `outbox` : completed-but-unsynced sales (Phase 2–3), keyed by `uid`.
 *
 * Hand-rolled (no extra npm dependency) to avoid touching the lockfile.
 */
@Injectable({ providedIn: 'root' })
export class PosDataCache {
  private static readonly DB = 'pos-offline';
  private static readonly VERSION = 1;
  private static readonly KV = 'kv';
  private static readonly OUTBOX = 'outbox';

  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(PosDataCache.DB, PosDataCache.VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PosDataCache.KV)) db.createObjectStore(PosDataCache.KV);
        if (!db.objectStoreNames.contains(PosDataCache.OUTBOX)) db.createObjectStore(PosDataCache.OUTBOX, { keyPath: 'uid' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  // ── Reference-data snapshot (Phase 1) ───────────────────────────────────────

  /** Cache a JSON-serializable snapshot under a key. Never throws (best-effort). */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.open();
      await this.run(db, PosDataCache.KV, 'readwrite', (s) => s.put(value, key));
    } catch {
      /* storage blocked / private mode — caching is best-effort */
    }
  }

  /** Read a cached snapshot, or null if absent/unavailable. */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.open();
      return (await this.request<T>(db, PosDataCache.KV, 'readonly', (s) => s.get(key))) ?? null;
    } catch {
      return null;
    }
  }

  // ── Outbox (Phase 2–3) ──────────────────────────────────────────────────────

  async enqueue(order: OutboxOrder): Promise<void> {
    const db = await this.open();
    await this.run(db, PosDataCache.OUTBOX, 'readwrite', (s) => s.put(order));
  }

  async outboxAll(): Promise<OutboxOrder[]> {
    try {
      const db = await this.open();
      return (await this.request<OutboxOrder[]>(db, PosDataCache.OUTBOX, 'readonly', (s) => s.getAll())) ?? [];
    } catch {
      return [];
    }
  }

  async outboxPendingCount(): Promise<number> {
    const all = await this.outboxAll();
    return all.filter((o) => o.status === 'pending' || o.status === 'failed').length;
  }

  async updateOutbox(uid: string, patch: Partial<OutboxOrder>): Promise<void> {
    const db = await this.open();
    const current = await this.request<OutboxOrder>(db, PosDataCache.OUTBOX, 'readonly', (s) => s.get(uid));
    if (!current) return;
    await this.run(db, PosDataCache.OUTBOX, 'readwrite', (s) => s.put({ ...current, ...patch }));
  }

  async removeOutbox(uid: string): Promise<void> {
    const db = await this.open();
    await this.run(db, PosDataCache.OUTBOX, 'readwrite', (s) => s.delete(uid));
  }

  // ── Low-level helpers ───────────────────────────────────────────────────────

  private run(
    db: IDBDatabase,
    store: string,
    mode: IDBTransactionMode,
    op: (s: IDBObjectStore) => IDBRequest,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, mode);
      op(tx.objectStore(store));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  private request<T>(
    db: IDBDatabase,
    store: string,
    mode: IDBTransactionMode,
    op: (s: IDBObjectStore) => IDBRequest,
  ): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      const req = op(db.transaction(store, mode).objectStore(store));
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  }
}
