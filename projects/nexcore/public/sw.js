/*
 * POS offline service worker — app-shell caching.
 *
 * Goal: the POS page loads even with no network (Phase 0). Strategy:
 *   - App shell (navigations):  network-first, fall back to the cached shell offline.
 *   - Static assets (JS/CSS/…): cache-first + background refresh (stale-while-revalidate).
 *   - /api/ and cross-origin:   passthrough, never cached — ERP data freshness is handled
 *                               explicitly via IndexedDB (PosDataCache), not the SW.
 *
 * Hand-rolled (no Workbox/ngsw dependency) so it works under `ng serve` and the
 * static-web-app build without touching package.json.
 */
const CACHE = 'pos-shell-v1';
const APP_SHELL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                         // never cache mutations

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // cross-origin: passthrough
  if (url.pathname.startsWith('/api/')) return;             // API: passthrough (data via IndexedDB)

  // SPA navigations: try network, fall back to the cached shell so the app boots offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(APP_SHELL, res.clone())).catch(() => {});
          return res;
        })
        .catch(() => caches.match(APP_SHELL).then((r) => r || Response.error())),
    );
    return;
  }

  // Static assets: serve from cache immediately, refresh in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE).then((c) => c.put(req, res.clone())).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
