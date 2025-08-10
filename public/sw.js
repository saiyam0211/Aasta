const CACHE_NAME = 'aasta-night-delivery-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  } else {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
        .catch(() => request.destination === 'document' && caches.match('/offline.html'))
    );
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOrders());
  }
});

self.addEventListener('push', (event) => {
  let notificationData = {};

  try {
    notificationData = event.data ? event.data.json() : {};
  } catch (error) {
    notificationData = {
      title: 'Aasta - Night Delivery',
      body: event.data ? event.data.text() : ''
    };
  }

  // Ignore push events where there's no title or body
  if (
    (!notificationData.title || notificationData.title === 'undefined') &&
    (!notificationData.body || notificationData.body === 'undefined' || notificationData.body === '')
  ) {
    return;
  }

  const options = {
    body: notificationData.body || 'New notification',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: notificationData.badge || '/icons/icon-72x72.png',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    vibrate: notificationData.vibrate || [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Aasta - Night Delivery',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

async function syncOrders() {
  try {
    const offlineOrders = await getOfflineOrders();

    for (const order of offlineOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order)
        });

        if (response.ok) {
          await removeOfflineOrder(order.id);
        }
      } catch (error) {
        console.error('Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineOrders() {
  return [];
}

async function removeOfflineOrder(orderId) {
  console.log('Removing offline order:', orderId);
}