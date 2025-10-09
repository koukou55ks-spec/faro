'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, TrendingUp, TrendingDown, DollarSign, Calendar,
  Tag, Receipt, Sparkles, BarChart3, PieChart, Filter,
  Download, Upload, Trash2, Edit3, Save, X
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Transaction {
  id: string
  date: Date
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  tags: string[]
  ai_categorized: boolean
}

interface CategorySummary {
  category: string
  amount: number
  percentage: number
  color: string
}

export function KakeiboApp() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')

  // Form state
  const [formAmount, setFormAmount] = useState('')
  const [formType, setFormType] = useState<'income' | 'expense'>('expense')
  const [formDescription, setFormDescription] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [isAiCategorizing, setIsAiCategorizing] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [user])

  const loadTransactions = async () => {
    // TODO: Implement API call
    // Mock data for now
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: new Date(),
        amount: 5000,
        type: 'expense',
        category: '食費',
        description: 'スーパーで買い物',
        tags: ['日用品'],
        ai_categorized: true
      },
      {
        id: '2',
        date: new Date(),
        amount: 300000,
        type: 'income',
        category: '給与',
        description: '月給',
        tags: [],
        ai_categorized: false
      }
    ]
    setTransactions(mockTransactions)
  }

  const addTransaction = async () => {
    if (!formAmount || !formDescription) return

    setIsAiCategorizing(true)

    try {
      // AI categorization
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `この支出を適切なカテゴリに分類してください: "${formDescription}" ${formAmount}円。カテゴリ名のみを返してください。`,
          expert_mode: false
        })
      })

      const data = await response.json()
      const aiCategory = data.answer || '未分類'

      const newTransaction: Transaction = {
        id: `temp-${Date.now()}`,
        date: new Date(formDate),
        amount: parseFloat(formAmount),
        type: formType,
        category: aiCategory.trim(),
        description: formDescription,
        tags: [],
        ai_categorized: true
      }

      setTransactions([newTransaction, ...transactions])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to add transaction:', error)
    } finally {
      setIsAiCategorizing(false)
    }
  }

  const resetForm = () => {
    setFormAmount('')
    setFormDescription('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormType('expense')
  }

  const deleteTransaction = (id: string) => {
    if (confirm('この取引を削除しますか？')) {
      setTransactions(transactions.filter(t => t.id !== id))
    }
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
  })

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Category summary
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categorySummary: CategorySummary[] = Object.entries(expensesByCategory).map(([category, amount], idx) => ({
    category,
    amount,
    percentage: (amount / totalExpense) * 100,
    color: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][idx % 6]
  }))

  return (
    <div className="h-full flex flex-col bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold">AI家計簿</h2>
            <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI自動分類
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              {viewMode === 'list' ? <BarChart3 className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              取引を追加
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">収入</span>
            </div>
            <p className="text-2xl font-bold">¥{totalIncome.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">支出</span>
            </div>
            <p className="text-2xl font-bold">¥{totalExpense.toLocaleString()}</p>
          </div>

          <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' : 'from-orange-500/20 to-red-500/20 border-orange-500/30'} border rounded-xl p-4`}>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">残高</span>
            </div>
            <p className="text-2xl font-bold">¥{balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-4">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'すべて' : type === 'income' ? '収入' : '支出'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'list' ? (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                          {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded text-xs">
                          {transaction.category}
                        </span>
                        {transaction.ai_categorized && (
                          <Sparkles className="w-3 h-3 text-violet-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(transaction.date).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>取引がありません</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">カテゴリ別支出</h3>
              <div className="space-y-3">
                {categorySummary.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{cat.category}</span>
                      <span className="text-sm font-medium">¥{cat.amount.toLocaleString()} ({cat.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold">取引を追加</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormType('expense')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      formType === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    支出
                  </button>
                  <button
                    onClick={() => setFormType('income')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      formType === 'income'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    収入
                  </button>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">金額</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-violet-500 text-xl"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">説明</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="スーパーで買い物"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-violet-500"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AIが自動でカテゴリを分類します
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">日付</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  onClick={addTransaction}
                  disabled={isAiCategorizing || !formAmount || !formDescription}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-pink-500 rounded-lg hover:from-violet-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAiCategorizing ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      AI分類中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      追加
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
