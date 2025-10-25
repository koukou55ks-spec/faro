'use client'

import { useState, useEffect } from 'react'
import { useLibrary } from '../../lib/hooks/useLibrary'
import {
  BookOpen, TrendingUp, Calculator, Award,
  Filter, Search, Loader2, CheckCircle, PlayCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type ContentFilter = 'all' | 'article' | 'quiz' | 'simulation'
type SortBy = 'popular' | 'recent' | 'recommended'

export default function LibraryPage() {
  const { contents, loading, updateProgress, fetchContents } = useLibrary()
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('recommended')
  const [searchQuery, setSearchQuery] = useState('')

  // 初回マウント時にコンテンツを取得
  useEffect(() => {
    fetchContents()
  }, [])

  // フィルタリング＆ソート
  const filteredContent = contents
    .filter(item => {
      if (filter !== 'all' && item.content_type !== filter) return false
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.view_count - a.view_count
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      // recommended: 未完了＋人気順
      const aScore = (a.user_progress?.status === 'completed' ? 0 : 1000) + a.view_count
      const bScore = (b.user_progress?.status === 'completed' ? 0 : 1000) + b.view_count
      return bScore - aScore
    })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return BookOpen
      case 'quiz': return Award
      case 'simulation': return Calculator
      default: return BookOpen
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return '記事'
      case 'quiz': return 'クイズ'
      case 'simulation': return 'シミュレーター'
      default: return '不明'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'quiz': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'simulation': return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return '初級'
      case 'intermediate': return '中級'
      case 'advanced': return '上級'
      default: return ''
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black pb-20">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 p-6 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ライブラリ</h1>
        </div>
        <p className="text-white/80 text-sm ml-15">
          税金に関する記事・クイズ・シミュレーターで学習しましょう
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4">
        {/* 検索＆フィルター */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
          {/* 検索バー */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タイトルで検索..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* フィルター */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('article')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === 'article'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              記事
            </button>
            <button
              onClick={() => setFilter('quiz')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === 'quiz'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Award className="w-4 h-4" />
              クイズ
            </button>
            <button
              onClick={() => setFilter('simulation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === 'simulation'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Calculator className="w-4 h-4" />
              シミュレーター
            </button>
          </div>

          {/* ソート */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="recommended">おすすめ</option>
              <option value="popular">人気順</option>
              <option value="recent">新着順</option>
            </select>
          </div>
        </div>

        {/* コンテンツグリッド */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">コンテンツが見つかりませんでした</p>
            <p className="text-sm">検索条件を変更してお試しください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-6">
            {filteredContent.map((item, index) => {
              const TypeIcon = getTypeIcon(item.content_type)
              const isCompleted = item.user_progress?.status === 'completed'

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={`/library/${item.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden group"
                  >
                    {/* カテゴリバッジ */}
                    <div className="p-5 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(item.content_type)}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          {getTypeLabel(item.content_type)}
                        </span>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>

                      {/* タイトル */}
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h3>

                      {/* 説明 */}
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* カテゴリとタグ */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.category && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {item.category}
                          </span>
                        )}
                        {item.difficulty && (
                          <span className={`text-xs px-2 py-1 rounded font-medium ${getDifficultyColor(item.difficulty)}`}>
                            {getDifficultyLabel(item.difficulty)}
                          </span>
                        )}
                      </div>

                      {/* メタ情報 */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{item.view_count.toLocaleString()}回閲覧</span>
                        </div>
                        {item.completion_count > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{item.completion_count}人完了</span>
                          </div>
                        )}
                      </div>

                      {/* 進捗バー */}
                      {item.user_progress && item.user_progress.progress_percentage > 0 && !isCompleted && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>進捗</span>
                            <span>{item.user_progress.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${item.user_progress.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* アクションボタン */}
                      <div className="mt-4">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all text-sm font-medium">
                          <PlayCircle className="w-4 h-4" />
                          {isCompleted ? '復習する' : item.user_progress?.progress_percentage ? '続きから' : '始める'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
