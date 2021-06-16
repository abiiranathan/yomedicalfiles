const appCache = [
  "/static/script.js",
  "/static/style.css",
  "/index.html",
  "/pages/about.html",
  "/pages/eclinic.html",
  "/pages/cardiomonitor.html",
  "/images/eclinic/eclinic.png",
  "/images/eclinic/laboratory-cbc.png",
  "/images/eclinic/laboratory-results.png",
  "/images/eclinic/management.png",
  "/images/eclinic/patient-admin.png",
  "/images/eclinic/patient-list.png",
].map(url => `${location.protocol}//${location.host}${url}`);

const version = "2.0";
const staticCacheName = "static-" + version;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      cache.addAll(appCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", async event => {
  const keys = await caches.keys();

  keys.map(cname => {
    if (cname !== staticCacheName) {
      caches.delete(cname);
    }
  });
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(staticCacheName).then(async cache => {
      const cacheResponse = await cache.match(event.request);
      if (cacheResponse) return cacheResponse;

      return fetch(event.request);
    })
  );
});
