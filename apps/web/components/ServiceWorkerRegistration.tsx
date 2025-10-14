'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Only register in production
      if (process.env.NODE_ENV === 'production') {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('Service Worker registered:', registration.scope)

              // Check for updates periodically
              setInterval(() => {
                registration.update()
              }, 60 * 60 * 1000) // Every hour

              // Handle updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing

                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (
                      newWorker.state === 'activated' &&
                      navigator.serviceWorker.controller
                    ) {
                      // New service worker activated, show update prompt
                      if (window.confirm('新しいバージョンが利用可能です。更新しますか？')) {
                        window.location.reload()
                      }
                    }
                  })
                }
              })
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error)
            })
        })
      }
    }
  }, [])

  return null
}