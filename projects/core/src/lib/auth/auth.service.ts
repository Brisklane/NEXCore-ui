import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable, of, Subject, tap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'erp_token';
  private readonly REFRESH_TOKEN_KEY = 'erp_refresh_token';
  private readonly USER_KEY = 'erp_user';

  /** Whether the last sign-in asked to stay signed in — drives the checkbox on return. */
  private readonly REMEMBER_KEY = 'erp_remember';
  /** Username to prefill when the user chose to stay signed in. */
  private readonly REMEMBER_USER_KEY = 'erp_remember_username';

  isLoggedIn = signal<boolean>(this.hasToken());

  /** Emits when a 401 is received on a POS route AND the refresh token is also invalid/absent. */
  readonly sessionExpired$ = new Subject<void>();

  /** Shared promise so concurrent expired-token requests all wait for the same refresh call. */
  private _refreshPromise: Promise<boolean> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Silently refresh the access token using the stored refresh token.
   * Returns true on success, false if the refresh token is absent or rejected.
   * Multiple concurrent callers share the same in-flight promise.
   */
  refreshAccessToken(): Promise<boolean> {
    if (this._refreshPromise) return this._refreshPromise;

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return Promise.resolve(false);

    this._refreshPromise = firstValueFrom(
      this.http.post<any>(API_CONFIG.auth.refreshToken, { refreshToken })
    )
      .then((res: any) => {
        if (res?.success && res?.data?.accessToken) {
          // Preserve the same storage location the original token was in.
          const inLocal = !!localStorage.getItem(this.TOKEN_KEY);
          const store = inLocal ? localStorage : sessionStorage;
          store.setItem(this.TOKEN_KEY, res.data.accessToken);
          if (res.data.refreshToken) store.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          if (res.data.user) store.setItem(this.USER_KEY, JSON.stringify(res.data.user));
          this.isLoggedIn.set(true);
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => { this._refreshPromise = null; });

    return this._refreshPromise;
  }

  private hasToken(): boolean {
    return (
      !!localStorage.getItem(this.TOKEN_KEY) ||
      !!sessionStorage.getItem(this.TOKEN_KEY)
    );
  }

  /**
   * Sign in.
   *
   * `remember` decides where the session lives, which is what actually makes the
   * "keep me signed in" checkbox mean something:
   *   true  → localStorage:   survives closing the browser, until the refresh token
   *                           expires server-side (Jwt:RefreshTokenExpirationDays).
   *   false → sessionStorage: cleared the moment the tab/browser closes.
   *
   * The choice and the username are also persisted so the next visit comes back
   * with the box in the same state and the username already filled in.
   */
  login(
    payload: { username: string; password: string },
    remember: boolean
  ): Observable<any> {
    return this.http.post<any>(API_CONFIG.auth.login, payload).pipe(
      tap((res) => {
        if (res?.success && res?.data?.accessToken) {
          // Never leave a stale copy in the other store — otherwise an unchecked
          // login would still be resurrected from a previous remembered session.
          this.clearLocalSession();

          const store = remember ? localStorage : sessionStorage;
          store.setItem(this.TOKEN_KEY, res.data.accessToken);
          if (res?.data?.refreshToken) {
            store.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          }
          if (res?.data?.user) {
            store.setItem(this.USER_KEY, JSON.stringify(res.data.user));
          }

          this.setRemembered(remember, payload.username);
          this.isLoggedIn.set(true);
        }
      })
    );
  }

  /**
   * True when the sign-in on this device should stay signed in. Defaults to true
   * until the user explicitly unticks it once, matching the previous behaviour.
   */
  isRemembered(): boolean {
    return localStorage.getItem(this.REMEMBER_KEY) !== '0';
  }

  /** Username to prefill on the login form (empty when not remembered). */
  rememberedUsername(): string {
    return this.isRemembered() ? localStorage.getItem(this.REMEMBER_USER_KEY) ?? '' : '';
  }

  private setRemembered(remember: boolean, username: string): void {
    if (remember) {
      localStorage.setItem(this.REMEMBER_KEY, '1');
      localStorage.setItem(this.REMEMBER_USER_KEY, username);
    } else {
      localStorage.setItem(this.REMEMBER_KEY, '0');
      localStorage.removeItem(this.REMEMBER_USER_KEY);
    }
  }


  validateCompany(payload: any): Observable<any> {
    return this.http.post<any>(API_CONFIG.company.validate, payload);
  }

  createCompany(payload: any): Observable<any> {
    return this.http.post<any>(API_CONFIG.company.create, payload);
  }

  registerUser(payload: any): Observable<any> {
    return this.http.post<any>(API_CONFIG.auth.register, payload);
  }

  getToken(): string | null {
    return (
      localStorage.getItem(this.TOKEN_KEY) ||
      sessionStorage.getItem(this.TOKEN_KEY)
    );
  }

  getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  getUser(): any | null {
    const user =
      localStorage.getItem(this.USER_KEY) ||
      sessionStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getCompanyId(): string | null {
    const user = this.getUser();
    return user?.companyId ?? null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) return false; // No exp claim = treat as valid
      const expiresAt = payload.exp * 1000; // Convert to ms
      return Date.now() >= expiresAt;
    } catch {
      return true; // Malformed token = treat as expired
    }
  }

  /** Epoch-ms the current access token expires at, or null if absent/undecodable/no exp. */
  getTokenExpiryMs(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = this.decodeToken(token);
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * True when the token expires within `thresholdSeconds` (or is already gone/expired).
   * Used to refresh proactively — before a request hits an expired token — so an
   * offline-first POS keeps a live session without ever showing the re-auth prompt.
   */
  isTokenExpiringSoon(thresholdSeconds = 120): boolean {
    const expiresAt = this.getTokenExpiryMs();
    if (expiresAt == null) return false; // no token, or no exp claim (treated as non-expiring)
    return Date.now() >= expiresAt - thresholdSeconds * 1000;
  }

  /**
   * Refresh the access token if it's missing or about to expire, otherwise no-op.
   * Returns true when a usable (fresh or still-valid) token is in place afterwards.
   * Concurrent callers share the in-flight refresh via {@link refreshAccessToken}.
   */
  async ensureFreshToken(thresholdSeconds = 120): Promise<boolean> {
    if (!this.getToken()) return false;
    if (!this.isTokenExpiringSoon(thresholdSeconds)) return true;
    return this.refreshAccessToken();
  }

  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  }

  private clearLocalSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);

    this.isLoggedIn.set(false);
  }

  updateSession(accessToken: string, refreshToken: string, user: any): void {
    const isLocal = !!localStorage.getItem(this.TOKEN_KEY);
    const storage = isLocal ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, accessToken);
    if (refreshToken) storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    if (user) storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    // If token missing, just clear
    if (!token) {
      this.clearLocalSession();
      return of({ success: true });
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = {
      refreshToken: refreshToken || null,
    };

    return this.http.post<any>(API_CONFIG.auth.logout, body, { headers }).pipe(
      catchError((err) => of(err)), 
      finalize(() => {
        this.clearLocalSession(); 
      })
    );
  }
}