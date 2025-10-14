import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: string
  date: string
  amount: number
  category: string
  transaction_type: 'income' | 'expense'
  memo?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  created_at: string
  updated_at: string
}

interface GuestTransactionsState {
  transactions: Transaction[]
  categories: Category[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) => void
  deleteCategory: (id: string) => void
  getMonthTotal: (year: number, month: number, type?: 'income' | 'expense') => number
  getMonthBalance: (year: number, month: number) => { income: number; expense: number; balance: number }
}

// Default categories
const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: '食費', type: 'expense', icon: '🍽️', color: '#EF4444' },
  { name: '交通費', type: 'expense', icon: '🚗', color: '#3B82F6' },
  { name: '娯楽', type: 'expense', icon: '🎮', color: '#8B5CF6' },
  { name: '光熱費', type: 'expense', icon: '💡', color: '#F59E0B' },
  { name: '通信費', type: 'expense', icon: '📱', color: '#10B981' },
  { name: '医療費', type: 'expense', icon: '🏥', color: '#EC4899' },
  { name: '衣服', type: 'expense', icon: '👔', color: '#6366F1' },
  { name: '日用品', type: 'expense', icon: '🧴', color: '#14B8A6' },
  { name: 'その他', type: 'expense', icon: '📦', color: '#6B7280' },
]

const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: '給与', type: 'income', icon: '💼', color: '#10B981' },
  { name: 'ボーナス', type: 'income', icon: '💰', color: '#F59E0B' },
  { name: '副業', type: 'income', icon: '💻', color: '#8B5CF6' },
  { name: 'その他', type: 'income', icon: '💵', color: '#6B7280' },
]

export const useGuestTransactionsStore = create<GuestTransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [],

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `guest-transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        set(state => ({
          transactions: [newTransaction, ...state.transactions],
        }))

        console.log('[GuestTransactionsStore] ✅ Added transaction:', newTransaction.id)
      },

      updateTransaction: (id, updates) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id
              ? { ...t, ...updates, updated_at: new Date().toISOString() }
              : t
          ),
        }))
        console.log('[GuestTransactionsStore] ✅ Updated transaction:', id)
      },

      deleteTransaction: (id) => {
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id),
        }))
        console.log('[GuestTransactionsStore] ✅ Deleted transaction:', id)
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: `guest-category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        set(state => ({
          categories: [...state.categories, newCategory],
        }))

        console.log('[GuestTransactionsStore] ✅ Added category:', newCategory.id)
      },

      updateCategory: (id, updates) => {
        set(state => ({
          categories: state.categories.map(c =>
            c.id === id
              ? { ...c, ...updates, updated_at: new Date().toISOString() }
              : c
          ),
        }))
        console.log('[GuestTransactionsStore] ✅ Updated category:', id)
      },

      deleteCategory: (id) => {
        set(state => ({
          categories: state.categories.filter(c => c.id !== id),
        }))
        console.log('[GuestTransactionsStore] ✅ Deleted category:', id)
      },

      getMonthTotal: (year, month, type) => {
        const transactions = get().transactions
        return transactions
          .filter(t => {
            const date = new Date(t.date)
            const matchesDate = date.getFullYear() === year && date.getMonth() + 1 === month
            const matchesType = type ? t.transaction_type === type : true
            return matchesDate && matchesType
          })
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getMonthBalance: (year, month) => {
        const transactions = get().transactions.filter(t => {
          const date = new Date(t.date)
          return date.getFullYear() === year && date.getMonth() + 1 === month
        })

        const income = transactions
          .filter(t => t.transaction_type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const expense = transactions
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        return { income, expense, balance: income - expense }
      },
    }),
    {
      name: 'faro-guest-transactions-storage',
    }
  )
)

// Initialize default categories for guest users
export const getDefaultCategories = (): Category[] => {
  const allDefaults = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]
  return allDefaults.map((cat, index) => ({
    ...cat,
    id: `default-category-${index}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}
