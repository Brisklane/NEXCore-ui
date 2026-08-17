import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
import { AuthService } from '../auth/auth.service';
import { APP_REGISTRY, AppDefinition, DEFAULT_INSTALLED, findApp } from './app-registry';

interface InstalledAppsDto {
  installed: string[];
}

/**
 * Which apps this company has installed.
 *
 * The set lives on the server, keyed by company, so it follows the user to any device
 * and can be reconciled against the subscription plan. A local copy is kept only as a
 * first-paint cache — the sidebar renders before the first request comes back, and
 * flashing every app on screen and then removing most of them looks broken.
 */
@Injectable({ providedIn: 'root' })
export class InstalledAppsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private static readonly CACHE_KEY = 'nexcore.installed_apps';
  // The app's HTTP interceptor attaches the bearer token, so no headers here.
  private readonly base = `${environment.apiBaseUrl}/api/core/apps`;

  private readonly _installed = signal<string[]>(this.readCache());
  private readonly _loaded = signal(false);
  private readonly _busy = signal(false);

  /** Installed keys, always including the always-on core app. */
  readonly installed = computed(() => this._installed());
  readonly loaded = this._loaded.asReadonly();
  readonly busy = this._busy.asReadonly();

  /** Apps to show in navigation, in registry order. */
  readonly installedApps = computed<AppDefinition[]>(() => {
    const keys = this._installed();
    return APP_REGISTRY.filter(a => a.core || keys.includes(a.key));
  });

  private readCache(): string[] {
    try {
      const raw = localStorage.getItem(InstalledAppsService.CACHE_KEY);
      if (!raw) return [...DEFAULT_INSTALLED];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string')
                                   : [...DEFAULT_INSTALLED];
    } catch {
      return [...DEFAULT_INSTALLED];
    }
  }

  private writeCache(keys: string[]): void {
    try {
      localStorage.setItem(InstalledAppsService.CACHE_KEY, JSON.stringify(keys));
    } catch {
      // A full or blocked storage quota must not stop the app from working.
    }
  }

  private apply(keys: string[]): void {
    // Only keys this build knows about: a server that still lists a retired app should
    // not put an unreachable entry in the sidebar.
    const known = keys.filter(k => !!findApp(k));
    this._installed.set(known);
    this.writeCache(known);
  }

  isInstalled(key: string): boolean {
    const app = findApp(key);
    return !!app && (app.core || this._installed().includes(key));
  }

  /** Loads the server's set once per session. Safe to call repeatedly. */
  async load(force = false): Promise<void> {
    if ((this._loaded() && !force) || !this.auth.isLoggedIn()) return;

    try {
      const res = await firstValueFrom(
        this.http.get<{ data?: InstalledAppsDto }>(this.base),
      );
      if (res?.data?.installed) this.apply(res.data.installed);
      this._loaded.set(true);
    } catch {
      // Offline or the endpoint is not deployed yet — keep the cached set rather than
      // hiding apps the user was using a minute ago.
      this._loaded.set(true);
    }
  }

  /** Installs a single app. Returns the keys added, or empty if it was already there. */
  async install(key: string): Promise<string[]> {
    const app = findApp(key);
    if (!app || app.status !== 'available' || this.isInstalled(key)) return [];

    const needed = [key];
    const next = [...this._installed(), key];
    this._busy.set(true);
    this.apply(next);   // optimistic: the click should feel instant

    try {
      await firstValueFrom(
        this.http.post(`${this.base}/install`, { keys: needed }),
      );
    } catch {
      // Leave the optimistic state in place; `load(true)` on the next visit reconciles.
    } finally {
      this._busy.set(false);
    }
    return needed;
  }

  /**
   * Removes an app. Any app can go except the always-on shell — nothing here depends on
   * anything else, so there is no case where removing one breaks another.
   */
  async uninstall(key: string): Promise<{ ok: boolean }> {
    const app = findApp(key);
    if (!app || app.core) return { ok: false };

    const next = this._installed().filter(k => k !== key);
    this._busy.set(true);
    this.apply(next);

    try {
      await firstValueFrom(
        this.http.post(`${this.base}/uninstall`, { keys: [key] }),
      );
    } catch {
      // Same as install: the optimistic state stands until the next reconcile.
    } finally {
      this._busy.set(false);
    }
    return { ok: true };
  }

  /** Clears the cache on sign-out so the next tenant does not inherit this one's apps. */
  reset(): void {
    this._installed.set([...DEFAULT_INSTALLED]);
    this._loaded.set(false);
    try { localStorage.removeItem(InstalledAppsService.CACHE_KEY); } catch { /* ignore */ }
  }
}
