const CACHE_NAME = 'kb-coach-v1';
const STATIC_ASSETS = [
  '/',
  '/analyze',
  '/plan',
  '/nutrition',
  '/chat',
  '/offline',
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截 - 网络优先策略
self.addEventListener('fetch', (event) => {
  // 跳过 API 请求
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // � successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败时返回缓存
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // 如果是页面请求，返回离线页面
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Network error', { status: 503 });
        });
      })
  );
});

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'KB教练提醒你该训练了！',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'open',
        title: '打开应用',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/xmark.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('KB教练', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
