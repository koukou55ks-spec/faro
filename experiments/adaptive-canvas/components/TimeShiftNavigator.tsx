'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, History } from 'lucide-react'

export function TimeShiftNavigator() {
  const { context, timeTravel, setTimeFrame } = useAdaptiveCanvasStore()
  const [isDragging, setIsDragging] = useState(false)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  const timeMarkers = [
    { position: -100, label: '1年前', icon: History },
    { position: -50, label: '6ヶ月前', icon: History },
    { position: 0, label: '現在', icon: Calendar },
    { position: 50, label: '6ヶ月後', icon: TrendingUp },
    { position: 100, label: '1年後', icon: TrendingUp }
  ]

  const handleDrag = (event: any, info: PanInfo) => {
    if (!containerRef.current) return
    const width = containerRef.current.offsetWidth
    const newPosition = Math.max(-100, Math.min(100, (info.point.x / width) * 200 - 100))
    timeTravel(newPosition)
  }

  // Get contextual data based on time position
  const getTimeContextData = () => {
    if (context.timePosition < -33) {
      return {
        color: 'from-blue-600 to-blue-400',
        label: '過去の分析',
        description: '実績データと履歴を確認'
      }
    } else if (context.timePosition > 33) {
      return {
        color: 'from-purple-600 to-pink-400',
        label: '将来計画',
        description: 'シミュレーションと予測'
      }
    }
    return {
      color: 'from-green-600 to-emerald-400',
      label: '現在の状況',
      description: 'リアルタイムデータ'
    }
  }

  const timeContext = getTimeContextData()

  return (
    <div className="relative h-32 bg-black/30 backdrop-blur-xl border-t border-white/10">
      <div className="absolute inset-0 p-4">
        {/* Time context header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${timeContext.color}`} />
            <h3 className="text-white font-medium">{timeContext.label}</h3>
            <span className="text-gray-400 text-sm">{timeContext.description}</span>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFrame('past')}
              className={`px-3 py-1 rounded-lg text-sm ${
                context.timeFrame === 'past'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              過去
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFrame('present')}
              className={`px-3 py-1 rounded-lg text-sm ${
                context.timeFrame === 'present'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              現在
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFrame('future')}
              className={`px-3 py-1 rounded-lg text-sm ${
                context.timeFrame === 'future'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              未来
            </motion.button>
          </div>
        </div>

        {/* Timeline slider */}
        <div ref={containerRef} className="relative h-16">
          {/* Timeline track */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2">
            {/* Gradient fill showing current position */}
            <motion.div
              className={`absolute top-0 h-full bg-gradient-to-r ${timeContext.color}`}
              style={{
                left: context.timePosition < 0 ? `${50 + context.timePosition / 2}%` : '50%',
                right: context.timePosition > 0 ? `${50 - context.timePosition / 2}%` : '50%'
              }}
            />
          </div>

          {/* Time markers */}
          {timeMarkers.map((marker) => {
            const Icon = marker.icon
            const isActive = Math.abs(context.timePosition - marker.position) < 10
            return (
              <motion.div
                key={marker.position}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${50 + marker.position / 2}%` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (marker.position + 100) / 400 }}
              >
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => timeTravel(marker.position)}
                  className={`-translate-x-1/2 flex flex-col items-center gap-1 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-xs whitespace-nowrap">{marker.label}</span>
                  {marker.position === 0 && (
                    <div className="absolute -bottom-2 w-1 h-4 bg-white/50" />
                  )}
                </motion.button>
              </motion.div>
            )
          })}

          {/* Draggable handle */}
          <motion.div
            drag="x"
            dragConstraints={containerRef}
            dragElastic={0.1}
            onDrag={handleDrag}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            animate={controls}
            className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{ left: `${50 + context.timePosition / 2}%` }}
          >
            <motion.div
              animate={{
                scale: isDragging ? 1.5 : 1,
                boxShadow: isDragging
                  ? '0 0 20px rgba(255,255,255,0.5)'
                  : '0 0 10px rgba(255,255,255,0.3)'
              }}
              className={`w-6 h-6 -translate-x-1/2 rounded-full bg-gradient-to-r ${timeContext.color} border-2 border-white`}
            >
              {/* Pulse animation */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${timeContext.color}`}
              />
            </motion.div>
          </motion.div>

          {/* Quick navigation arrows */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => timeTravel(Math.max(-100, context.timePosition - 10))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => timeTravel(Math.min(100, context.timePosition + 10))}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>

        {/* Time position indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          {context.timePosition === 0
            ? '現在'
            : context.timePosition < 0
            ? `${Math.abs(Math.round(context.timePosition / 100 * 365))}日前`
            : `${Math.round(context.timePosition / 100 * 365)}日後`}
        </div>
      </div>
    </div>
  )
}