var CACHE_PREFIX = "nuegov-cache";
var version = Date.now();
var CACHE_NAME = `${CACHE_PREFIX}-${version}`;
var urlsToCache = [
  "/",
  "/logo64.png",
  "/logo512.png",
  "/logo192.png",
  "/navjoyglobe.png",
  "/nointernet.png",
  "https://cdn.plot.ly/plotly-1.57.1.min.js",
  "https://unpkg.com/shpjs@3.6.3/dist/shp.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js",
];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (CACHE_NAME !== cacheName && cacheName.startsWith(CACHE_PREFIX)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
