self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('tennispro-shell-v1')
      .then((cache) =>
        cache.addAll([
          '/',
          '/index.html',
          '/manifest.webmanifest',
          '/pwa-icon.svg',
        ]),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !['tennispro-shell-v1'].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open('tennispro-shell-v1').then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    }),
  );
});
