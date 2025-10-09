'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  MessageCircle,
  Sparkles,
  Calendar,
  Tag
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Transaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
}

interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  balance: number
}

export default function KakeiboPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<MonthlyStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFaroChat, setShowFaroChat] = useState(false)
  const [faroMessage, setFaroMessage] = useState('')

  // New transaction form
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: ''
  })

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error

      setTransactions(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const calculateStats = (txns: Transaction[]) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyTxns = txns.filter((t) => {
      const txDate = new Date(t.date)
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    })

    const totalIncome = monthlyTxns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = monthlyTxns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    })
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.category) {
      alert('金額とカテゴリーは必須です')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('transactions').insert({
        user_id: user?.id,
        date: newTransaction.date,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        description: newTransaction.description
      })

      if (error) throw error

      setShowAddModal(false)
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'expense',
        category: '',
        description: ''
      })
      loadTransactions()
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('取引の追加に失敗しました')
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('この取引を削除しますか？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('transactions').delete().eq('id', id)

      if (error) throw error
      loadTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/workspace-new')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Workspace</span>
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">家計簿</h1>
            </div>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>取引を追加</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                今月の収入
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ¥{stats.totalIncome.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                今月の支出
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                ¥{stats.totalExpense.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Wallet className="w-4 h-4 mr-2 text-blue-600" />
                収支
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-bold ${
                  stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}
              >
                {stats.balance >= 0 ? '+' : ''}¥{stats.balance.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>取引履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>まだ取引がありません</p>
                  <p className="text-sm">「取引を追加」ボタンから記録を始めましょう</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-6 h-6" />
                        ) : (
                          <TrendingDown className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.description || transaction.category}
                        </p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(transaction.date).toLocaleDateString('ja-JP')}
                          </span>
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p
                        className={`text-xl font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}¥
                        {transaction.amount.toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">取引を追加</h2>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setNewTransaction({ ...newTransaction, type: 'income' })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${
                      newTransaction.type === 'income'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">収入</span>
                  </button>
                  <button
                    onClick={() =>
                      setNewTransaction({ ...newTransaction, type: 'expense' })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${
                      newTransaction.type === 'expense'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">支出</span>
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, amount: e.target.value })
                  }
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー
                </label>
                <input
                  type="text"
                  value={newTransaction.category}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, category: e.target.value })
                  }
                  placeholder="食費、交通費など"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明（任意）
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, description: e.target.value })
                  }
                  placeholder="詳細を入力"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleAddTransaction}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                追加
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Faro Button */}
      <button
        onClick={() => setShowFaroChat(!showFaroChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>

      {/* Faro Mini Chat */}
      {showFaroChat && (
        <div className="fixed bottom-28 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Faro</span>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            {stats.balance >= 0
              ? `今月は¥${stats.balance.toLocaleString()}のプラスですね！順調です。`
              : `今月は¥${Math.abs(stats.balance).toLocaleString()}のマイナスです。支出を見直しましょうか？`}
          </p>
          <Button
            onClick={() => router.push('/faro')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            詳しく相談する
          </Button>
        </div>
      )}
    </div>
  )
}
