// Service Worker de la aplicación de jueces.
// Red directa siempre: en carrera nunca queremos servir una versión antigua.
// Su única función es que la app sea instalable en el móvil.

const SW_VERSION = '2026.08.12.1';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => new Response('Sin conexión', { status: 503 })));
});
