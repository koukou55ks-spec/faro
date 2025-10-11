'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Line, Sphere, Box, Cone } from '@react-three/drei'
import * as THREE from 'three'
import { useAdaptiveCanvasStore, SemanticNode } from '@/lib/stores/adaptive-canvas-store'

interface SemanticWorkspaceProps {
  layout: 'graph' | 'timeline' | 'layers' | 'constellation'
}

export function SemanticWorkspace({ layout }: SemanticWorkspaceProps) {
  const { nodes, context, addNode, connectNodes, focusOnNode, findRelatedNodes } = useAdaptiveCanvasStore()
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  // Initialize sample nodes
  useEffect(() => {
    if (nodes.size === 0) {
      // Income node
      const incomeNode: SemanticNode = {
        id: 'income_main',
        type: 'data',
        content: { title: '月収', amount: 500000, category: 'income' },
        position: { x: -3, y: 2, z: 0 },
        connections: [],
        relevance: 0.8,
        morphState: 'card',
        temporalPosition: 0,
        semanticTags: ['income', 'monthly', 'salary'],
        lastAccessed: Date.now(),
        accessFrequency: 10
      }

      // Expense node
      const expenseNode: SemanticNode = {
        id: 'expense_main',
        type: 'data',
        content: { title: '月間支出', amount: 350000, category: 'expense' },
        position: { x: 3, y: 2, z: 0 },
        connections: [],
        relevance: 0.7,
        morphState: 'chart',
        temporalPosition: 0,
        semanticTags: ['expense', 'monthly', 'spending'],
        lastAccessed: Date.now(),
        accessFrequency: 8
      }

      // Savings goal
      const savingsGoal: SemanticNode = {
        id: 'goal_savings',
        type: 'goal',
        content: { title: '年間貯蓄目標', target: 2000000, current: 800000 },
        position: { x: 0, y: 4, z: -2 },
        connections: [],
        relevance: 0.9,
        morphState: 'timeline',
        temporalPosition: 50,
        semanticTags: ['goal', 'savings', 'future'],
        lastAccessed: Date.now(),
        accessFrequency: 5
      }

      // Investment node
      const investmentNode: SemanticNode = {
        id: 'investment_portfolio',
        type: 'data',
        content: { title: '投資ポートフォリオ', value: 1500000, growth: 0.12 },
        position: { x: -2, y: -1, z: 1 },
        connections: [],
        relevance: 0.6,
        morphState: 'spatial',
        temporalPosition: 20,
        semanticTags: ['investment', 'portfolio', 'growth'],
        lastAccessed: Date.now() - 86400000,
        accessFrequency: 3
      }

      // Tax insight
      const taxInsight: SemanticNode = {
        id: 'insight_tax',
        type: 'insight',
        content: { title: '節税可能額', amount: 150000, description: 'ふるさと納税活用' },
        position: { x: 2, y: -1, z: -1 },
        connections: [],
        relevance: 0.5,
        morphState: 'text',
        temporalPosition: -30,
        semanticTags: ['tax', 'optimization', 'insight'],
        lastAccessed: Date.now() - 172800000,
        accessFrequency: 2
      }

      addNode(incomeNode)
      addNode(expenseNode)
      addNode(savingsGoal)
      addNode(investmentNode)
      addNode(taxInsight)

      // Create connections
      connectNodes('income_main', 'expense_main')
      connectNodes('income_main', 'goal_savings')
      connectNodes('expense_main', 'goal_savings')
      connectNodes('investment_portfolio', 'goal_savings')
      connectNodes('income_main', 'insight_tax')
    }
  }, [])

  const nodeArray = Array.from(nodes.values())

  // Calculate positions based on layout
  const getNodePosition = (node: SemanticNode, index: number): THREE.Vector3 => {
    switch (layout) {
      case 'timeline':
        return new THREE.Vector3(
          node.temporalPosition / 10,
          (index - nodeArray.length / 2) * 0.5,
          0
        )
      case 'layers':
        const layer = node.type === 'goal' ? 2 : node.type === 'insight' ? 1 : 0
        return new THREE.Vector3(
          (index - nodeArray.length / 2) * 2,
          layer * 2,
          -layer
        )
      case 'constellation':
        const theta = (index / nodeArray.length) * Math.PI * 2
        const radius = 3 + node.relevance * 2
        return new THREE.Vector3(
          Math.cos(theta) * radius,
          Math.sin(theta) * radius,
          (Math.random() - 0.5) * 2
        )
      case 'graph':
      default:
        return new THREE.Vector3(node.position.x, node.position.y, node.position.z)
    }
  }

  useFrame((state) => {
    if (!groupRef.current) return

    // Gentle rotation for constellation layout
    if (layout === 'constellation') {
      groupRef.current.rotation.y += 0.001
    }

    // Pulse effect for high relevance nodes
    nodeArray.forEach((node, i) => {
      if (node.relevance > 0.7) {
        const mesh = groupRef.current?.children[i] as THREE.Mesh
        if (mesh) {
          const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05
          mesh.scale.setScalar(scale)
        }
      }
    })
  })

  return (
    <group ref={groupRef}>
      {/* Render nodes */}
      {nodeArray.map((node, index) => {
        const position = getNodePosition(node, index)
        const isActive = context.focusArea && node.semanticTags.includes(context.focusArea)

        return (
          <group key={node.id} position={position}>
            {/* Node visualization based on type */}
            <NodeVisualization
              node={node}
              isActive={!!isActive}
              onClick={() => focusOnNode(node.id)}
            />

            {/* Node label */}
            <Text
              position={[0, -0.8, 0]}
              fontSize={0.2}
              color={isActive ? '#a78bfa' : '#9ca3af'}
              anchorX="center"
              anchorY="middle"
            >
              {node.content.title || node.id}
            </Text>

            {/* Relevance indicator */}
            {node.relevance > 0.5 && (
              <Sphere
                args={[0.05, 8, 8]}
                position={[0.5, 0.5, 0]}
              >
                <meshBasicMaterial
                  color={`hsl(${node.relevance * 120}, 100%, 50%)`}
                  transparent
                  opacity={0.8}
                />
              </Sphere>
            )}
          </group>
        )
      })}

      {/* Render connections */}
      {nodeArray.map((node) =>
        node.connections.map((connectedId) => {
          const targetNode = nodes.get(connectedId)
          if (!targetNode) return null

          const startPos = getNodePosition(node, nodeArray.indexOf(node))
          const endPos = getNodePosition(targetNode, nodeArray.indexOf(targetNode))

          return (
            <Line
              key={`${node.id}-${connectedId}`}
              points={[startPos, endPos]}
              color="#4b5563"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          )
        })
      )}

      {/* Semantic clusters visualization */}
      {layout === 'graph' && renderSemanticClusters(nodeArray)}
    </group>
  )
}

