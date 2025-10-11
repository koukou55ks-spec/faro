import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import { enableMapSet } from 'immer'

// Enable Map and Set support in Immer
enableMapSet()

// ユーザーのコンテキストタイプ
export type UserContext = {
  timeFrame: 'past' | 'present' | 'future'
  timePosition: number // -100 (deep past) to 100 (far future)
  focusArea: 'income' | 'expense' | 'investment' | 'tax' | 'budget' | 'goals' | null
  semanticDepth: number // 0-100 (概要から詳細へ)
  activePersonas: string[] // 有効なAIペルソナ
  currentMood: 'planning' | 'reviewing' | 'exploring' | 'analyzing'
  interactionHistory: InteractionEvent[]
}

// インタラクションイベント
export type InteractionEvent = {
  timestamp: number
  type: 'chat' | 'tool' | 'navigation' | 'gesture'
  action: string
  metadata?: Record<string, any>
}

// セマンティックノード（情報の意味的単位）
export type SemanticNode = {
  id: string
  type: 'data' | 'insight' | 'action' | 'goal' | 'memory'
  content: any
  position: { x: number; y: number; z: number }
  connections: string[] // 関連ノードのID
  relevance: number // 現在のコンテキストとの関連度 0-1
  morphState: 'text' | 'chart' | 'card' | 'spatial' | 'timeline'
  temporalPosition: number // 時間軸上の位置 -100 to 100
  semanticTags: string[]
  lastAccessed: number
  accessFrequency: number
}

// レイヤー状態
export type LayerVisibility = {
  context: number // 0-1 opacity
  conversation: number
  tools: number
}

// AIペルソナ
export type AIPersona = {
  id: string
  name: string
  role: 'tax_advisor' | 'investment_strategist' | 'budget_coach' | 'financial_planner'
  avatar: string
  specialties: string[]
  personality: {
    formality: number // 0-1
    proactivity: number // 0-1
    detailOrientation: number // 0-1
  }
  status: 'idle' | 'thinking' | 'speaking' | 'listening'
  position: { x: number; y: number }
  messages: ChatMessage[]
}

export type ChatMessage = {
  id: string
  personaId: string
  content: string
  timestamp: number
  type: 'text' | 'visualization' | 'tool' | 'suggestion'
  metadata?: any
}

// 動的ツール
export type DynamicTool = {
  id: string
  type: 'calculator' | 'chart' | 'timeline' | 'comparison' | 'simulator' | 'form'
  relevance: number // コンテキストとの関連度
  position: { x: number; y: number }
  state: 'hidden' | 'suggested' | 'active' | 'minimized'
  config: Record<string, any>
}

// ユーザー設定学習
export type LearnedPreferences = {
  frequentTools: Map<string, number>
  preferredVisualizationTypes: Map<string, number>
  interactionPatterns: Map<string, number>
  vocabularyLevel: 'beginner' | 'intermediate' | 'expert'
  customCategories: Map<string, string[]>
  timePreferences: {
    planningHorizon: number // days
    reviewFrequency: number // days
    preferredUpdateTime: string // HH:mm
  }
}

// ジェスチャー設定
export type GestureConfig = {
  swipeThreshold: number
  pinchSensitivity: number
  longPressDelay: number
  shakeIntensity: number
  enabled: boolean
}

// メインストア
interface AdaptiveCanvasStore {
  // State
  context: UserContext
  nodes: Map<string, SemanticNode>
  layers: LayerVisibility
  personas: Map<string, AIPersona>
  tools: Map<string, DynamicTool>
  preferences: LearnedPreferences
  gestures: GestureConfig

  // 3D空間の状態
  cameraPosition: { x: number; y: number; z: number }
  cameraTarget: { x: number; y: number; z: number }
  spatialLayout: 'graph' | 'timeline' | 'layers' | 'constellation'

  // アンビエント情報
  ambientData: {
    marketStatus: 'open' | 'closed' | 'pre' | 'after'
    alertLevel: 'none' | 'low' | 'medium' | 'high'
    nextImportantEvent: { title: string; time: number } | null
    financialHealth: number // 0-100
  }

  // Actions
  updateContext: (updates: Partial<UserContext>) => void
  addNode: (node: SemanticNode) => void
  updateNode: (id: string, updates: Partial<SemanticNode>) => void
  connectNodes: (id1: string, id2: string) => void

  // Time navigation
  timeTravel: (position: number) => void
  setTimeFrame: (frame: 'past' | 'present' | 'future') => void

