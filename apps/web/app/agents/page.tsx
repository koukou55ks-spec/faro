'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/hooks/useAuth'
import { useSubscription } from '../../lib/hooks/useSubscription'
import {
  Sparkles, TrendingUp, AlertCircle, CheckCircle,
  Calendar, DollarSign, FileText, Clock, ArrowRight,
  Lightbulb, Target, Bell
} from 'lucide-react'
import { motion } from 'framer-motion'

interface AgentSuggestion {
  id: string
  type: 'action' | 'insight' | 'reminder' | 'opportunity'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  actionLabel?: string
  actionUrl?: string
}

export default function AgentsPage() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: 実際のAPIから取得
    const mockSuggestions: AgentSuggestion[] = [
      {
        id: '1',
        type: 'action',
        title: '確定申告の準備を始めましょう',
        description: '2024年分の確定申告期限まであと3ヶ月です。必要書類の準備を開始することをおすすめします。',
        priority: 'high',
        category: '税務',
        actionLabel: '準備を始める',
        actionUrl: '/tools'
      },
      {
        id: '2',
        type: 'insight',
        title: '今月の支出が先月比20%増加',
        description: '食費と交際費が増加傾向にあります。予算の見直しを検討してみませんか？',
        priority: 'medium',
        category: '家計管理'
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'ふるさと納税の最適額を計算',
        description: 'あなたの年収から、今年のふるさと納税上限額は約12万円です。まだ利用されていない場合、節税のチャンスです。',
        priority: 'high',
        category: '節税',
        actionLabel: '詳細を見る'
      },
      {
        id: '4',
        type: 'reminder',
        title: '医療費控除の対象になる可能性',
        description: '今年の医療費が10万円を超えています。領収書を整理して控除を申請しましょう。',
        priority: 'medium',
        category: '控除'
      },
      {
        id: '5',
        type: 'insight',
        title: '投資ポートフォリオの最適化',
        description: 'リスク分散の観点から、資産配分の見直しをおすすめします。',
        priority: 'low',
        category: '投資'
      }
    ]

    setTimeout(() => {
      setSuggestions(mockSuggestions)
      setIsLoading(false)
    }, 500)
  }, [user])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950'
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-950'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action': return Target
      case 'insight': return Lightbulb
      case 'reminder': return Bell
      case 'opportunity': return Sparkles
      default: return AlertCircle
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'action': return 'アクション'
      case 'insight': return 'インサイト'
      case 'reminder': return 'リマインダー'
      case 'opportunity': return '機会'
      default: return '提案'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AIエージェント
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            あなたの財務状況を分析し、最適なアクションを提案します
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">重要度: 高</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {suggestions.filter(s => s.priority === 'high').length}件
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">重要度: 中</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {suggestions.filter(s => s.priority === 'medium').length}件
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">全提案</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {suggestions.length}件
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => {
            const TypeIcon = getTypeIcon(suggestion.type)
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getPriorityColor(suggestion.priority)}`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                            {getTypeLabel(suggestion.type)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {suggestion.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {suggestion.description}
                    </p>

                    {suggestion.actionLabel && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                        {suggestion.actionLabel}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              提案はありません
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              データを蓄積すると、AIが最適な提案を行います
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
