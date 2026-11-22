// 오프라인 캐시: 앱 파일을 저장해 두고, 새 버전이 있으면 다음 실행 때 반영
const VERSION = "saju-v2.0.0";
const FILES = ["./", "index.html", "manifest.webmanifest", "css/app.css",
  "js/app.js", "js/core.js", "js/analysis.js", "js/fortune.js", "js/calib.js", "js/reading.js",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
