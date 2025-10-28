'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Save, CheckCircle } from 'lucide-react'
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
    birth_year: '',
    gender: '',
    occupation: '',
    employment_type: '',
    prefecture: '',
    city: '',
    industry: '',
    marital_status: '',
    num_children: '',
    num_dependents: '',
    annual_income: '',
    household_income: '',
    residence_type: '',
    has_mortgage: false,
    has_savings: false,
    has_investments: false,
    interests: [] as string[],
    life_goals: [] as string[],
    concerns: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        age: profile.age?.toString() || '',
        birth_year: profile.birth_year?.toString() || '',
        gender: profile.gender || '',
        occupation: profile.occupation || '',
        employment_type: profile.employment_type || '',
        prefecture: profile.prefecture || '',
        city: profile.city || '',
        industry: profile.industry || '',
        marital_status: profile.marital_status || '',
        num_children: profile.num_children?.toString() || '',
        num_dependents: profile.num_dependents?.toString() || '',
        // 円を万円に変換して表示
        annual_income: profile.annual_income ? Math.round(profile.annual_income / 10000).toString() : '',
        household_income: profile.household_income ? Math.round(profile.household_income / 10000).toString() : '',
        residence_type: profile.residence_type || '',
        has_mortgage: profile.has_mortgage || false,
        has_savings: profile.has_savings || false,
        has_investments: profile.has_investments || false,
        interests: profile.interests || [],
        life_goals: profile.life_goals || [],
        concerns: profile.concerns || []
      })
      setError(null)
      setSuccessMessage(null)
    }
  }, [profile, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // バリデーション
      const updates: any = {}

      // 数値フィールド
      if (formData.age) {
        const age = parseInt(formData.age)
        if (age < 0 || age > 150) throw new Error('年齢は0〜150の範囲で入力してください')
        updates.age = age
      }

      if (formData.birth_year) {
        const year = parseInt(formData.birth_year)
        const currentYear = new Date().getFullYear()
        if (year < 1900 || year > currentYear) throw new Error('生年は1900年〜現在の範囲で入力してください')
        updates.birth_year = year
      }

      if (formData.num_children) {
        const num = parseInt(formData.num_children)
        if (num < 0) throw new Error('子供の数は0以上で入力してください')
        updates.num_children = num
      }

      if (formData.num_dependents) {
        const num = parseInt(formData.num_dependents)
        if (num < 0) throw new Error('扶養家族数は0以上で入力してください')
        updates.num_dependents = num
      }

      if (formData.annual_income) {
        const income = parseInt(formData.annual_income)
        if (income < 0) throw new Error('年収は0以上で入力してください')
        // 万円を円に変換して保存
        updates.annual_income = income * 10000
      }

      if (formData.household_income) {
        const income = parseInt(formData.household_income)
        if (income < 0) throw new Error('世帯年収は0以上で入力してください')
        // 万円を円に変換して保存
        updates.household_income = income * 10000
      }

      // テキストフィールド
      if (formData.gender) updates.gender = formData.gender
      if (formData.occupation) updates.occupation = formData.occupation
      if (formData.employment_type) updates.employment_type = formData.employment_type
      if (formData.prefecture) updates.prefecture = formData.prefecture
      if (formData.city) updates.city = formData.city
      if (formData.industry) updates.industry = formData.industry
      if (formData.marital_status) updates.marital_status = formData.marital_status
      if (formData.residence_type) updates.residence_type = formData.residence_type

      // ブール値フィールド
      updates.has_mortgage = formData.has_mortgage
      updates.has_savings = formData.has_savings
      updates.has_investments = formData.has_investments

      // 配列フィールド
      if (formData.interests.length > 0) updates.interests = formData.interests
      if (formData.life_goals.length > 0) updates.life_goals = formData.life_goals
      if (formData.concerns.length > 0) updates.concerns = formData.concerns

      await onSave(updates)
      setSuccessMessage('プロフィールを更新しました')

      // 1秒後に閉じる
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error('[ProfileEditModal] Failed to update profile:', err)
      setError(err.message || 'プロフィールの更新に失敗しました')
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
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  基本情報
                </h3>
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
                      min="0"
                      max="150"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      生年（西暦）
                    </label>
                    <input
                      type="number"
                      value={formData.birth_year}
                      onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="例: 1990"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      性別
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">選択してください</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他</option>
                      <option value="prefer_not_to_say">回答しない</option>
                    </select>
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
                      <option value="full_time">正社員</option>
                      <option value="part_time">パート・アルバイト</option>
                      <option value="freelance">フリーランス</option>
                      <option value="self_employed">自営業</option>
                      <option value="student">学生</option>
                      <option value="retired">退職</option>
                      <option value="unemployed">無職</option>
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
                </div>
              </section>

              {/* 居住情報 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  居住情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      市区町村
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="例: 渋谷区"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      住居形態
                    </label>
                    <select
                      value={formData.residence_type}
                      onChange={(e) => setFormData({ ...formData, residence_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">選択してください</option>
                      <option value="owned">持ち家</option>
                      <option value="rented">賃貸</option>
                      <option value="family_owned">家族所有</option>
                      <option value="company_housing">社宅</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 家族構成 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  家族構成
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option value="single">独身</option>
                      <option value="married">既婚</option>
                      <option value="divorced">離婚</option>
                      <option value="widowed">死別</option>
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
                      扶養家族数
                    </label>
                    <input
                      type="number"
                      value={formData.num_dependents}
                      onChange={(e) => setFormData({ ...formData, num_dependents: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="例: 3"
                      min="0"
                    />
                  </div>
                </div>
              </section>

              {/* 収入情報 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  収入情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      世帯年収（万円）
                    </label>
                    <input
                      type="number"
                      value={formData.household_income}
                      onChange={(e) => setFormData({ ...formData, household_income: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="例: 700"
                      step="10"
                      min="0"
                    />
                  </div>
                </div>
              </section>

              {/* 金融状況 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  金融状況
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.has_mortgage}
                      onChange={(e) => setFormData({ ...formData, has_mortgage: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">住宅ローンあり</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.has_savings}
                      onChange={(e) => setFormData({ ...formData, has_savings: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">貯蓄あり</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.has_investments}
                      onChange={(e) => setFormData({ ...formData, has_investments: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">投資運用中</span>
                  </label>
                </div>
              </section>

              {/* 関心事 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  関心のあること
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  興味のある制度やトピックを選択してください（複数選択可）
                </p>
                <div className="flex flex-wrap gap-2">
                  {['NISA', 'iDeCo', 'ふるさと納税', '医療費控除', '住宅ローン控除', '住宅購入', '相続対策', '不動産投資', '株式投資', '仮想通貨', '副業', '起業'].map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        const newInterests = formData.interests.includes(interest)
                          ? formData.interests.filter(i => i !== interest)
                          : [...formData.interests, interest]
                        setFormData({ ...formData, interests: newInterests })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.interests.includes(interest)
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-2 border-purple-500'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </section>

              {/* 人生の目標 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  人生の目標
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  達成したいことを選択してください（複数選択可）
                </p>
                <div className="flex flex-wrap gap-2">
                  {['老後資金準備', '早期リタイア', '子供の教育資金', '住宅購入', 'マイホーム完済', '資産1億円', '経済的自由', '海外移住', '起業', 'セミリタイア'].map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => {
                        const newGoals = formData.life_goals.includes(goal)
                          ? formData.life_goals.filter(g => g !== goal)
                          : [...formData.life_goals, goal]
                        setFormData({ ...formData, life_goals: newGoals })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.life_goals.includes(goal)
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-2 border-indigo-500'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </section>

              {/* 不安・悩み */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  不安・悩み
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  気になることを選択してください（複数選択可）
                </p>
                <div className="flex flex-wrap gap-2">
                  {['税金対策', '年金不安', '老後資金不足', '教育費負担', '住宅ローン返済', '投資の知識不足', '収入減少リスク', '医療費負担', '介護費用', '相続トラブル'].map(concern => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => {
                        const newConcerns = formData.concerns.includes(concern)
                          ? formData.concerns.filter(c => c !== concern)
                          : [...formData.concerns, concern]
                        setFormData({ ...formData, concerns: newConcerns })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formData.concerns.includes(concern)
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-2 border-red-500'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </section>

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
