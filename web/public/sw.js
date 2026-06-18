/**
 * KB教练 Service Worker
 *
 * 缓存策略：
 * - 静态资源（_next/static/）：Cache-First，长期缓存
 * - 页面导航：Network-First + 离线回退
 * - API 请求：Network-First + 5分钟短缓存降级
 * - 图片：Cache-First，30天过期
 */

const STATIC_CACHE = 'kb-coach-static-v1';
const PAGES_CACHE = 'kb-coach-pages-v1';
const API_CACHE = 'kb-coach-api-v1';
const IMAGES_CACHE = 'kb-coach-images-v1';

// 核心页面预缓存
const PRECACHE_PAGES = [
  '/',
  '/analyze',
  '/plan',
  '/workout',
  '/nutrition',
  '/chat',
  '/profile',
  '/offline.html',
];

// 安装：预缓存核心页面
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_PAGES).catch((err) => {
        console.warn('[SW] 预缓存部分失败（离线可用性降级）:', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活：清理旧版本缓存
self.addEventListener('activate', (event) => {
  const validCaches = new Set([STATIC_CACHE, PAGES_CACHE, API_CACHE, IMAGES_CACHE]);
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => !validCaches.has(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理 GET 请求
  if (request.method !== 'GET') return;

  // 跳过非同源请求（如 CDN 字体等允许浏览器默认处理）
  if (url.origin !== self.location.origin) return;

  // API 请求 → Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // 页面导航 → Network-First + 离线回退
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, PAGES_CACHE).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Next.js 静态资源 → Cache-First（带 hash，不可变）
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 图片 → Cache-First
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/screenshots/')
  ) {
    event.respondWith(cacheFirst(request, IMAGES_CACHE));
    return;
  }

  // 其他 → Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, PAGES_CACHE));
});

// --- 缓存策略实现 ---

/** Cache-First：缓存优先，无缓存时回源 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

/** Network-First：网络优先，失败时降级到缓存 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

/** Stale-While-Revalidate：先返回缓存，后台静默更新 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// --- 推送通知 ---

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'KB教练提醒你该训练了！',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() },
    actions: [
      { action: 'open', title: '打开应用' },
      { action: 'close', title: '稍后提醒' },
    ],
  };
  event.waitUntil(self.registration.showNotification('KB教练', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/'));
  }
});