  // Persona management
  activatePersona: (personaId: string) => void
  deactivatePersona: (personaId: string) => void
  addPersonaMessage: (personaId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void

  // Tool management
  suggestTool: (toolId: string) => void
  activateTool: (toolId: string, position?: { x: number; y: number }) => void
  minimizeTool: (toolId: string) => void
  hideTool: (toolId: string) => void

  // Learning
  recordInteraction: (event: Omit<InteractionEvent, 'timestamp'>) => void
  learnPreference: (type: string, value: any) => void

  // Spatial navigation
  focusOnNode: (nodeId: string) => void
  changeSpatialLayout: (layout: 'graph' | 'timeline' | 'layers' | 'constellation') => void

  // Layer control
  setLayerVisibility: (layer: keyof LayerVisibility, opacity: number) => void

  // Gesture handling
  handleGesture: (gesture: string, data?: any) => void

  // Semantic operations
  findRelatedNodes: (nodeId: string, depth?: number) => string[]
  calculateRelevance: (nodeId: string) => number
  morphNode: (nodeId: string, newState: SemanticNode['morphState']) => void

  // Ambient updates
  updateAmbientData: (data: Partial<AdaptiveCanvasStore['ambientData']>) => void
}

export const useAdaptiveCanvasStore = create<AdaptiveCanvasStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      context: {
        timeFrame: 'present',
        timePosition: 0,
        focusArea: null,
        semanticDepth: 30,
        activePersonas: [],
        currentMood: 'exploring',
        interactionHistory: []
      },

      nodes: new Map(),
      layers: {
        context: 0.3,
        conversation: 1,
        tools: 0.7
      },

      personas: new Map([
        ['tax_advisor', {
          id: 'tax_advisor',
          name: '税務アドバイザー',
          role: 'tax_advisor',
          avatar: '🧮',
          specialties: ['確定申告', '節税対策', '税務調査'],
          personality: {
            formality: 0.8,
            proactivity: 0.6,
            detailOrientation: 0.9
          },
          status: 'idle',
          position: { x: -100, y: 0 },
          messages: []
        }],
        ['investment_strategist', {
          id: 'investment_strategist',
          name: '投資ストラテジスト',
          role: 'investment_strategist',
          avatar: '📈',
          specialties: ['ポートフォリオ', '資産配分', 'リスク管理'],
          personality: {
            formality: 0.7,
            proactivity: 0.8,
            detailOrientation: 0.7
          },
          status: 'idle',
          position: { x: 100, y: 0 },
          messages: []
        }],
        ['budget_coach', {
          id: 'budget_coach',
          name: '家計コーチ',
          role: 'budget_coach',
          avatar: '💰',
          specialties: ['節約', '予算管理', '支出最適化'],
          personality: {
            formality: 0.3,
            proactivity: 0.9,
            detailOrientation: 0.5
          },
          status: 'idle',
          position: { x: 0, y: -100 },
          messages: []
        }]
      ]),

      tools: new Map(),

      preferences: {
        frequentTools: new Map(),
        preferredVisualizationTypes: new Map(),
        interactionPatterns: new Map(),
        vocabularyLevel: 'intermediate',
        customCategories: new Map(),
        timePreferences: {
          planningHorizon: 30,
          reviewFrequency: 7,
          preferredUpdateTime: '09:00'
        }
      },

      gestures: {
        swipeThreshold: 50,
        pinchSensitivity: 0.5,
        longPressDelay: 500,
        shakeIntensity: 5,
        enabled: true
      },

      cameraPosition: { x: 0, y: 0, z: 5 },
      cameraTarget: { x: 0, y: 0, z: 0 },
      spatialLayout: 'graph',

      ambientData: {
        marketStatus: 'closed',
        alertLevel: 'none',
        nextImportantEvent: null,
        financialHealth: 75
      },

      // Actions implementation
      updateContext: (updates) => set((state) => {
        Object.assign(state.context, updates)
      }),

      addNode: (node) => set((state) => {
        state.nodes.set(node.id, node)
      }),

      updateNode: (id, updates) => set((state) => {
        const node = state.nodes.get(id)
        if (node) {
          Object.assign(node, updates)
        }
      }),

      connectNodes: (id1, id2) => set((state) => {
        const node1 = state.nodes.get(id1)
        const node2 = state.nodes.get(id2)
        if (node1 && node2) {
          if (!node1.connections.includes(id2)) {
            node1.connections.push(id2)
          }
          if (!node2.connections.includes(id1)) {
            node2.connections.push(id1)
          }
        }
      }),

      timeTravel: (position) => set((state) => {
        state.context.timePosition = position
        state.context.timeFrame = position < -33 ? 'past' : position > 33 ? 'future' : 'present'

        // Update node relevance based on temporal position
        state.nodes.forEach(node => {
          const timeDiff = Math.abs(node.temporalPosition - position)
          node.relevance = Math.max(0, 1 - timeDiff / 100)
        })
      }),

      setTimeFrame: (frame) => set((state) => {
        state.context.timeFrame = frame
        state.context.timePosition = frame === 'past' ? -50 : frame === 'future' ? 50 : 0
      }),

