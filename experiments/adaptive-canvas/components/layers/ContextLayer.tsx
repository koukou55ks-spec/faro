'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box } from '@react-three/drei'
import * as THREE from 'three'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'

interface ContextLayerProps {
  opacity: number
}

export function ContextLayer({ opacity }: ContextLayerProps) {
  const { ambientData, context } = useAdaptiveCanvasStore()
  const groupRef = useRef<THREE.Group>(null)

  // Animated financial health particles
  const particles = useMemo(() => {
    const count = 50
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5

      // Color based on financial health
      const healthFactor = ambientData.financialHealth / 100
      colors[i * 3] = 1 - healthFactor // Red
      colors[i * 3 + 1] = healthFactor // Green
      colors[i * 3 + 2] = 0.5 // Blue constant
    }

    return { positions, colors }
  }, [ambientData.financialHealth])

  useFrame((state) => {
    if (!groupRef.current) return

    // Gentle rotation based on time frame
    const rotationSpeed = context.timeFrame === 'future' ? 0.002 : context.timeFrame === 'past' ? -0.001 : 0
    groupRef.current.rotation.y += rotationSpeed

    // Pulse effect based on alert level
    const pulseIntensity = ambientData.alertLevel === 'high' ? 0.1 : ambientData.alertLevel === 'medium' ? 0.05 : 0
    if (pulseIntensity > 0) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * pulseIntensity
      groupRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Financial health visualization */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
        <Sphere args={[3, 32, 32]} position={[0, 0, -10]}>
          <MeshDistortMaterial
            color={getHealthColor(ambientData.financialHealth)}
            attach="material"
            distort={0.3}
            speed={2}
            transparent
            opacity={opacity * 0.3}
            wireframe
          />
        </Sphere>
      </Float>

      {/* Time frame indicators */}
      {context.timeFrame === 'past' && (
        <group position={[-5, 2, -5]}>
          <Box args={[0.5, 3, 0.5]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={opacity * 0.5} />
          </Box>
          <Box args={[0.5, 2.5, 0.5]} position={[-0.7, 0, 0]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={opacity * 0.4} />
          </Box>
          <Box args={[0.5, 2, 0.5]} position={[-1.4, 0, 0]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={opacity * 0.3} />
          </Box>
        </group>
      )}

      {context.timeFrame === 'future' && (
        <group position={[5, 2, -5]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Sphere key={i} args={[0.2 + i * 0.1, 8, 8]} position={[i * 0.5, i * 0.3, 0]}>
              <meshBasicMaterial color="#c084fc" transparent opacity={opacity * (0.6 - i * 0.1)} />
            </Sphere>
          ))}
        </group>
      )}

      {/* Alert level indicator */}
      {ambientData.alertLevel !== 'none' && (
        <Float speed={3} floatIntensity={2}>
          <Sphere args={[0.5, 16, 16]} position={[0, 5, -3]}>
            <meshBasicMaterial
              color={
                ambientData.alertLevel === 'high'
                  ? '#ef4444'
                  : ambientData.alertLevel === 'medium'
                  ? '#f59e0b'
                  : '#06b6d4'
              }
              transparent
              opacity={opacity * 0.8}
            />
          </Sphere>
        </Float>
      )}

      {/* Particle cloud */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={opacity * 0.5}
          sizeAttenuation
        />
      </points>

      {/* Market status indicator */}
      <group position={[0, -3, -8]}>
        <MarketStatusIndicator status={ambientData.marketStatus} opacity={opacity} />
      </group>

      {/* Next event countdown */}
      {ambientData.nextImportantEvent && (
        <group position={[0, 4, -5]}>
          <Float speed={0.5}>
            <Box args={[4, 1, 0.1]}>
              <meshBasicMaterial color="#8b5cf6" transparent opacity={opacity * 0.3} />
            </Box>
          </Float>
        </group>
      )}
    </group>
  )
}

function MarketStatusIndicator({ status, opacity }: { status: string; opacity: number }) {
  const colors = {
    open: '#10b981',
    closed: '#6b7280',
    pre: '#f59e0b',
    after: '#8b5cf6'
  }

  return (
    <group>
      <Sphere args={[0.3, 16, 16]}>
        <meshBasicMaterial
          color={colors[status as keyof typeof colors]}
          transparent
          opacity={opacity * 0.6}
        />
      </Sphere>
      {status === 'open' && (
        <>
          <Sphere args={[0.5, 16, 16]}>
            <meshBasicMaterial
              color={colors.open}
              transparent
              opacity={opacity * 0.2}
            />
          </Sphere>
          <Sphere args={[0.7, 16, 16]}>
            <meshBasicMaterial
              color={colors.open}
              transparent
              opacity={opacity * 0.1}
            />
          </Sphere>
        </>
      )}
    </group>
  )
}

function getHealthColor(health: number): string {
  if (health > 70) return '#10b981'
  if (health > 40) return '#f59e0b'
  return '#ef4444'
}