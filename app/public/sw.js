// Minimal service worker - just for installability
self.addEventListener('install', (event) => {
    console.log('Service worker installed');
});

self.addEventListener('fetch', (event) => {
    // Let network handle all requests
    return;
});
