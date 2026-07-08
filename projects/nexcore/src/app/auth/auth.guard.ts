import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@nexcore/core';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.isTokenExpired()) {
    auth.logout();
    return router.createUrlTree(['/login'], { queryParams: { reason: 'session-expired' } });
  }

  return true;
};