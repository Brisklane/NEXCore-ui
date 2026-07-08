import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // POS routes handle session expiry inline (re-auth overlay) so they must never
  // be redirected to login — the cashier would lose their open cart.
  const path = segments.map(s => s.path).join('/');
  const isPosRoute = path.startsWith('sales/pos');

  if (!auth.isLoggedIn()) {
    // No token at all: POS still needs credentials to start; redirect everyone.
    return router.createUrlTree(['/login']);
  }

  if (auth.isTokenExpired()) {
    if (isPosRoute) {
      // Let the POS load — it will show the inline re-auth overlay on the first API call.
      return true;
    }
    auth.logout();
    return router.createUrlTree(['/login'], { queryParams: { reason: 'session-expired' } });
  }

  return true;
};