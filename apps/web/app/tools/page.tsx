'use client'

import { useState } from 'react'
import {
  Calculator,
  Camera,
  FileText,
  TrendingUp,
  DollarSign,
  Receipt,
  PieChart,
  Calendar,
  Download
} from 'lucide-react'
import { motion } from 'framer-motion'

const tools = [
  {
    icon: Calculator,
    title: '税金シミュレーター',
    description: '収入から税額を自動計算',
    color: 'bg-blue-500',
    badge: 'おすすめ',
    action: 'simulate'
  },
  {
    icon: Camera,
    title: '経費スキャナー',
    description: '領収書を撮影してAI判定',
    color: 'bg-green-500',
    badge: '人気',
    action: 'scan'
  },
  {
    icon: FileText,
    title: '確定申告診断',
    description: '申告が必要か3分で診断',
    color: 'bg-purple-500',
    action: 'diagnose'
  },
  {
    icon: TrendingUp,
    title: '節税チェッカー',
    description: '使える控除を自動発見',
    color: 'bg-orange-500',
    action: 'check'
  },
  {
    icon: Receipt,
    title: '経費管理表',
    description: 'カテゴリ別に自動集計',
    color: 'bg-pink-500',
    action: 'manage'
  },
  {
    icon: PieChart,
    title: '税金レポート',
    description: '年間の税金を可視化',
    color: 'bg-indigo-500',
    action: 'report'
  },
]

const downloadableTools = [
  {
    icon: FileText,
    title: '確定申告チェックリスト',
    format: 'PDF',
    size: '245KB'
  },
  {
    icon: Calculator,
    title: '経費計算テンプレート',
    format: 'Excel',
    size: '128KB'
  },
  {
    icon: Calendar,
    title: '税務カレンダー2025',
    format: 'PDF',
    size: '512KB'
  },
]

export default function ToolsPage() {
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null)

  const handleToolClick = (action: string) => {
    setActiveToolModal(action)
    // ここでモーダルを開くか、別ページに遷移
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ツール
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            税金計算や管理に便利なツール
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Interactive Tools */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            シミュレーター・診断
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <motion.button
                  key={tool.title}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToolClick(tool.action)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl hover:shadow-lg dark:hover:bg-gray-700 transition-all text-left relative"
                >
                  {tool.badge && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {tool.badge}
                    </span>
                  )}
                  <div className={`${tool.color} p-3 rounded-lg inline-block mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tool.description}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Quick Calculator */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-3">
            ⚡ クイック計算
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                年収（万円）
              </label>
              <input
                type="number"
                placeholder="500"
                className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                経費（万円）
              </label>
              <input
                type="number"
                placeholder="100"
                className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium">
              税額を計算
            </button>
          </div>
        </section>

        {/* Downloadable Resources */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            ダウンロード資料
          </h2>
          <div className="space-y-2">
            {downloadableTools.map((resource) => {
              const Icon = resource.icon
              return (
                <div
                  key={resource.title}
                  className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {resource.format} • {resource.size}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Download className="w-5 h-5 text-blue-500" />
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}