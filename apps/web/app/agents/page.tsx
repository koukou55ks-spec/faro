'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/hooks/useAuth'
import { useSubscription } from '../../lib/hooks/useSubscription'
import { useAgentSuggestions } from '../../lib/hooks/useAgentSuggestions'
import {
  Sparkles, TrendingUp, AlertCircle, CheckCircle,
  Calendar, DollarSign, FileText, Clock, ArrowRight,
  Lightbulb, Target, Bell, Loader2, RefreshCw, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AgentsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { subscription } = useSubscription()
  const {
    suggestions,
    pendingCount,
    loading,
    error,
    generateSuggestions,
    updateSuggestionStatus
  } = useAgentSuggestions()

  const [isGenerating, setIsGenerating] = useState(false)

  // 自動生成は無効化（ユーザーが明示的にボタンをクリックした時のみ生成）
  // useEffect(() => {
  //   if (user && token && !authLoading && !loading && pendingCount === 0) {
  //     handleGenerateSuggestions()
  //   }
  // }, [user, token, authLoading, loading, pendingCount])

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true)
    try {
      await generateSuggestions()
    } catch (err) {
      console.error('Failed to generate suggestions:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAction = async (suggestionId: string, actionUrl?: string) => {
    try {
      await updateSuggestionStatus(suggestionId, 'acted')
      if (actionUrl) {
        window.location.href = actionUrl
      }
    } catch (err) {
      console.error('Failed to update suggestion status:', err)
    }
  }

  const handleDismiss = async (suggestionId: string) => {
    try {
      await updateSuggestionStatus(suggestionId, 'dismissed')
    } catch (err) {
      console.error('Failed to dismiss suggestion:', err)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-950'
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950'
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-950'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tax_deadline': return Calendar
      case 'deduction_opportunity': return DollarSign
      case 'life_event_reminder': return Bell
      case 'optimization_tip': return Lightbulb
      case 'document_reminder': return FileText
      case 'news_alert': return TrendingUp
      default: return AlertCircle
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tax_deadline': return '税金期限'
      case 'deduction_opportunity': return '控除機会'
      case 'life_event_reminder': return 'ライフイベント'
      case 'optimization_tip': return '最適化ヒント'
      case 'document_reminder': return '書類準備'
      case 'news_alert': return 'ニュース'
      default: return '提案'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-6 pb-20">
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

          <button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                新しい提案を生成
              </>
            )}
          </button>
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
                  {suggestions.filter(s => s.priority === 'high' || s.priority === 'urgent').length}件
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
          <AnimatePresence>
            {suggestions.map((suggestion, index) => {
              const TypeIcon = getTypeIcon(suggestion.suggestion_type)
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getPriorityColor(suggestion.priority)}`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                              {getTypeLabel(suggestion.suggestion_type)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {suggestion.priority === 'urgent' && '🔥 緊急'}
                              {suggestion.priority === 'high' && '⚠️ 重要'}
                              {suggestion.priority === 'medium' && '📌 通常'}
                              {suggestion.priority === 'low' && 'ℹ️ 低'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {suggestion.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDismiss(suggestion.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          aria-label="却下"
                        >
                          <X className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {suggestion.message}
                      </p>

                      {suggestion.reasoning && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 italic">
                          理由: {suggestion.reasoning}
                        </p>
                      )}

                      <div className="flex items-center gap-3">
                        {suggestion.action_url && (
                          <button
                            onClick={() => handleAction(suggestion.id, suggestion.action_url)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            アクションを実行
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                        {suggestion.confidence_score && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            確信度: {Math.round(suggestion.confidence_score * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {suggestions.length === 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              提案はありません
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              「新しい提案を生成」ボタンをクリックして、AIからの提案を受け取りましょう
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
