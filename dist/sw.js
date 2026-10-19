// VOX HUB Offline App-Shell Service Worker
// Ensures that even if the user opens or refreshes the app without internet,
// the app shell loads and displays the VOX:BOT Offline Warning Screen instead of a browser error.

const CACHE_NAME = 'vox-hub-app-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html']).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache API endpoints, network connectivity pings, or Vite HMR requests
  if (
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('__ping') ||
    url.searchParams.has('t') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // Network-First strategy: always fetch live when online, fallback to cached shell when offline
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (
          networkRes &&
          networkRes.status === 200 &&
          url.origin === self.location.origin
        ) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone).catch(() => {});
          });
        }
        return networkRes;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const indexFallback = await caches.match('/index.html');
          if (indexFallback) return indexFallback;
        }
        throw new Error('Offline');
      })
  );
});