function NodeVisualization({ node, isActive, onClick }: {
  node: SemanticNode
  isActive: boolean
  onClick: () => void
}) {
  const color = getNodeColor(node)

  switch (node.type) {
    case 'goal':
      return (
        <Cone
          args={[0.3, 0.6, 8]}
          onClick={onClick}
        >
          <meshPhongMaterial
            color={color}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.3 : 0}
            transparent
            opacity={0.8 + node.relevance * 0.2}
          />
        </Cone>
      )

    case 'insight':
      return (
        <Box
          args={[0.4, 0.4, 0.4]}
          onClick={onClick}
        >
          <meshPhongMaterial
            color={color}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.3 : 0}
            transparent
            opacity={0.8 + node.relevance * 0.2}
            wireframe={true}
          />
        </Box>
      )

    case 'action':
      return (
        <Sphere
          args={[0.35, 16, 16]}
          onClick={onClick}
        >
          <meshStandardMaterial
            color={color}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.3 : 0}
            transparent
            opacity={0.8 + node.relevance * 0.2}
            roughness={0.3}
            metalness={0.7}
          />
        </Sphere>
      )

    case 'data':
    default:
      return (
        <Sphere
          args={[0.4, 16, 16]}
          onClick={onClick}
        >
          <meshPhongMaterial
            color={color}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.3 : 0}
            transparent
            opacity={0.8 + node.relevance * 0.2}
          />
        </Sphere>
      )
  }
}

function getNodeColor(node: SemanticNode): string {
  // Color based on semantic tags
  if (node.semanticTags.includes('income')) return '#10b981'
  if (node.semanticTags.includes('expense')) return '#ef4444'
  if (node.semanticTags.includes('investment')) return '#3b82f6'
  if (node.semanticTags.includes('tax')) return '#f59e0b'
  if (node.semanticTags.includes('goal')) return '#a78bfa'
  if (node.semanticTags.includes('savings')) return '#06b6d4'

  // Default by type
  const typeColors = {
    data: '#6b7280',
    insight: '#fbbf24',
    action: '#ec4899',
    goal: '#8b5cf6',
    memory: '#64748b'
  }

  return typeColors[node.type] || '#9ca3af'
}

function renderSemanticClusters(nodes: SemanticNode[]) {
  // Group nodes by primary semantic tag
  const clusters = new Map<string, SemanticNode[]>()

  nodes.forEach(node => {
    const primaryTag = node.semanticTags[0]
    if (primaryTag) {
      if (!clusters.has(primaryTag)) {
        clusters.set(primaryTag, [])
      }
      clusters.get(primaryTag)!.push(node)
    }
  })

  return Array.from(clusters.entries()).map(([tag, clusterNodes]) => {
    if (clusterNodes.length < 2) return null

    // Calculate cluster center
    const center = clusterNodes.reduce(
      (acc, node) => ({
        x: acc.x + node.position.x / clusterNodes.length,
        y: acc.y + node.position.y / clusterNodes.length,
        z: acc.z + node.position.z / clusterNodes.length
      }),
      { x: 0, y: 0, z: 0 }
    )

    // Calculate cluster radius
    const radius = Math.max(...clusterNodes.map(node =>
      Math.sqrt(
        Math.pow(node.position.x - center.x, 2) +
        Math.pow(node.position.y - center.y, 2) +
        Math.pow(node.position.z - center.z, 2)
      )
    )) + 1

    return (
      <Sphere
        key={tag}
        args={[radius, 16, 16]}
        position={[center.x, center.y, center.z]}
      >
        <meshBasicMaterial
          color={getNodeColor(clusterNodes[0])}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    )
  })
}