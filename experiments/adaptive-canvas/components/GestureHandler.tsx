'use client'

import { useEffect, useRef } from 'react'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'

export function GestureHandler() {
  const { handleGesture, gestures } = useAdaptiveCanvasStore()
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<number>(0)
  const pinchStartRef = useRef<number>(0)

  useEffect(() => {
    if (!gestures.enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
        }
      } else if (e.touches.length === 2) {
        // Pinch start
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        pinchStartRef.current = distance
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartRef.current) {
        // Pinch gesture
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const scale = distance / pinchStartRef.current

        if (Math.abs(scale - 1) > gestures.pinchSensitivity) {
          handleGesture('pinch', { scale })
          pinchStartRef.current = distance
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      }

      const deltaX = touchEnd.x - touchStartRef.current.x
      const deltaY = touchEnd.y - touchStartRef.current.y
      const deltaTime = touchEnd.time - touchStartRef.current.time

      // Swipe detection
      if (Math.abs(deltaX) > gestures.swipeThreshold && deltaTime < 500) {
        if (deltaX > 0) {
          handleGesture('swipe-right')
        } else {
          handleGesture('swipe-left')
        }
      } else if (Math.abs(deltaY) > gestures.swipeThreshold && deltaTime < 500) {
        if (deltaY > 0) {
          handleGesture('swipe-down')
        } else {
          handleGesture('swipe-up')
        }
      }

      // Double tap detection
      if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        if (touchEnd.time - lastTapRef.current < 300) {
          handleGesture('double-tap', { x: touchEnd.x, y: touchEnd.y })
        }
        lastTapRef.current = touchEnd.time
      }

      touchStartRef.current = null
      pinchStartRef.current = 0
    }

    // Shake detection (using device motion)
    let lastX = 0, lastY = 0, lastZ = 0
    let shakeCount = 0

    const handleMotion = (e: DeviceMotionEvent) => {
      const acceleration = e.accelerationIncludingGravity
      if (!acceleration) return

      const deltaX = Math.abs(acceleration.x! - lastX)
      const deltaY = Math.abs(acceleration.y! - lastY)
      const deltaZ = Math.abs(acceleration.z! - lastZ)

      if (deltaX + deltaY + deltaZ > gestures.shakeIntensity) {
        shakeCount++
        if (shakeCount > 3) {
          handleGesture('shake')
          shakeCount = 0
        }
      }

      lastX = acceleration.x!
      lastY = acceleration.y!
      lastZ = acceleration.z!
    }

    // Mouse wheel for desktop zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const scale = e.deltaY > 0 ? 0.9 : 1.1
        handleGesture('pinch', { scale })
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    document.addEventListener('wheel', handleWheel, { passive: false })

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('wheel', handleWheel)

      if ('DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion)
      }
    }
  }, [handleGesture, gestures])

  // Visual feedback for gestures
  return null
}