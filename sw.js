const CACHE_NAME = 'rifacontrol-v6'; // v6 = força atualização do cache
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/styles/main.css',
  './src/styles/desktop.css',
  './assets/brand/logo.png',
  './assets/brand/banner.png',
  './src/main.js',
  './src/config/supabase.js',
  './src/config/state.js',
  './src/config/constants.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('cdn.jsdelivr')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});