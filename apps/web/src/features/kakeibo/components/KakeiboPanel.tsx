'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Edit2, Trash2, Calendar, Settings, TrendingUp, TrendingDown } from 'lucide-react'
import { useGuestTransactionsStore, Transaction, Category, getDefaultCategories } from '../stores/guestTransactionsStore'

interface KakeiboPanelProps {
  userId?: string
}

export function KakeiboPanel({ userId }: KakeiboPanelProps) {
  const isGuest = !userId

  // Guest store
  const {
    transactions: guestTransactions,
    categories: guestCategories,
    addTransaction: addGuestTransaction,
    updateTransaction: updateGuestTransaction,
    deleteTransaction: deleteGuestTransaction,
    getMonthBalance: getGuestMonthBalance,
  } = useGuestTransactionsStore()

  const [authTransactions, setAuthTransactions] = useState<Transaction[]>([])
  const [authCategories, setAuthCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    transaction_type: 'expense' as 'income' | 'expense',
    memo: '',
  })

  const transactions = isGuest ? guestTransactions : authTransactions
  const allCategories = isGuest
    ? guestCategories.length > 0
      ? guestCategories
      : getDefaultCategories()
    : authCategories

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // Fetch auth data
  useEffect(() => {
    if (!isGuest && userId) {
      fetchTransactions()
      fetchCategories()
    }
  }, [userId, isGuest])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`)
      const data = await response.json()
      setAuthTransactions(data.transactions || [])
    } catch (error) {
      console.error('[Kakeibo] Error fetching transactions:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?userId=${userId}`)
      const data = await response.json()
      setAuthCategories(data.categories || [])
    } catch (error) {
      console.error('[Kakeibo] Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('金額を入力してください')
      return
    }

    if (!formData.category) {
      alert('カテゴリを選択してください')
      return
    }

    const transactionData = {
      date: formData.date,
      amount: Math.round(parseFloat(formData.amount)),
      category: formData.category,
      transaction_type: formData.transaction_type,
      memo: formData.memo || undefined,
    }

    try {
      if (editingTransaction) {
        // Update
        if (isGuest) {
          updateGuestTransaction(editingTransaction.id, transactionData)
        } else {
          await fetch('/api/transactions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingTransaction.id, ...transactionData }),
          })
          await fetchTransactions()
        }
      } else {
        // Create
        if (isGuest) {
          addGuestTransaction(transactionData)
        } else {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...transactionData }),
          })
          await fetchTransactions()
        }
      }

      setShowModal(false)
      setEditingTransaction(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        transaction_type: 'expense',
        memo: '',
      })
    } catch (error) {
      console.error('[Kakeibo] Error saving transaction:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この取引を削除しますか？')) return

    try {
      if (isGuest) {
        deleteGuestTransaction(id)
      } else {
        await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
        await fetchTransactions()
      }
    } catch (error) {
      console.error('[Kakeibo] Error deleting transaction:', error)
      alert('削除に失敗しました')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      date: transaction.date,
      amount: transaction.amount.toString(),
      category: transaction.category,
      transaction_type: transaction.transaction_type,
      memo: transaction.memo || '',
    })
    setShowModal(true)
  }

  const monthBalance = isGuest
    ? getGuestMonthBalance(currentYear, currentMonth)
    : (() => {
        const monthTransactions = authTransactions.filter(t => {
          const date = new Date(t.date)
          return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
        })
        const income = monthTransactions
          .filter(t => t.transaction_type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = monthTransactions
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
        return { income, expense, balance: income - expense }
      })()

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const filteredTransactions = transactions.filter(
    t => t.transaction_type === transactionType
  )

  const availableCategories = allCategories.filter(
    c => c.type === formData.transaction_type
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">家計簿</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              カテゴリ管理
            </button>
            <button
              onClick={() => {
                setEditingTransaction(null)
                const firstCategory = allCategories.find(c => c.type === 'expense')
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  category: firstCategory?.name || '',
                  transaction_type: 'expense',
                  memo: '',
                })
                setShowModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-faro-purple text-white rounded-lg hover:bg-faro-purple-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              新しい取引
            </button>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-xs text-gray-600 mb-1">収入</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(monthBalance.income)}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-xs text-gray-600 mb-1">支出</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(monthBalance.expense)}</div>
          </div>
          <div className={`rounded-xl p-4 ${monthBalance.balance >= 0 ? 'bg-purple-50' : 'bg-orange-50'}`}>
            <div className="text-xs text-gray-600 mb-1">残高</div>
            <div className={`text-lg font-bold ${monthBalance.balance >= 0 ? 'text-faro-purple' : 'text-orange-600'}`}>
              {formatCurrency(monthBalance.balance)}
            </div>
          </div>
        </div>

        {/* Transaction Type Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTransactionType('expense')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              transactionType === 'expense'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            支出
          </button>
          <button
            onClick={() => setTransactionType('income')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              transactionType === 'income'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            収入
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">{transactionType === 'income' ? '💵' : '💰'}</div>
            <h3 className="text-xl font-semibold mb-2">{transactionType === 'income' ? '収入' : '支出'}がありません</h3>
            <p className="text-gray-500 mb-4">「新しい取引」ボタンから記録を開始しましょう</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl mx-auto">
            {filteredTransactions.map((transaction) => {
              const category = allCategories.find(c => c.name === transaction.category)
              return (
              <div
                key={transaction.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                      <span
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: category ? `${category.color}20` : '#F3F4F6',
                          color: category?.color || '#6B7280'
                        }}
                      >
                        {category?.icon || '📦'} {transaction.category}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${
                      transaction.transaction_type === 'income' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                    {transaction.memo && (
                      <p className="text-sm text-gray-600">{transaction.memo}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {editingTransaction ? '取引を編集' : '新しい取引'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingTransaction(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  種類
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, transaction_type: 'expense', category: '' })
                    }}
                    className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      formData.transaction_type === 'expense'
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    支出
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, transaction_type: 'income', category: '' })
                    }}
                    className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      formData.transaction_type === 'income'
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    収入
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日付
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  金額
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="¥0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メモ（任意）
                </label>
                <input
                  type="text"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="例: スーパーで買い物"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTransaction(null)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-faro-purple text-white rounded-xl hover:bg-faro-purple-dark transition-colors font-medium"
                >
                  {editingTransaction ? '更新' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          userId={userId}
          categories={allCategories}
          onClose={() => setShowCategoryManager(false)}
          onRefresh={() => {
            if (!isGuest) {
              fetchCategories()
            }
          }}
        />
      )}
    </div>
  )
}

// Category Manager Component
function CategoryManager({
  userId,
  categories,
  onClose,
  onRefresh,
}: {
  userId?: string
  categories: Category[]
  onClose: () => void
  onRefresh: () => void
}) {
  const isGuest = !userId
  const { addCategory, updateCategory, deleteCategory } = useGuestTransactionsStore()
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    icon: '💰',
    color: '#8B5CF6',
  })

  const filteredCategories = categories.filter(c => c.type === categoryType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }

    try {
      if (editingCategory) {
        // Update
        if (isGuest) {
          updateCategory(editingCategory.id, formData)
        } else {
          await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingCategory.id, ...formData }),
          })
          onRefresh()
        }
      } else {
        // Create
        if (isGuest) {
          addCategory({ ...formData, type: categoryType })
        } else {
          await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...formData, type: categoryType }),
          })
          onRefresh()
        }
      }

      setShowAddForm(false)
      setEditingCategory(null)
      setFormData({ name: '', icon: '💰', color: '#8B5CF6' })
    } catch (error) {
      console.error('[Category Manager] Error saving category:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このカテゴリを削除しますか？')) return

    try {
      if (isGuest) {
        deleteCategory(id)
      } else {
        await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
        onRefresh()
      }
    } catch (error) {
      console.error('[Category Manager] Error deleting category:', error)
      alert('削除に失敗しました')
    }
  }

  const defaultCategoryIds = categories
    .filter(c => c.id.startsWith('default-category-'))
    .map(c => c.id)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">カテゴリ管理</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setCategoryType('expense')
                setShowAddForm(false)
                setEditingCategory(null)
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                categoryType === 'expense'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              支出カテゴリ
            </button>
            <button
              onClick={() => {
                setCategoryType('income')
                setShowAddForm(false)
                setEditingCategory(null)
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                categoryType === 'income'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              収入カテゴリ
            </button>
          </div>

          {/* Add Category Button */}
          {!showAddForm && !editingCategory && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-faro-purple hover:text-faro-purple transition-colors mb-4"
            >
              + 新しいカテゴリを追加
            </button>
          )}

          {/* Add/Edit Form */}
          {(showAddForm || editingCategory) && (
            <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 家賃"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    アイコン
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🏠"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カラー
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingCategory(null)
                    setFormData({ name: '', icon: '💰', color: '#8B5CF6' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-faro-purple text-white rounded-lg hover:bg-faro-purple-dark transition-colors"
                >
                  {editingCategory ? '更新' : '追加'}
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const isDefault = defaultCategoryIds.includes(category.id)
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </span>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {isDefault && (
                        <div className="text-xs text-gray-500">デフォルト</div>
                      )}
                    </div>
                  </div>
                  {!isDefault && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category)
                          setFormData({
                            name: category.name,
                            icon: category.icon,
                            color: category.color,
                          })
                          setShowAddForm(false)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
