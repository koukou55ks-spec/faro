'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Plus,
  Receipt,
  Check,
  X,
  MessageCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Journal {
  id: string
  date: string
  description: string
  debit_account: string
  debit_amount: number
  credit_account: string
  credit_amount: number
  is_confirmed: boolean
}

export default function ShiwakePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [journals, setJournals] = useState<Journal[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFaroChat, setShowFaroChat] = useState(false)

  const [newJournal, setNewJournal] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    debit_account: '',
    debit_amount: '',
    credit_account: '',
    credit_amount: ''
  })

  const commonAccounts = [
    { name: '現金', type: 'asset' },
    { name: '普通預金', type: 'asset' },
    { name: '売掛金', type: 'asset' },
    { name: '売上', type: 'revenue' },
    { name: '消耗品費', type: 'expense' },
    { name: '旅費交通費', type: 'expense' },
    { name: '通信費', type: 'expense' },
    { name: '広告宣伝費', type: 'expense' },
    { name: '事業主借', type: 'liability' },
    { name: '事業主貸', type: 'asset' }
  ]

  useEffect(() => {
    if (user) {
      loadJournals()
    }
  }, [user])

  const loadJournals = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      setJournals(data || [])
    } catch (error) {
      console.error('Error loading journals:', error)
    }
  }

  const handleAddJournal = async () => {
    if (
      !newJournal.description ||
      !newJournal.debit_account ||
      !newJournal.credit_account ||
      !newJournal.debit_amount
    ) {
      alert('すべての項目を入力してください')
      return
    }

    const amount = parseFloat(newJournal.debit_amount)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('journals').insert({
        user_id: user?.id,
        date: newJournal.date,
        description: newJournal.description,
        debit_account: newJournal.debit_account,
        debit_amount: amount,
        credit_account: newJournal.credit_account,
        credit_amount: amount,
        is_confirmed: false
      })

      if (error) throw error

      setShowAddModal(false)
      setNewJournal({
        date: new Date().toISOString().split('T')[0],
        description: '',
        debit_account: '',
        debit_amount: '',
        credit_account: '',
        credit_amount: ''
      })
      loadJournals()
    } catch (error) {
      console.error('Error adding journal:', error)
      alert('仕訳の追加に失敗しました')
    }
  }

  const toggleConfirmation = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('journals')
        .update({ is_confirmed: !currentStatus })
        .eq('id', id)

      if (error) throw error
      loadJournals()
    } catch (error) {
      console.error('Error updating journal:', error)
    }
  }

  const handleDeleteJournal = async (id: string) => {
    if (!confirm('この仕訳を削除しますか？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('journals').delete().eq('id', id)

      if (error) throw error
      loadJournals()
    } catch (error) {
      console.error('Error deleting journal:', error)
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-red-50 to-white">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
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
              <Receipt className="w-6 h-6 text-red-600" />
              <h1 className="text-xl font-bold text-gray-900">仕訳</h1>
            </div>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>仕訳を追加</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Card */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>仕訳とは？</strong>
                  取引を「借方」と「貸方」に分けて記録する会計の基本です。
                </p>
                <p className="text-xs text-gray-500">
                  例: モニターを5万円で購入 → 借方「消耗品費 50,000」/ 貸方「事業主借 50,000」
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journals List */}
        <Card>
          <CardHeader>
            <CardTitle>仕訳帳</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journals.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>まだ仕訳がありません</p>
                  <p className="text-sm">「仕訳を追加」ボタンから記録を始めましょう</p>
                </div>
              ) : (
                journals.map((journal) => (
                  <div
                    key={journal.id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      journal.is_confirmed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {journal.description}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(journal.date).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleConfirmation(journal.id, journal.is_confirmed)
                          }
                          className={
                            journal.is_confirmed
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-gray-600'
                          }
                        >
                          {journal.is_confirmed ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              確定済み
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              未確定
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteJournal(journal.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          削除
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* 借方 */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold mb-2">借方（Debit）</p>
                        <p className="font-semibold text-gray-900 mb-1">
                          {journal.debit_account}
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          ¥{journal.debit_amount.toLocaleString()}
                        </p>
                      </div>

                      {/* 貸方 */}
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-orange-600 font-semibold mb-2">貸方（Credit）</p>
                        <p className="font-semibold text-gray-900 mb-1">
                          {journal.credit_account}
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          ¥{journal.credit_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Journal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">仕訳を追加</h2>

            <div className="space-y-4">
              {/* Date & Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                  <input
                    type="date"
                    value={newJournal.date}
                    onChange={(e) => setNewJournal({ ...newJournal, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明
                  </label>
                  <input
                    type="text"
                    value={newJournal.description}
                    onChange={(e) =>
                      setNewJournal({ ...newJournal, description: e.target.value })
                    }
                    placeholder="例: モニター購入"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Debit (借方) */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-600 mb-4">借方（Debit）</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      勘定科目
                    </label>
                    <select
                      value={newJournal.debit_account}
                      onChange={(e) =>
                        setNewJournal({ ...newJournal, debit_account: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">選択してください</option>
                      {commonAccounts.map((acc) => (
                        <option key={acc.name} value={acc.name}>
                          {acc.name} ({acc.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      金額
                    </label>
                    <input
                      type="number"
                      value={newJournal.debit_amount}
                      onChange={(e) =>
                        setNewJournal({
                          ...newJournal,
                          debit_amount: e.target.value,
                          credit_amount: e.target.value
                        })
                      }
                      placeholder="50000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Credit (貸方) */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-sm font-semibold text-orange-600 mb-4">貸方（Credit）</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      勘定科目
                    </label>
                    <select
                      value={newJournal.credit_account}
                      onChange={(e) =>
                        setNewJournal({ ...newJournal, credit_account: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">選択してください</option>
                      {commonAccounts.map((acc) => (
                        <option key={acc.name} value={acc.name}>
                          {acc.name} ({acc.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      金額（自動入力）
                    </label>
                    <input
                      type="number"
                      value={newJournal.credit_amount || newJournal.debit_amount}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Validation Message */}
              {newJournal.debit_amount &&
                newJournal.debit_amount !== newJournal.credit_amount && (
                  <p className="text-sm text-red-600">
                    ⚠️ 借方と貸方の金額は一致する必要があります
                  </p>
                )}
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
                onClick={handleAddJournal}
                className="flex-1 bg-red-600 hover:bg-red-700"
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
            仕訳について質問はありますか？どの勘定科目を使うべきか、一緒に考えましょう。
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
