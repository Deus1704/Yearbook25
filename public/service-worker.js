// Service Worker for Yearbook25
const CACHE_NAME = 'yearbook25-cache-v1';
const RUNTIME_CACHE = 'yearbook25-runtime-v1';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/MAPRC.png'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Special handling for Google Drive image URLs
const isGoogleDriveUrl = (url) => {
  return url.includes('drive.google.com') || 
         url.includes('googleusercontent.com') || 
         url.includes('docs.google.com');
};

// Extract Google Drive file ID from URL
const extractGoogleDriveFileId = (url) => {
  if (!url) return null;
  
  // Match patterns like id=FILE_ID or /d/FILE_ID/
  const idMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  
  return null;
};

// Get optimized Google Drive URL
const getOptimizedGoogleDriveUrl = (url) => {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return url;
  
  // Use the most reliable format
  return `https://lh3.googleusercontent.com/d/${fileId}`;
};

// Fetch event - network first with cache fallback for images
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('/api/') &&
      !isGoogleDriveUrl(event.request.url)) {
    return;
  }

  // Special handling for image requests
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || 
      event.request.url.includes('/image') ||
      isGoogleDriveUrl(event.request.url)) {
    
    // For Google Drive URLs, try to optimize the URL
    if (isGoogleDriveUrl(event.request.url)) {
      const optimizedUrl = getOptimizedGoogleDriveUrl(event.request.url);
      const optimizedRequest = new Request(optimizedUrl, {
        method: event.request.method,
        headers: event.request.headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      event.respondWith(
        fetch(optimizedRequest)
          .then(response => {
            // Cache the response
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            // If fetch fails, try the original request from cache
            return caches.match(event.request);
          })
      );
      return;
    }
    
    // For other image requests, use network first with cache fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If fetch fails, try from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For API requests, use network only
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For everything else, use cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Cache the response
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return response;
          });
      })
  );
});
