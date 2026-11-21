// Service Worker: hält die App offline verfügbar.
// Bei jeder Änderung an der App VERSION hochzählen, damit das Tablet die neue Fassung lädt.
const VERSION = "wortschatz-v4";
const FILES = [
  "./", "index.html", "app.css", "app.js", "starter.js", "grammar.js", "verbs.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "fonts/fredoka-latin-500-normal.woff2", "fonts/fredoka-latin-600-normal.woff2",
  "fonts/nunito-latin-400-normal.woff2", "fonts/nunito-latin-700-normal.woff2"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Erst aus dem Netz (damit Updates ankommen), ohne Netz aus dem Speicher.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
