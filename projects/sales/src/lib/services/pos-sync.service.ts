import { Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { PosDataCache, OutboxOrder } from './pos-data-cache.service';
import { OfflineService } from './offline.service';
import { PosTransactionService } from './pos-transaction.service';
import { AuthService } from '@nexcore/core';

export interface SyncResult {
  attempted: number;
  synced: number;
  failed: number;
  /** Transport-level failure (couldn't reach the endpoint / HTTP error). */
  error?: string;
}

/**
 * Drains the offline-sale outbox to the server's idempotent /offline-sync endpoint.
 *
 * Auth contract:
 *   - The global authInterceptor attaches the Bearer token to every request.
 *   - drain() checks auth state up-front; if the token is missing or expired it
 *     returns immediately with a clear message rather than firing a 401.
 *   - drain() is re-triggered automatically whenever the user logs back in, so
 *     sales captured during a session whose token expired while offline are synced
 *     as soon as the cashier re-authenticates.
 */
@Injectable({ providedIn: 'root' })
export class PosSyncService {
  private readonly pending = new BehaviorSubject<number>(0);
  readonly pendingCount$ = this.pending.asObservable();

  private draining = false;

  constructor(
    private cache: PosDataCache,
    private offline: OfflineService,
    private txns: PosTransactionService,
    private auth: AuthService,
  ) {
    this.refreshCount();

    // Drain whenever connectivity returns (and user is authenticated).
    this.offline.online$.subscribe((online) => {
      if (online) void this.drain();
    });

    // Drain whenever the user logs back in (token was expired while offline).
    toObservable(this.auth.isLoggedIn).subscribe((loggedIn: boolean) => {
      if (loggedIn && this.offline.isOnline) void this.drain();
    });
  }

  /** Queue a completed offline sale and bump the badge. */
  async enqueue(order: OutboxOrder): Promise<void> {
    await this.cache.enqueue(order);
    await this.refreshCount();
    if (this.offline.isOnline) void this.drain();
  }

  async refreshCount(): Promise<void> {
    this.pending.next(await this.cache.outboxPendingCount());
  }

  /** Push all pending/failed outbox orders to the server, then reconcile locally. */
  async drain(): Promise<SyncResult> {
    if (this.draining) return { attempted: 0, synced: 0, failed: 0, error: 'A sync is already running.' };
    if (!this.offline.isOnline) return { attempted: 0, synced: 0, failed: 0, error: 'You are offline — connect first.' };

    // Pre-flight auth check: avoid a round-trip 401 when the token is already known to be invalid.
    const token = this.auth.getToken();
    if (!token) {
      return { attempted: 0, synced: 0, failed: 0, error: 'Not signed in — please log in to sync offline sales.' };
    }
    if (this.auth.isTokenExpired()) {
      // Token lapsed while we were offline — try a silent refresh before giving up, so the
      // outbox drains on reconnect without bouncing the cashier to the re-auth prompt.
      const refreshed = await this.auth.refreshAccessToken();
      if (!refreshed) {
        return { attempted: 0, synced: 0, failed: 0, error: 'Session expired — please log in again to sync offline sales.' };
      }
    }

    const pending = (await this.cache.outboxAll())
      .filter((o) => o.status === 'pending' || o.status === 'failed');
    if (pending.length === 0) return { attempted: 0, synced: 0, failed: 0 };

    this.draining = true;
    let synced = 0, failed = 0;
    let error: string | undefined;
    try {
      const res = await firstValueFrom(this.txns.offlineSync({
        deviceId: this.offline.deviceId,
        orders: pending.map((o) => o.payload),
      }));

      const results = res?.data?.results;
      if (!results) {
        error = res?.message || 'The sync endpoint returned no result.';
      } else {
        for (const item of results) {
          if (item.error) {
            failed++;
            await this.cache.updateOutbox(item.offlineOrderNumber, { status: 'failed', lastError: item.error });
            continue;
          }
          synced++;
          const variance = item.variance ?? 0;
          if (Math.abs(variance) < 0.005) {
            await this.cache.removeOutbox(item.offlineOrderNumber);
          } else {
            await this.cache.updateOutbox(item.offlineOrderNumber, {
              status: 'synced',
              serverTotal: item.serverTotal ?? undefined,
              variance,
              serverReceiptNumber: item.receiptNumber ?? null,
              serverOrderNumber: item.orderNumber ?? null,
              lastError: undefined,
            });
          }
        }
      }
    } catch (e: unknown) {
      error = this.describeError(e);
    } finally {
      this.draining = false;
      await this.refreshCount();
    }
    return { attempted: pending.length, synced, failed, error };
  }

  private describeError(e: any): string {
    if (e?.status === 0)   return 'Cannot reach the API (network or CORS). Is the server running?';
    if (e?.status === 401) return 'Session expired — please log in again to sync offline sales.';
    if (e?.status === 404) return 'Endpoint not found (404) — the API may be an old build without /offline-sync.';
    if (e?.status)         return `Server error ${e.status}${e.error?.message ? ': ' + e.error.message : ''}`;
    return e?.message || 'Sync failed.';
  }

  /** All outbox entries (pending, failed, synced-with-variance), newest first. */
  async getItems(): Promise<OutboxOrder[]> {
    const all = await this.cache.outboxAll();
    return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  /** Re-queue a failed item and try again. */
  async retry(uid: string): Promise<SyncResult> {
    await this.cache.updateOutbox(uid, { status: 'pending', lastError: undefined });
    await this.refreshCount();
    return this.drain();
  }

  /** Drop an item from the device queue (e.g. an acknowledged variance). */
  async dismiss(uid: string): Promise<void> {
    await this.cache.removeOutbox(uid);
    await this.refreshCount();
  }
}
