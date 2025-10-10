export interface Transaction {
  id: string
  user_id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  created_at?: string
  updated_at?: string
}

export interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface CategoryStat {
  category: string
  amount: number
  percentage: number
  count: number
}
