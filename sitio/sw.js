/* Caché para uso sin conexión: red primero, caché de respaldo. */
const CACHE = 'relajacion-v4';
const FILES = [
  './', 'index.html', 'css/base.css', 'css/slides.css', 'css/compose.css',
  'js/scene.js', 'js/physio.js', 'js/widgets.js', 'js/practice.js', 'js/motion.js', 'js/hoja.js', 'js/app.js',
  'vendor/three.min.js', 'assets/favicon.svg',
  'assets/fonts/fraunces.woff2', 'assets/fonts/fraunces-italic.woff2', 'assets/fonts/inter.woff2'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone();
      if (r.ok && new URL(e.request.url).origin === location.origin) caches.open(CACHE).then((c) => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then((m) => m || caches.match('index.html')))
  );
});
