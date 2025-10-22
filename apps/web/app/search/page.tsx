'use client'

import { useState } from 'react'
import { Search, TrendingUp, Clock, BookOpen, FileText, Calculator } from 'lucide-react'
import { motion } from 'framer-motion'

const categories = [
  { icon: FileText, label: '確定申告', color: 'bg-blue-500' },
  { icon: Calculator, label: '経費・控除', color: 'bg-green-500' },
  { icon: BookOpen, label: '基礎知識', color: 'bg-purple-500' },
  { icon: TrendingUp, label: '節税対策', color: 'bg-orange-500' },
]

const trendingTopics = [
  '医療費控除の計算方法',
  'インボイス制度とは',
  'ふるさと納税の限度額',
  '副業の確定申告',
  '仮想通貨の税金',
]

const recentSearches = [
  '青色申告',
  '住宅ローン控除',
  'iDeCo',
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header with Search Bar */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="税金の疑問を検索..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Categories */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            カテゴリから探す
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category.label)}
                  className={`${category.color} bg-opacity-10 dark:bg-opacity-20 p-4 rounded-xl flex items-center space-x-3 hover:bg-opacity-20 dark:hover:bg-opacity-30 transition-colors`}
                >
                  <div className={`${category.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {category.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Trending Topics */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              今話題のトピック
            </h2>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-orange-500 font-bold">
                    #{index + 1}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {topic}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.floor(Math.random() * 500) + 100}人が検索
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Searches */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              最近の検索
            </h2>
            <Clock className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <span
                key={search}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {search}
              </span>
            ))}
          </div>
        </section>

        {/* AI Suggestion */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-2">
            💡 AIのおすすめ
          </h3>
          <p className="text-white text-sm mb-3">
            あなたの職業と収入から、こちらの控除が使える可能性があります
          </p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm">
            セルフメディケーション税制について
          </button>
        </section>
      </div>
    </div>
  )
}