// service-worker.js
const CACHE_NAME = 'hustle-campus-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/hustles.html',
    '/hustle-single.html',
    '/skills.html',
    '/contact.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    // Placeholder paths for critical icons (actual files to be added by user)
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    // Example of a key image (if one was critical for offline app shell)
    // '/assets/images/nairobi-campus-bg.jpg',
];

// Install a service worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Opened cache:', CACHE_NAME);
                // Add all URLs to cache, but don't fail install if some are missing
                // This is important because optional assets like specific images might not exist
                // and we don't want to break PWA installation for that.
                // However, core files like HTML, CSS, JS should exist.
                const cachePromises = urlsToCache.map(urlToCache => {
                    return cache.add(urlToCache).catch(err => {
                        console.warn(`[Service Worker] Failed to cache ${urlToCache}:`, err);
                    });
                });
                return Promise.all(cachePromises);
            })
            .then(() => {
                return self.skipWaiting(); // Activate worker immediately
            })
    );
});

// Activate the service worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Take control of all open clients
        })
    );
});

// Listen for fetch events
self.addEventListener('fetch', event => {
    // We only want to cache GET requests
    if (event.request.method !== 'GET') {
        // For non-GET requests, just pass them through to the network.
        // event.respondWith(fetch(event.request)); // This would be one way, but default behavior is fine.
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Not in cache - fetch from network
                return fetch(event.request).then(
                    networkResponse => {
                        // Check if we received a valid response
                        // Only cache basic responses (same origin) to avoid caching opaque responses from CDNs if not desired
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            // For non-basic types (like CDN resources), we might still want to use them but not cache them,
                            // or have a different caching strategy. For now, just return them without caching if not 'basic'.
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    // Network request failed
                    console.log('[Service Worker] Fetch failed for: ', event.request.url, error);
                    // Optionally, return a fallback page for specific routes (e.g., HTML pages)
                    // if (event.request.mode === 'navigate') {
                    //    return caches.match('/offline.html'); // Requires 'offline.html' to be in urlsToCache
                    // }
                    // For now, just let the browser handle the offline error if not in cache and network fails.
                });
            })
    );
});
