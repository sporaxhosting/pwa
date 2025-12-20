const CACHE_NAME = 'bankflow-v1';
const urlsToCache = [
  '/',
  'index.html',
  'transactions.html',
  'payments.html',
  'settings.html',
  'styles.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
