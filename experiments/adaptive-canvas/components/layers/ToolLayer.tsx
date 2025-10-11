'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdaptiveCanvasStore, DynamicTool } from '@/lib/stores/adaptive-canvas-store'
import { Calculator, LineChart, Calendar, GitCompare, Sliders, FileText, X, Maximize2, Minimize2 } from 'lucide-react'

export function ToolLayer() {
  const { tools, context, activateTool, minimizeTool, hideTool, suggestTool } = useAdaptiveCanvasStore()
  const [localTools, setLocalTools] = useState<DynamicTool[]>([])

  // Initialize tools based on context
  useEffect(() => {
    const contextTools: DynamicTool[] = []

    // Calculator tool for expense/income context
    if (context.focusArea === 'expense' || context.focusArea === 'income') {
      contextTools.push({
        id: 'calculator',
        type: 'calculator',
        relevance: 0.9,
        position: { x: 100, y: 200 },
        state: 'suggested',
        config: {}
      })
    }

    // Chart tool for investment context
    if (context.focusArea === 'investment' || context.timeFrame === 'future') {
      contextTools.push({
        id: 'chart',
        type: 'chart',
        relevance: 0.8,
        position: { x: 300, y: 150 },
        state: 'suggested',
        config: { chartType: 'line' }
      })
    }

    // Timeline for planning
    if (context.currentMood === 'planning') {
      contextTools.push({
        id: 'timeline',
        type: 'timeline',
        relevance: 0.7,
        position: { x: 500, y: 200 },
        state: 'suggested',
        config: {}
      })
    }

    setLocalTools(contextTools)
  }, [context])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {localTools.map((tool) => (
          <DraggableTool key={tool.id} tool={tool} />
        ))}
      </AnimatePresence>

      {/* Suggested tools dock */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto"
      >
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
          <div className="space-y-2">
            {localTools
              .filter(t => t.state === 'suggested')
              .map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => activateTool(tool.id)}
                  className="relative p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <ToolIcon type={tool.type} />
                  {tool.relevance > 0.7 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function DraggableTool({ tool }: { tool: DynamicTool }) {
  const { activateTool, minimizeTool, hideTool } = useAdaptiveCanvasStore()
  const [position, setPosition] = useState(tool.position)
  const [isDragging, setIsDragging] = useState(false)

  if (tool.state === 'hidden' || tool.state === 'suggested') return null

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false)
        setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y })
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: tool.state === 'minimized' ? 0.7 : 1,
        scale: tool.state === 'minimized' ? 0.8 : 1,
        x: position.x,
        y: position.y
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="absolute pointer-events-auto"
      style={{ zIndex: isDragging ? 1000 : 100 }}
    >
      <div
        className={`bg-black/40 backdrop-blur-2xl rounded-2xl border transition-all ${
          isDragging ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-white/10'
        } ${tool.state === 'minimized' ? 'w-16 h-16' : 'w-80'}`}
      >
        {/* Tool header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ToolIcon type={tool.type} />
            {tool.state !== 'minimized' && (
              <span className="text-white text-sm font-medium">{getToolName(tool.type)}</span>
            )}
          </div>
          {tool.state !== 'minimized' && (
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => minimizeTool(tool.id)}
                className="p-1 rounded hover:bg-white/10"
              >
                <Minimize2 size={14} className="text-gray-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => hideTool(tool.id)}
                className="p-1 rounded hover:bg-white/10"
              >
                <X size={14} className="text-gray-400" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Tool content */}
        {tool.state === 'active' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
          >
            <ToolContent type={tool.type} config={tool.config} />
          </motion.div>
        )}

        {/* Minimized state - click to expand */}
        {tool.state === 'minimized' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => activateTool(tool.id)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Maximize2 size={16} className="text-gray-400" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

function ToolIcon({ type }: { type: string }) {
  const icons = {
    calculator: Calculator,
    chart: LineChart,
    timeline: Calendar,
    comparison: GitCompare,
    simulator: Sliders,
    form: FileText
  }

  const Icon = icons[type as keyof typeof icons] || FileText
  return <Icon size={18} className="text-purple-400" />
}

function getToolName(type: string): string {
  const names = {
    calculator: '電卓',
    chart: 'チャート',
    timeline: 'タイムライン',
    comparison: '比較ツール',
    simulator: 'シミュレーター',
    form: 'フォーム'
  }
  return names[type as keyof typeof names] || 'ツール'
}

function ToolContent({ type, config }: { type: string; config: any }) {
  switch (type) {
    case 'calculator':
      return <CalculatorTool />
    case 'chart':
      return <ChartTool config={config} />
    case 'timeline':
      return <TimelineTool />
    default:
      return <div className="text-gray-400 text-sm">ツールコンテンツ</div>
  }
}

function CalculatorTool() {
  const [display, setDisplay] = useState('0')

  const buttons = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ]

  return (
    <div className="space-y-3">
      <div className="bg-black/30 rounded-lg p-3">
        <div className="text-right text-2xl text-white font-mono">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <motion.button
            key={btn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white"
          >
            {btn}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function ChartTool({ config }: { config: any }) {
  return (
    <div className="space-y-3">
      <div className="h-32 bg-black/20 rounded-lg p-2">
        <div className="flex items-end justify-around h-full gap-1">
          {[30, 45, 60, 40, 70, 55, 80].map((height, i) => (
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
      <div className="flex justify-between text-xs text-gray-400">
        <span>月</span>
        <span>火</span>
        <span>水</span>
        <span>木</span>
        <span>金</span>
        <span>土</span>
        <span>日</span>
      </div>
    </div>
  )
}

function TimelineTool() {
  const events = [
    { date: '今日', event: '支出レビュー', color: 'bg-green-500' },
    { date: '明日', event: '投資判断', color: 'bg-blue-500' },
    { date: '3日後', event: '予算計画', color: 'bg-purple-500' },
    { date: '1週間後', event: '月次レポート', color: 'bg-yellow-500' }
  ]

  return (
    <div className="space-y-2">
      {events.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
        >
          <div className={`w-2 h-2 rounded-full ${item.color}`} />
          <div className="flex-1">
            <div className="text-white text-sm">{item.event}</div>
            <div className="text-gray-500 text-xs">{item.date}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}