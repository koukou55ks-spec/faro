// Service Worker - Version 1.0.0
const CACHE_NAME = 'faro-v1'
const RUNTIME_CACHE = 'faro-runtime'

// Critical resources to cache immediately
const PRECACHE_URLS = [
  '/',
  '/app',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
]

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - network first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API calls - network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({
          error: 'オフラインです。接続を確認してください。'
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      })
    )
    return
  }

  // HTML pages - network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline.html')
          })
        })
    )
    return
  }

  // Static assets - cache first, network fallback
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then((response) => {
          // Don't cache non-200 responses
          if (!response || response.status !== 200) {
            return response
          }

          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
      })
    )
    return
  }

  // Default - network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
})

async function syncMessages() {
  try {
    // Get pending messages from IndexedDB
    const pendingMessages = await getPendingMessages()

    // Send each message
    for (const message of pendingMessages) {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })

      // Remove from pending after successful send
      await removePendingMessage(message.id)
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Faroからの新しい通知',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '開く',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icon-96x96.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Faro', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/app')
    )
  }
})

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Helper functions for IndexedDB (simplified)
async function getPendingMessages() {
  // Implementation would use IndexedDB to get pending messages
  return []
}

async function removePendingMessage(id) {
  // Implementation would remove message from IndexedDB
  return true
}