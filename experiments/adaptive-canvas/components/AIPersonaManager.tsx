'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'
import { Users, X, Plus, MessageCircle, Brain, TrendingUp } from 'lucide-react'

export function AIPersonaManager() {
  const { personas, context, activatePersona, deactivatePersona } = useAdaptiveCanvasStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const personaArray = Array.from(personas.values())
  const activePersonas = context.activePersonas.map(id => personas.get(id)).filter(Boolean)

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/25"
      >
        <Users className="text-white" size={24} />
        {activePersonas.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {activePersonas.length}
          </motion.div>
        )}
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Brain className="text-purple-400" size={20} />
                <h3 className="text-white font-medium">AIペルソナ</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded hover:bg-white/10"
              >
                <X size={16} className="text-gray-400" />
              </motion.button>
            </div>

            {/* Persona list */}
            <div className="p-4 space-y-3">
              {personaArray.map((persona) => {
                const isActive = context.activePersonas.includes(persona.id)

                return (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-purple-500/20 border-purple-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{persona.avatar}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{persona.name}</h4>
                          <p className="text-gray-400 text-xs mt-1">
                            {persona.specialties.join('、')}
                          </p>

                          {/* Personality traits */}
                          <div className="flex gap-2 mt-2">
                            <PersonalityBar
                              label="形式"
                              value={persona.personality.formality}
                              color="blue"
                            />
                            <PersonalityBar
                              label="積極"
                              value={persona.personality.proactivity}
                              color="green"
                            />
                            <PersonalityBar
                              label="詳細"
                              value={persona.personality.detailOrientation}
                              color="purple"
                            />
                          </div>

                          {/* Status */}
                          {isActive && (
                            <div className="flex items-center gap-2 mt-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  persona.status === 'speaking'
                                    ? 'bg-green-500 animate-pulse'
                                    : persona.status === 'thinking'
                                    ? 'bg-yellow-500 animate-pulse'
                                    : persona.status === 'listening'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                              <span className="text-xs text-gray-400">
                                {persona.status === 'speaking'
                                  ? '話しています'
                                  : persona.status === 'thinking'
                                  ? '考えています'
                                  : persona.status === 'listening'
                                  ? '聞いています'
                                  : '待機中'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Activation toggle */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (isActive) {
                            deactivatePersona(persona.id)
                          } else {
                            activatePersona(persona.id)
                          }
                        }}
                        className={`p-2 rounded-lg ${
                          isActive
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {isActive ? <MessageCircle size={16} /> : <Plus size={16} />}
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Active personas summary */}
            {activePersonas.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <div className="text-xs text-gray-400 mb-2">アクティブなペルソナ</div>
                <div className="flex gap-2 flex-wrap">
                  {activePersonas.map((persona) => (
                    <motion.div
                      key={persona?.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-lg"
                    >
                      <span className="text-sm">{persona?.avatar}</span>
                      <span className="text-xs text-purple-300">{persona?.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborative mode indicator */}
            {activePersonas.length > 1 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t border-purple-500/30"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-purple-400" size={16} />
                  <span className="text-sm text-white">協調モード有効</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  複数の視点から総合的なアドバイスを提供します
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function PersonalityBar({ label, value, color }: {
  label: string
  value: number
  color: 'blue' | 'green' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="flex-1">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          className={colors[color]}
        />
      </div>
    </div>
  )
}