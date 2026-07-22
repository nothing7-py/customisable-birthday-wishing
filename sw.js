const CACHE = "birthday-universe-v1";
const FILES = ["./", "./index.html", "./styles.css", "./config.js", "./app.js", "./manifest.webmanifest"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES))));
self.addEventListener("fetch", (event) => event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))));