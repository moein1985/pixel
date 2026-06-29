const CACHE_NAME = "pixel-v1";
const STATIC_CACHE = `${CACHE_NAME}-static`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;

const STATIC_ASSETS = [
  "/",
  "/market",
  "/news",
  "/reports",
  "/networks",
  "/contact",
  "/manifest.json",
  "/robots.txt",
];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("pixel-") && key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event: any) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/)) {
      event.respondWith(
        caches.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            return response;
          });
        }),
      );
      return;
    }

    if (url.pathname === "/" || url.pathname === "/market" || url.pathname === "/news" || url.pathname === "/reports") {
      event.respondWith(
        caches.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        }),
      );
      return;
    }
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached)),
  );
});

self.addEventListener("push", (event: any) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "پیکسل";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: data.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
