self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Simple fetch pass-through to satisfy PWA requirements
  // For full offline support, you would implement caching strategies here
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
