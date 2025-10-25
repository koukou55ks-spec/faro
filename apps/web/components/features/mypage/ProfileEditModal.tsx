'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
  onSave: (updates: any) => Promise<void>
}

export function ProfileEditModal({ isOpen, onClose, profile, onSave }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    age: '',
    occupation: '',
    employment_type: '',
    prefecture: '',
    industry: '',
    marital_status: '',
    num_children: '',
    annual_income: '',
    tax_type: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        age: profile.age?.toString() || '',
        occupation: profile.occupation || '',
        employment_type: profile.employment_type || '',
        prefecture: profile.prefecture || '',
        industry: profile.industry || '',
        marital_status: profile.marital_status || '',
        num_children: profile.num_children?.toString() || '',
        annual_income: profile.annual_income?.toString() || '',
        tax_type: profile.tax_type || ''
      })
    }
  }, [profile, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updates: any = {}
      if (formData.age) updates.age = parseInt(formData.age)
      if (formData.occupation) updates.occupation = formData.occupation
      if (formData.employment_type) updates.employment_type = formData.employment_type
      if (formData.prefecture) updates.prefecture = formData.prefecture
      if (formData.industry) updates.industry = formData.industry
      if (formData.marital_status) updates.marital_status = formData.marital_status
      if (formData.num_children) updates.num_children = parseInt(formData.num_children)
      if (formData.annual_income) updates.annual_income = parseInt(formData.annual_income)
      if (formData.tax_type) updates.tax_type = formData.tax_type

      await onSave(updates)
      onClose()
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                プロフィール編集
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    年齢
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: 30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    職業
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: エンジニア"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    雇用形態
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">選択してください</option>
                    <option value="正社員">正社員</option>
                    <option value="契約社員">契約社員</option>
                    <option value="派遣社員">派遣社員</option>
                    <option value="パート・アルバイト">パート・アルバイト</option>
                    <option value="個人事業主">個人事業主</option>
                    <option value="フリーランス">フリーランス</option>
                    <option value="経営者">経営者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    業種
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: IT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    都道府県
                  </label>
                  <input
                    type="text"
                    value={formData.prefecture}
                    onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: 東京都"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    婚姻状況
                  </label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">選択してください</option>
                    <option value="未婚">未婚</option>
                    <option value="既婚">既婚</option>
                    <option value="離婚">離婚</option>
                    <option value="死別">死別</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    子供の数
                  </label>
                  <input
                    type="number"
                    value={formData.num_children}
                    onChange={(e) => setFormData({ ...formData, num_children: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: 2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    年収（万円）
                  </label>
                  <input
                    type="number"
                    value={formData.annual_income}
                    onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: 500"
                    step="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    税金タイプ
                  </label>
                  <select
                    value={formData.tax_type}
                    onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">選択してください</option>
                    <option value="給与所得">給与所得</option>
                    <option value="事業所得">事業所得</option>
                    <option value="雑所得">雑所得</option>
                    <option value="不動産所得">不動産所得</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      保存
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
