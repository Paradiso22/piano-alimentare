/* Service worker: serve per l'installazione su Android e per far funzionare l'app senza rete.
   Strategia rete-prima: online vedi sempre l'ultima versione, offline parte dalla copia in cache. */
const CACHE = 'piano-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // l'app e l'SDK Firebase si mettono in cache; il database resta sempre diretto
  if (u.origin !== location.origin && u.hostname !== 'www.gstatic.com') return;

  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
