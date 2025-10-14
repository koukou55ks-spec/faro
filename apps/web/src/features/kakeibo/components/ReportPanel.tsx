'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useGuestTransactionsStore, Transaction } from '../stores/guestTransactionsStore'
import { Calendar, TrendingUp } from 'lucide-react'

interface ReportPanelProps {
  userId?: string
}

const COLORS = [
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // purple-500
]

export function ReportPanel({ userId }: ReportPanelProps) {
  const isGuest = !userId
  const { transactions: guestTransactions } = useGuestTransactionsStore()
  const [authTransactions, setAuthTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM

  const transactions = isGuest ? guestTransactions : authTransactions

  useEffect(() => {
    if (!isGuest && userId) {
      fetchTransactions()
    }
  }, [userId, isGuest])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`)
      const data = await response.json()
      setAuthTransactions(data.transactions || [])
    } catch (error) {
      console.error('[Report] Error fetching transactions:', error)
    }
  }

  // Filter transactions by selected month
  const monthTransactions = transactions.filter(t => {
    return t.date.startsWith(selectedMonth)
  })

  // Calculate category breakdown
  const categoryData = monthTransactions.reduce((acc, t) => {
    const existing = acc.find(item => item.name === t.category)
    if (existing) {
      existing.value += t.amount
    } else {
      acc.push({ name: t.category, value: t.amount })
    }
    return acc
  }, [] as { name: string; value: number }[])

  // Calculate last 6 months trend
  const getLast6Months = () => {
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toISOString().slice(0, 7))
    }
    return months
  }

  const trendData = getLast6Months().map(month => {
    const monthTotal = transactions
      .filter(t => t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0)

    const date = new Date(month + '-01')
    return {
      month: `${date.getMonth() + 1}月`,
      total: monthTotal,
    }
  })

  const monthTotal = monthTransactions.reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  return (
    <div className="h-full overflow-y-auto bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">レポート</h1>
          <p className="text-gray-600">支出の分析とトレンド</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-faro-purple focus:border-transparent"
          />
        </div>

        {/* Total for Selected Month */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-2">
            {new Date(selectedMonth + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}の支出
          </div>
          <div className="text-5xl font-bold">{formatCurrency(monthTotal)}</div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>カテゴリ別内訳</span>
          </h2>

          {categoryData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>選択した月に取引がありません</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${((entry.value / monthTotal) * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category List */}
              <div className="space-y-3">
                {categoryData
                  .sort((a, b) => b.value - a.value)
                  .map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(item.value)}</div>
                        <div className="text-sm text-gray-500">
                          {((item.value / monthTotal) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span>過去6ヶ月のトレンド</span>
          </h2>

          {trendData.every(d => d.total === 0) ? (
            <div className="text-center py-12 text-gray-500">
              <p>過去6ヶ月に取引がありません</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Average */}
          {trendData.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">6ヶ月平均</div>
              <div className="text-2xl font-bold text-faro-purple">
                {formatCurrency(Math.round(trendData.reduce((sum, d) => sum + d.total, 0) / trendData.length))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
