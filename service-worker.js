// ⚡ Tên cache — bạn có thể tăng version nếu muốn reload lại toàn bộ
const CACHE_NAME = 'myapp-cache-v2';

// ⚙️ Danh sách file cần cache
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './icon-192.png',
  './manifest.json'
];

// 🧱 Cài đặt service worker — cache tất cả file cần thiết
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 🧹 Kích hoạt — xóa cache cũ (nếu có version khác)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// 🚀 Fetch event — ưu tiên cache, cập nhật nền khi có mạng
self.addEventListener('fetch', (event) => {
  // Bỏ qua các request không phải GET (POST/PUT...)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Nếu có cache — trả ngay cache ra (tức thì)
        if (cachedResponse) {
          // Cập nhật lại trong nền (nếu có mạng)
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, networkResponse.clone()));
              }
            })
            .catch(() => {}); // Bỏ qua lỗi mạng
          return cachedResponse;
        }

        // Nếu chưa có cache — cố lấy từ mạng
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(() => new Response('⚠️ Offline — dữ liệu chưa có trong cache.'));
      })
  );
});
