// sw.js — Service Worker para SISMO APP Chile
// Sube este archivo a la RAÍZ del repo (mismo nivel que index.html)

const CACHE_NAME = 'sismo-app-cache-v1'; // sube el número (v2, v3...) cada vez que actualices archivos

// Tu app vive toda en un solo index.html (Tailwind, FontAwesome y Google
// Fonts se cargan por CDN, así que no hay CSS/JS propios que agregar aquí).
// El resto de recursos (CDN, íconos) se van cacheando solos la primera vez
// que se piden, gracias a la estrategia "network-first" de más abajo.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Instalación: guarda los archivos base en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activación: borra cachés antiguas de versiones previas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: intenta la red primero; si falla (sin internet), usa la caché.
// Así la app siempre muestra la versión más nueva cuando hay conexión,
// pero sigue funcionando sin internet.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
