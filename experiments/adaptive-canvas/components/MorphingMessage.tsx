'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Calculator, FileText, Layers } from 'lucide-react'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'

interface MorphingMessageProps {
  content: string
  context: any
  personaName?: string
}

export function MorphingMessage({ content, context, personaName }: MorphingMessageProps) {
  const [morphState, setMorphState] = useState<'text' | 'chart' | 'card' | 'timeline'>('text')
  const { recordInteraction } = useAdaptiveCanvasStore()

  // Automatically morph based on content and context
  useEffect(() => {
    const determineState = () => {
      if (content.includes('グラフ') || content.includes('推移') || content.includes('傾向')) {
        return 'chart'
      }
      if (content.includes('計画') || content.includes('スケジュール') || context.timeFrame === 'future') {
        return 'timeline'
      }
      if (content.includes('詳細') || content.includes('内訳')) {
        return 'card'
      }
      return 'text'
    }

    const newState = determineState()
    if (newState !== morphState) {
      setTimeout(() => setMorphState(newState), 2000)
    }
  }, [content, context, morphState])

  const handleMorphClick = (newState: typeof morphState) => {
    setMorphState(newState)
    recordInteraction({
      type: 'tool',
      action: 'message_morph',
      metadata: { from: morphState, to: newState }
    })
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {morphState === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10"
          >
            <p className="text-gray-100">{content}</p>
          </motion.div>
        )}

        {morphState === 'chart' && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="text-purple-400" size={20} />
              <span className="text-white font-medium">データビジュアライゼーション</span>
            </div>
            <div className="h-32 bg-black/20 rounded-xl p-2">
              {/* Simulated chart */}
              <div className="flex items-end justify-around h-full gap-1">
                {[40, 65, 45, 70, 85, 60, 75].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300 text-sm mt-2">{content}</p>
          </motion.div>
        )}

        {morphState === 'card' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="text-blue-400" size={20} />
              <span className="text-white font-medium">詳細情報カード</span>
            </div>
            <div className="space-y-2">
              {['収入', '支出', '貯蓄', '投資'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-gray-300">{item}</span>
                  <span className="text-white font-medium">
                    ¥{Math.floor(Math.random() * 500000).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
            <p className="text-gray-300 text-sm mt-3">{content}</p>
          </motion.div>
        )}

        {morphState === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-green-400" size={20} />
              <span className="text-white font-medium">タイムライン</span>
            </div>
            <div className="space-y-2">
              {['現在', '3ヶ月後', '6ヶ月後', '1年後'].map((time, i) => (
                <motion.div
                  key={time}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <div className="flex-1 h-px bg-green-400/30" />
                  <span className="text-gray-300 text-sm">{time}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-gray-300 text-sm mt-3">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morph controls */}
      <div className="absolute -right-12 top-0 flex flex-col gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMorphClick('text')}
          className={`p-1.5 rounded-lg ${
            morphState === 'text' ? 'bg-purple-500/30' : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <FileText size={14} className="text-gray-400" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMorphClick('chart')}
          className={`p-1.5 rounded-lg ${
            morphState === 'chart' ? 'bg-purple-500/30' : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <BarChart3 size={14} className="text-gray-400" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMorphClick('card')}
          className={`p-1.5 rounded-lg ${
            morphState === 'card' ? 'bg-purple-500/30' : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <Layers size={14} className="text-gray-400" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMorphClick('timeline')}
          className={`p-1.5 rounded-lg ${
            morphState === 'timeline' ? 'bg-purple-500/30' : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <TrendingUp size={14} className="text-gray-400" />
        </motion.button>
      </div>
    </div>
  )
}