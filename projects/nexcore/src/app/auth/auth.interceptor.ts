
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '@nexcore/core';

function handleExpired(
  authService: AuthService,
  router: Router,
  onPosRoute: boolean,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  // Try a silent token refresh first — no visible prompt unless the refresh also fails.
  return from(authService.refreshAccessToken()).pipe(
    switchMap((refreshed) => {
      if (refreshed) {
        const newToken = authService.getToken()!;
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
      }
      // Refresh failed — no valid session left.
      if (onPosRoute) {
        authService.sessionExpired$.next();
        return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Token expired' }));
      }
      authService.logout();
      router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
      return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Token expired' }));
    }),
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const url = req.url.toLowerCase();
  const currentUrl = router.url || '';

  // Truly public endpoints — no token needed at all.
  const isPublicEndpoint =
    currentUrl.startsWith('/login') ||
    currentUrl.startsWith('/register') ||
    currentUrl.startsWith('/company/register') ||
    currentUrl.startsWith('/manage-company') ||
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh-token') ||  // never intercept the refresh call itself
    url.includes('/company/validate');

  // Endpoints where a server 401 must NOT trigger a logout redirect.
  const onPosRoute = currentUrl.startsWith('/sales/pos');
  const suppress401Redirect = isPublicEndpoint || url.includes('/poscashier/pin-login') || onPosRoute;

  if (!isPublicEndpoint) {
    const token = authService.getToken();

    if (token && authService.isTokenExpired()) {
      // Reactive: token already expired — refresh and retry (blocks this request).
      return handleExpired(authService, router, onPosRoute, req, next);
    }

    if (token && authService.isTokenExpiringSoon()) {
      // Proactive: token still valid but near expiry — kick off a background refresh
      // (deduped via the shared in-flight promise) so the NEXT request gets a fresh
      // token. Non-blocking: this request still goes out on the current valid token,
      // and a failed proactive refresh never logs the user out.
      authService.ensureFreshToken().catch(() => { /* keep using the still-valid token */ });
    }

    if (token && !req.headers.has('Authorization')) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !suppress401Redirect) {
        // Try refresh on unexpected 401 from server (clock skew, server-side revocation).
        return handleExpired(authService, router, onPosRoute, req, next);
      }
      return throwError(() => error);
    }),
  );
};