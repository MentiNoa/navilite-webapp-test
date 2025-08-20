const CACHE_NAME = "navilite-cache-v1";
const MAX_ITEMS = 50; // limite massimo di file in cache
const OFFLINE_URLS = [
  "/navilite-webapp-test/",
  "/navilite-webapp-test/index.html",
  "/navilite-webapp-test/manifest.json",
  "/navilite-webapp-test/icons/icon-192.png",
  "/navilite-webapp-test/icons/icon-512.png",
  "https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.css",
  "https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.js",
  "https://unpkg.com/osmtogeojson@3.0.0-beta.5/osmtogeojson.js"
];

// Funzione per limitare la cache
async function limitCacheSize(name, maxItems) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]); // elimina il più vecchio
    await limitCacheSize(name, maxItems);
  }
}

// Install SW e cache iniziale
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Attivazione e pulizia cache obsolete
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Intercetta le richieste
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
        .catch(() => caches.match("/navilite-webapp-test/index.html"));
    })
  );
});

