'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'
import { Activity, TrendingUp, AlertCircle, Clock, Zap, Heart } from 'lucide-react'

export function AmbientDisplay() {
  const { ambientData, context, preferences } = useAdaptiveCanvasStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return 'おやすみなさい'
    if (hour < 12) return 'おはようございます'
    if (hour < 17) return 'こんにちは'
    if (hour < 21) return 'こんばんは'
    return 'お疲れ様です'
  }

  const getHealthIcon = () => {
    if (ambientData.financialHealth > 70) return '🟢'
    if (ambientData.financialHealth > 40) return '🟡'
    return '🔴'
  }

  return (
    <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none">
      <div className="h-full bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* Left: Time and greeting */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="text-white">
              <div className="text-2xl font-light">
                {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-gray-400">{getGreeting()}</div>
            </div>

            {/* Market status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  ambientData.marketStatus === 'open'
                    ? 'bg-green-500 animate-pulse'
                    : ambientData.marketStatus === 'pre'
                    ? 'bg-yellow-500'
                    : ambientData.marketStatus === 'after'
                    ? 'bg-purple-500'
                    : 'bg-gray-500'
                }`}
              />
              <span className="text-xs text-gray-400">
                {ambientData.marketStatus === 'open'
                  ? 'マーケット開場中'
                  : ambientData.marketStatus === 'pre'
                  ? 'プレマーケット'
                  : ambientData.marketStatus === 'after'
                  ? 'アフターマーケット'
                  : 'マーケット休場'}
              </span>
            </div>
          </motion.div>

          {/* Center: Financial health and alerts */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            {/* Financial health meter */}
            <div className="flex items-center gap-2">
              <Heart className="text-gray-400" size={16} />
              <div className="flex items-center gap-1">
                <span className="text-white text-sm">Financial Health</span>
                <div className="w-32 h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      ambientData.financialHealth > 70
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : ambientData.financialHealth > 40
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${ambientData.financialHealth}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
                <span className="text-sm">{getHealthIcon()}</span>
              </div>
            </div>

            {/* Alert indicator */}
            <AnimatePresence>
              {ambientData.alertLevel !== 'none' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <AlertCircle
                    className={
                      ambientData.alertLevel === 'high'
                        ? 'text-red-500'
                        : ambientData.alertLevel === 'medium'
                        ? 'text-yellow-500'
                        : 'text-blue-500'
                    }
                    size={16}
                  />
                  <span className="text-xs text-gray-400">
                    {ambientData.alertLevel === 'high'
                      ? '重要な通知があります'
                      : ambientData.alertLevel === 'medium'
                      ? '確認事項があります'
                      : 'お知らせ'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Context indicators */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* Next event */}
            {ambientData.nextImportantEvent && (
              <div className="flex items-center gap-2">
                <Clock className="text-gray-400" size={16} />
                <div className="text-right">
                  <div className="text-xs text-gray-400">次のイベント</div>
                  <div className="text-sm text-white">{ambientData.nextImportantEvent.title}</div>
                </div>
              </div>
            )}

            {/* Activity indicator */}
            <div className="flex items-center gap-2">
              <Activity className="text-purple-400" size={16} />
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">モード</span>
                <span className="text-xs text-purple-300">{context.currentMood}</span>
              </div>
            </div>

            {/* Time frame indicator */}
            <div className="flex items-center gap-1">
              {context.timeFrame === 'past' && (
                <div className="px-2 py-1 bg-blue-500/20 rounded-lg text-blue-300 text-xs">過去</div>
              )}
              {context.timeFrame === 'present' && (
                <div className="px-2 py-1 bg-green-500/20 rounded-lg text-green-300 text-xs">現在</div>
              )}
              {context.timeFrame === 'future' && (
                <div className="px-2 py-1 bg-purple-500/20 rounded-lg text-purple-300 text-xs">未来</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}