      activatePersona: (personaId) => set((state) => {
        if (!state.context.activePersonas.includes(personaId)) {
          state.context.activePersonas.push(personaId)
        }
        const persona = state.personas.get(personaId)
        if (persona) {
          persona.status = 'listening'
        }
      }),

      deactivatePersona: (personaId) => set((state) => {
        state.context.activePersonas = state.context.activePersonas.filter(id => id !== personaId)
        const persona = state.personas.get(personaId)
        if (persona) {
          persona.status = 'idle'
        }
      }),

      addPersonaMessage: (personaId, message) => set((state) => {
        const persona = state.personas.get(personaId)
        if (persona) {
          persona.messages.push({
            ...message,
            id: `${personaId}_${Date.now()}`,
            timestamp: Date.now()
          })
        }
      }),

      suggestTool: (toolId) => set((state) => {
        const tool = state.tools.get(toolId)
        if (tool && tool.state === 'hidden') {
          tool.state = 'suggested'
          tool.relevance = 0.8
        }
      }),

      activateTool: (toolId, position) => set((state) => {
        const tool = state.tools.get(toolId)
        if (tool) {
          tool.state = 'active'
          if (position) {
            tool.position = position
          }
        }
      }),

      minimizeTool: (toolId) => set((state) => {
        const tool = state.tools.get(toolId)
        if (tool) {
          tool.state = 'minimized'
        }
      }),

      hideTool: (toolId) => set((state) => {
        const tool = state.tools.get(toolId)
        if (tool) {
          tool.state = 'hidden'
        }
      }),

      recordInteraction: (event) => set((state) => {
        state.context.interactionHistory.push({
          ...event,
          timestamp: Date.now()
        })

        // Keep only last 100 interactions
        if (state.context.interactionHistory.length > 100) {
          state.context.interactionHistory.shift()
        }
      }),

      learnPreference: (type, value) => set((state) => {
        // Implementation depends on preference type
        // This is where ML would come in
      }),

      focusOnNode: (nodeId) => set((state) => {
        const node = state.nodes.get(nodeId)
        if (node) {
          state.cameraTarget = { ...node.position }
          // Animate camera movement would happen in the component
        }
      }),

      changeSpatialLayout: (layout) => set((state) => {
        state.spatialLayout = layout
        // Recalculate node positions based on new layout
        // This would trigger a re-render with new positions
      }),

      setLayerVisibility: (layer, opacity) => set((state) => {
        state.layers[layer] = Math.max(0, Math.min(1, opacity))
      }),

      handleGesture: (gesture, data) => {
        const state = get()

        switch (gesture) {
          case 'swipe-left':
            state.timeTravel(Math.max(-100, state.context.timePosition - 20))
            break
          case 'swipe-right':
            state.timeTravel(Math.min(100, state.context.timePosition + 20))
            break
          case 'pinch':
            state.updateContext({ semanticDepth: Math.max(0, Math.min(100, data.scale * state.context.semanticDepth)) })
            break
          case 'shake':
            // Show urgent items
            state.updateAmbientData({ alertLevel: 'high' })
            break
        }
      },

      findRelatedNodes: (nodeId, depth = 1) => {
        const visited = new Set<string>()
        const queue = [{ id: nodeId, depth: 0 }]
        const related: string[] = []

        while (queue.length > 0) {
          const { id, depth: currentDepth } = queue.shift()!

          if (visited.has(id) || currentDepth > depth) continue
          visited.add(id)

          const node = get().nodes.get(id)
          if (node && id !== nodeId) {
            related.push(id)
          }

          if (node && currentDepth < depth) {
            node.connections.forEach(connectedId => {
              queue.push({ id: connectedId, depth: currentDepth + 1 })
            })
          }
        }

        return related
      },

      calculateRelevance: (nodeId) => {
        const state = get()
        const node = state.nodes.get(nodeId)
        if (!node) return 0

        let relevance = 0.5 // Base relevance

        // Time relevance
        const timeDiff = Math.abs(node.temporalPosition - state.context.timePosition)
        relevance += (1 - timeDiff / 100) * 0.2

        // Semantic relevance
        if (state.context.focusArea && node.semanticTags.includes(state.context.focusArea)) {
          relevance += 0.3
        }

        // Access frequency
        relevance += Math.min(0.2, node.accessFrequency / 100)

        // Recency
        const hoursSinceAccess = (Date.now() - node.lastAccessed) / (1000 * 60 * 60)
        relevance += Math.max(0, 0.1 - hoursSinceAccess / 168) // 1 week decay

        return Math.min(1, relevance)
      },

      morphNode: (nodeId, newState) => set((state) => {
        const node = state.nodes.get(nodeId)
        if (node) {
          node.morphState = newState
        }
      }),

      updateAmbientData: (data) => set((state) => {
        Object.assign(state.ambientData, data)
      })
    }))
  )
)