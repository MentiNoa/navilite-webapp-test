// ─── CONFIGURAZIONE (deve corrispondere a CONFIG.basePath in index.html) ───
const BASE_PATH = '/navilite-webapp-test';  // produzione: '/navilite-webapp'

const CACHE_NAME = "navilite-cache-v1";
const MAX_ITEMS = 50;
const OFFLINE_URLS = [
  BASE_PATH + "/",
  BASE_PATH + "/index.html",
  BASE_PATH + "/manifest.json",
  BASE_PATH + "/icons/icon-192.png",
  BASE_PATH + "/icons/icon-512.png",
  "https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.css",
  "https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.js",
  "https://unpkg.com/osmtogeojson@3.0.0-beta.5/osmtogeojson.js"
];

async function limitCacheSize(name, maxItems) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(name, maxItems);
  }
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
            limitCacheSize(CACHE_NAME, MAX_ITEMS);
          });
          return res;
        })
        .catch(() => caches.match(BASE_PATH + "/index.html"));
    })
  );
});
