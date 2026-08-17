import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { appForUrl } from './app-registry';
import { InstalledAppsService } from './installed-apps.service';

/**
 * Blocks routes belonging to an app this company has not installed.
 *
 * Uninstalling has to mean the screens are actually unreachable, not merely hidden from
 * the menu — otherwise a bookmark, a browser-history entry or a stale link walks straight
 * back into an app the customer removed.
 *
 * Runs after `authGuard`, and only decides once the installed set is known: guarding on
 * a half-loaded cache would bounce a legitimate deep link on a cold start.
 */
export const appInstalledGuard: CanMatchFn = async (_route: Route, segments: UrlSegment[]) => {
  const apps = inject(InstalledAppsService);
  const router = inject(Router);

  const url = '/' + segments.map(s => s.path).join('/');
  const app = appForUrl(url);

  // Nothing in the registry claims this URL — not an app route, so not our business.
  if (!app || app.core) return true;

  await apps.load();

  if (apps.isInstalled(app.key)) return true;

  return router.createUrlTree(['/apps'], { queryParams: { missing: app.key } });
};
