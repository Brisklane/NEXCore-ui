import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@env';

/**
 * Tracks connectivity for the offline-capable POS.
 *
 * Connectivity = browser online flag AND the API actually being reachable
 * (navigator.onLine is true on a captive/dead network), confirmed by a light
 * heartbeat. Also owns the per-device id used as the offline-order/​sync key.
 */
@Injectable({ providedIn: 'root' })
export class OfflineService {
  private static readonly DEVICE_KEY = 'pos_device_id';
  private static readonly HEARTBEAT_MS = 25_000;

  private readonly online = new BehaviorSubject<boolean>(navigator.onLine);

  /** Emits true when the API is reachable, false when offline. */
  readonly online$: Observable<boolean> = this.online.asObservable();

  /** Stable per-browser/device id — used as part of the offline order key on sync. */
  readonly deviceId: string;

  constructor() {
    this.deviceId = this.ensureDeviceId();

    window.addEventListener('online', () => this.probe());
    window.addEventListener('offline', () => this.set(false));

    // Confirm real reachability on a timer (covers "network up, server down").
    this.probe();
    setInterval(() => this.probe(), OfflineService.HEARTBEAT_MS);
  }

  get isOnline(): boolean {
    return this.online.value;
  }

  /** Force an immediate reachability check (e.g. after a failed request). */
  async refresh(): Promise<boolean> {
    await this.probe();
    return this.isOnline;
  }

  private set(value: boolean): void {
    if (this.online.value !== value) this.online.next(value);
  }

  private async probe(): Promise<void> {
    if (!navigator.onLine) {
      this.set(false);
      return;
    }
    try {
      // no-cors: any server response (even 404) resolves → reachable.
      // Only a network failure throws → offline.
      await fetch(environment.apiBaseUrl, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
      this.set(true);
    } catch {
      this.set(false);
    }
  }

  private ensureDeviceId(): string {
    const existing = localStorage.getItem(OfflineService.DEVICE_KEY);
    if (existing) return existing;
    const id = crypto?.randomUUID?.() ?? `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(OfflineService.DEVICE_KEY, id);
    return id;
  }
}
