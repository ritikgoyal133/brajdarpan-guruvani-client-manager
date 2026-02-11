/**
 * Service Worker for Brajdarpan Guruvani Kendra PWA
 * Minimal service worker - no caching, just for PWA installability
 */

// Install event - minimal setup for PWA
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Clean up any old caches if they exist
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// No fetch event handler - all requests go directly to network
// This means no caching, always fresh data from server

