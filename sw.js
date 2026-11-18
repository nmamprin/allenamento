// Cambia VERSION ogni volta che aggiorni i file su GitHub
const VERSION = 'v1';
const CACHE = 'allenamento-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Solo i file dell'app: le chiamate a Google passano sempre dalla rete
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Prima la copia salvata (apertura immediata anche con poco segnale), poi aggiorna in background
  e.respondWith(
    caches.open(CACHE).then(c => c.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => null);
      return cached || net.then(r => r || c.match('./index.html'));
    }))
  );
});
