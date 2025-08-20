const CACHE_NAME = 'aasta-night-delivery-v7';
const STATIC_CACHE = 'static-v7';
const urlsToCache = [
	'/',
	'/manifest.json',
	'/offline.html',
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png',
	'/logo.mp4',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((k) => ![CACHE_NAME, STATIC_CACHE].includes(k))
						.map((k) => caches.delete(k))
				)
			)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	// API: network first, fallback to cache
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			fetch(request)
				.then((res) => {
					const resClone = res.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
					return res;
				})
				.catch(() => caches.match(request))
		);
		return;
	}

	// Never cache Next.js build assets in the service worker to avoid version mismatches
	if (url.pathname.startsWith('/_next/')) {
		event.respondWith(fetch(request));
		return;
	}

	// Icons and other static public assets: cache-first
	if (url.pathname.startsWith('/icons/')) {
		event.respondWith(
			caches.match(request).then((cached) => {
				return (
					cached ||
					fetch(request).then((res) => {
						const resClone = res.clone();
						caches
							.open(STATIC_CACHE)
							.then((cache) => cache.put(request, resClone));
						return res;
					})
				);
			})
		);
		return;
	}

	// Video splash asset: cache-first
	if (url.pathname === '/logo.mp4') {
		event.respondWith(
			caches.match(request).then((cached) => {
				return (
					cached ||
					fetch(request).then((res) => {
						const resClone = res.clone();
						caches
							.open(STATIC_CACHE)
							.then((cache) => cache.put(request, resClone));
						return res;
					})
				);
			})
		);
		return;
	}

	// Documents and others: stale-while-revalidate
	event.respondWith(
		caches.match(request).then((cached) => {
			const fetchPromise = fetch(request)
				.then((res) => {
					const resClone = res.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
					return res;
				})
				.catch(
					() =>
						cached ||
						(request.destination === 'document' &&
							caches.match('/offline.html'))
				);
			return cached || fetchPromise;
		})
	);
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
			body: event.data ? event.data.text() : '',
		};
	}
	if (
		(!notificationData.title || notificationData.title === 'undefined') &&
		(!notificationData.body ||
			notificationData.body === 'undefined' ||
			notificationData.body === '')
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
		vibrate: notificationData.vibrate || [200, 100, 200],
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
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
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
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(order),
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
