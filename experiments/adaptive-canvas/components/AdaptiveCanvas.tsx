'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'

// Sub-components
import { ContextLayer } from './layers/ContextLayer'
import { ConversationLayer } from './layers/ConversationLayer'
import { ToolLayer } from './layers/ToolLayer'
import { TimeShiftNavigator } from './TimeShiftNavigator'
import { SemanticWorkspace } from './SemanticWorkspace'
import { GestureHandler } from './GestureHandler'
import { AmbientDisplay } from './AmbientDisplay'
import { AIPersonaManager } from './AIPersonaManager'

export function AdaptiveCanvas() {
  const {
    layers,
    cameraPosition,
    cameraTarget,
    spatialLayout,
    context,
    ambientData
  } = useAdaptiveCanvasStore()

  const canvasRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize canvas after mount
    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-300 rounded-full animate-ping" />
        </div>
        <div className="ml-4 text-white">
          <h2 className="text-xl font-bold">Faro Adaptive Canvas</h2>
          <p className="text-gray-300">Initializing your financial universe...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={canvasRef} className="w-full h-screen relative overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <PerspectiveCamera
            makeDefault
            position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
            fov={60}
          />
          <OrbitControls
            target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <directionalLight position={[0, 10, 5]} intensity={0.8} />

          <Suspense fallback={null}>
            {/* Context Layer - Background financial visualization */}
            <group visible={layers.context > 0}>
              <ContextLayer opacity={layers.context} />
            </group>

            {/* Semantic Workspace - 3D node graph */}
            <SemanticWorkspace layout={spatialLayout} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D Overlay Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient Display - Top status bar */}
        <AmbientDisplay />

        {/* Conversation Layer - Center */}
        <AnimatePresence>
          {layers.conversation > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: layers.conversation, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute inset-x-0 top-20 bottom-32 flex items-center justify-center pointer-events-auto"
            >
              <ConversationLayer />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool Layer - Floating tools */}
        <AnimatePresence>
          {layers.tools > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: layers.tools }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-auto"
            >
              <ToolLayer />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Persona Manager - Bottom right */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <AIPersonaManager />
        </div>

        {/* Time Shift Navigator - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <TimeShiftNavigator />
        </div>
      </div>

      {/* Gesture Handler - Invisible overlay */}
      <GestureHandler />

      {/* Dynamic gradient background based on context */}
      <div
        className="absolute inset-0 -z-10 transition-all duration-3000"
        style={{
          background: getContextGradient(context.timeFrame, context.currentMood, ambientData.financialHealth)
        }}
      />
    </div>
  )
}

// Dynamic background gradient based on context
function getContextGradient(
  timeFrame: 'past' | 'present' | 'future',
  mood: string,
  health: number
): string {
  const healthColor = health > 70 ? 'rgb(34, 197, 94)' : health > 40 ? 'rgb(250, 204, 21)' : 'rgb(239, 68, 68)'

  const timeColors = {
    past: 'rgb(99, 102, 241)',
    present: 'rgb(168, 85, 247)',
    future: 'rgb(236, 72, 153)'
  }

  const moodOpacity = {
    planning: 0.3,
    reviewing: 0.2,
    exploring: 0.4,
    analyzing: 0.1
  }

  return `radial-gradient(ellipse at center,
    ${timeColors[timeFrame]}${Math.round(moodOpacity[mood as keyof typeof moodOpacity] * 255).toString(16)},
    ${healthColor}10 30%,
    rgb(17, 24, 39) 100%)`
}