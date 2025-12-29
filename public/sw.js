self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic pass-through fetch
    // For a real offline experience, we would cache assets here.
    // But for PWA installability, just having a fetch handler is often enough.
    event.respondWith(fetch(event.request));
});
