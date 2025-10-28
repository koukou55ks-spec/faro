'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Users,
  Briefcase,
  Home,
  Heart,
  GraduationCap,
  Building2,
  TrendingUp,
  Shield,
  Plus,
  Edit2,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Loader2,
  Settings,
  Database,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserProfile } from '../../lib/hooks/useUserProfile'
import { useAuth } from '../../lib/hooks/useAuth'
import { CustomTabsSection } from '../../components/features/mypage/CustomTabsSection'
import { ProfileEditModal } from '../../components/features/mypage/ProfileEditModal'

export default function MyPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { profile, events, loading: profileLoading, error, createProfile, updateProfile, refetch } = useUserProfile()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(false)
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false)
  const [customFieldSection, setCustomFieldSection] = useState<string>('')
  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' })
  const [newEvent, setNewEvent] = useState({
    event_type: '',
    event_year: new Date().getFullYear(),
    description: ''
  })

  const loading = authLoading || profileLoading

  // プロフィール保存時の処理
  const handleProfileSave = async (updates: any) => {
    try {
      // プロフィールが存在しない場合は作成、存在する場合は更新
      if (!profile) {
        await createProfile(updates)
      } else {
        await updateProfile(updates)
      }
      // 保存後にプロフィールを再取得
      setTimeout(() => {
        refetch()
      }, 500)
    } catch (err) {
      console.error('[MyPage] Failed to save profile:', err)
      throw err
    }
  }

  // ライフイベント追加
  const handleAddEvent = async () => {
    if (!newEvent.event_type || !token) return

    try {
      const response = await fetch('/api/profile/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event_type: newEvent.event_type,
          event_year: newEvent.event_year,
          description: newEvent.description
        })
      })

      if (response.ok) {
        setNewEvent({
          event_type: '',
          event_year: new Date().getFullYear(),
          description: ''
        })
        setIsAddEventModalOpen(false)
        refetch()
      }
    } catch (err) {
      console.error('[MyPage] Failed to add event:', err)
    }
  }

  // カスタムフィールド追加
  const handleAddCustomField = async () => {
    if (!newCustomField.key || !newCustomField.value) return

    try {
      const customFields = profile?.custom_fields || {}
      const fieldKey = `${customFieldSection}:${newCustomField.key}`

      await updateProfile({
        custom_fields: {
          ...customFields,
          [fieldKey]: newCustomField.value
        }
      })

      setNewCustomField({ key: '', value: '' })
      setIsCustomFieldModalOpen(false)
      refetch()
    } catch (err) {
      console.error('[MyPage] Failed to add custom field:', err)
    }
  }

  // カスタムフィールド削除
  const handleDeleteCustomField = async (fieldKey: string) => {
    try {
      const customFields = { ...(profile?.custom_fields || {}) }
      delete customFields[fieldKey]

      await updateProfile({
        custom_fields: customFields
      })

      refetch()
    } catch (err) {
      console.error('[MyPage] Failed to delete custom field:', err)
    }
  }

  // セクションごとのカスタムフィールドを取得
  const getCustomFields = (section: string) => {
    if (!profile?.custom_fields) return []
    return Object.entries(profile.custom_fields)
      .filter(([key]) => key.startsWith(`${section}:`))
      .map(([key, value]) => ({
        key: key.replace(`${section}:`, ''),
        fullKey: key,
        value
      }))
  }

  // プロフィール完成度計算（簡易版）
  const calculateCompleteness = () => {
    if (!profile) return 0
    let filled = 0
    const total = 10

    if (profile.age) filled++
    if (profile.occupation) filled++
    if (profile.annual_income) filled++
    if (profile.marital_status) filled++
    if (profile.num_children !== undefined) filled++
    if (profile.prefecture) filled++
    if (profile.employment_type) filled++
    if (profile.residence_type) filled++
    if (profile.interests && profile.interests.length > 0) filled++
    if (events && events.length > 0) filled++

    return Math.round((filled / total) * 100)
  }

  const completeness = calculateCompleteness()

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">プロフィールを読み込み中...</p>
        </div>
      </div>
    )
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">エラーが発生しました</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border-2 border-white/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {user?.email || 'ゲストユーザー'}
              </h1>
              <p className="text-white/80 text-xs">
                {profile?.occupation || '職業未設定'} · 完成度 {completeness}%
              </p>
            </div>
          </div>
          <a
            href="/settings"
            className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Settings className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* メインコンテンツ - スクロール可能 */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="px-4 py-4 space-y-4 pb-20">

        {/* カスタムタブセクション（メイン） */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-2 border-purple-200 dark:border-purple-800">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">自由メモ・ファイル管理</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              自由にタブを作成して、メモやファイルを保存できます。AIチャットで自動的に参照されます。
            </p>
          </div>
          <CustomTabsSection />
        </section>

        {/* 基本情報セクション（コンパクト、折りたたみ式） */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800">
          <button
            onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">基本情報（AI参照用）</h2>
                <p className="text-xs text-blue-600 dark:text-blue-400">AIチャットで必要な時に自動参照されます</p>
              </div>
            </div>
            {isBasicInfoExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {isBasicInfoExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">

                  {/* 基本情報 */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">基本情報</h3>
                      </div>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <InfoRow icon={Calendar} label="年齢" value={profile?.age ? `${profile.age}歳` : '未設定'} compact />
                      <InfoRow icon={Briefcase} label="職業" value={profile?.occupation || '未設定'} compact />
                      <InfoRow icon={Building2} label="業種" value={profile?.industry || '未設定'} compact />
                      <InfoRow
                        icon={Building2}
                        label="雇用形態"
                        value={
                          profile?.employment_type === 'full_time' ? '正社員' :
                          profile?.employment_type === 'part_time' ? 'パート・アルバイト' :
                          profile?.employment_type === 'freelance' ? 'フリーランス' :
                          profile?.employment_type === 'self_employed' ? '自営業' :
                          profile?.employment_type === 'student' ? '学生' :
                          profile?.employment_type === 'retired' ? '退職' : '未設定'
                        }
                        compact
                      />
                      <InfoRow icon={MapPin} label="居住地" value={profile?.prefecture ? `${profile.prefecture}${profile.city ? ' ' + profile.city : ''}` : '未設定'} compact />

                      {/* カスタムフィールド */}
                      {getCustomFields('basic_info').map((field) => (
                        <div key={field.fullKey} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">{field.key}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">{field.value}</span>
                            <button
                              onClick={() => handleDeleteCustomField(field.fullKey)}
                              className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* カスタム項目追加ボタン */}
                    <button
                      onClick={() => {
                        setCustomFieldSection('basic_info')
                        setIsCustomFieldModalOpen(true)
                      }}
                      className="w-full mt-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      カスタム項目を追加
                    </button>
                  </div>

                  {/* 家族構成 */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">家族構成</h3>
                      </div>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <InfoRow
                        icon={Heart}
                        label="婚姻状況"
                        value={
                          profile?.marital_status === 'single' ? '独身' :
                          profile?.marital_status === 'married' ? '既婚' :
                          profile?.marital_status === 'divorced' ? '離婚' :
                          profile?.marital_status === 'widowed' ? '死別' : '未設定'
                        }
                        compact
                      />
                      <InfoRow icon={GraduationCap} label="子供" value={profile?.num_children ? `${profile.num_children}人` : '0人'} compact />
                      <InfoRow icon={Users} label="扶養家族" value={profile?.num_dependents ? `${profile.num_dependents}人` : '0人'} compact />

                      {/* カスタムフィールド */}
                      {getCustomFields('family').map((field) => (
                        <div key={field.fullKey} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">{field.key}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">{field.value}</span>
                            <button
                              onClick={() => handleDeleteCustomField(field.fullKey)}
                              className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* カスタム項目追加ボタン */}
                    <button
                      onClick={() => {
                        setCustomFieldSection('family')
                        setIsCustomFieldModalOpen(true)
                      }}
                      className="w-full mt-2 py-1.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      カスタム項目を追加
                    </button>
                  </div>

                  {/* 収入情報 */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">収入情報</h3>
                      </div>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <InfoRow
                        icon={TrendingUp}
                        label="年収"
                        value={profile?.annual_income ? `${Math.round(profile.annual_income / 10000).toLocaleString()}万円` : '未設定'}
                        highlight={!!profile?.annual_income}
                        compact
                      />
                      <InfoRow
                        icon={TrendingUp}
                        label="世帯年収"
                        value={profile?.household_income ? `${Math.round(profile.household_income / 10000).toLocaleString()}万円` : '未設定'}
                        highlight={!!profile?.household_income}
                        compact
                      />
                      <InfoRow
                        icon={Home}
                        label="住居"
                        value={
                          profile?.residence_type === 'owned' ? '持ち家' :
                          profile?.residence_type === 'rented' ? '賃貸' :
                          profile?.residence_type === 'family_owned' ? '家族所有' :
                          profile?.residence_type === 'company_housing' ? '社宅' : '未設定'
                        }
                        compact
                      />

                      {/* カスタムフィールド */}
                      {getCustomFields('income').map((field) => (
                        <div key={field.fullKey} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">{field.key}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">{field.value}</span>
                            <button
                              onClick={() => handleDeleteCustomField(field.fullKey)}
                              className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* カスタム項目追加ボタン */}
                    <button
                      onClick={() => {
                        setCustomFieldSection('income')
                        setIsCustomFieldModalOpen(true)
                      }}
                      className="w-full mt-2 py-1.5 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      カスタム項目を追加
                    </button>
                  </div>

                  {/* 利用中の制度・サービス */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">利用中の制度</h3>
                      </div>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {/* 金融状況 */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">金融状況</p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile?.has_mortgage && <Tag label="住宅ローン" color="orange" />}
                          {profile?.has_savings && <Tag label="貯蓄あり" color="green" />}
                          {profile?.has_investments && <Tag label="投資運用中" color="blue" />}
                          {!profile?.has_mortgage && !profile?.has_savings && !profile?.has_investments && (
                            <p className="text-xs text-gray-400">未設定</p>
                          )}
                        </div>
                      </div>

                      {/* 関心事 */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">関心のあること</p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile?.interests && profile.interests.length > 0 ? (
                            profile.interests.map((interest, idx) => (
                              <Tag key={idx} label={interest} color="purple" />
                            ))
                          ) : (
                            <p className="text-xs text-gray-400">未設定</p>
                          )}
                        </div>
                      </div>

                      {/* 人生の目標 */}
                      {profile?.life_goals && profile.life_goals.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">人生の目標</p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.life_goals.map((goal, idx) => (
                              <Tag key={idx} label={goal} color="indigo" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ライフイベント */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-pink-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ライフイベント</h3>
                      </div>
                      <button
                        onClick={() => setIsAddEventModalOpen(true)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {events && events.length > 0 ? (
                      <div className="space-y-1.5">
                        {events.map((event) => {
                          const eventTypeMap: Record<string, string> = {
                            birth: '誕生',
                            marriage: '結婚',
                            divorce: '離婚',
                            child_birth: '出産',
                            job_change: '転職',
                            promotion: '昇進',
                            retirement: '退職',
                            house_purchase: '住宅購入',
                            house_sale: '住宅売却',
                            relocation: '転居',
                            inheritance: '相続',
                            business_start: '起業',
                            business_close: '事業終了',
                            illness: '病気',
                            accident: '事故',
                            other: 'その他'
                          }

                          return (
                            <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div className="flex-1">
                                <span className="text-xs text-gray-900 dark:text-white font-medium">
                                  {eventTypeMap[event.event_type] || event.event_type}
                                </span>
                                {event.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.description}</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {event.event_date ? new Date(event.event_date).getFullYear() : event.event_year}年
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        結婚、出産、住宅購入などのライフイベントを追加
                      </p>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
      />

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddEventModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsAddEventModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                ライフイベントを追加
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    イベント種類
                  </label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">選択してください</option>
                    <option value="marriage">結婚</option>
                    <option value="child_birth">出産</option>
                    <option value="house_purchase">住宅購入</option>
                    <option value="job_change">転職</option>
                    <option value="retirement">退職</option>
                    <option value="business_start">起業</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    予定年
                  </label>
                  <input
                    type="number"
                    value={newEvent.event_year}
                    onChange={(e) => setNewEvent({ ...newEvent, event_year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    詳細（任意）
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddEventModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleAddEvent}
                    disabled={!newEvent.event_type}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    追加
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Custom Field Modal */}
      <AnimatePresence>
        {isCustomFieldModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setIsCustomFieldModalOpen(false)
              setNewCustomField({ key: '', value: '' })
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                カスタム項目を追加
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    項目名
                  </label>
                  <input
                    type="text"
                    value={newCustomField.key}
                    onChange={(e) => setNewCustomField({ ...newCustomField, key: e.target.value })}
                    placeholder="例: 持病、趣味、ペット"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    内容
                  </label>
                  <input
                    type="text"
                    value={newCustomField.value}
                    onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
                    placeholder="例: なし、登山、犬1匹"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCustomFieldModalOpen(false)
                      setNewCustomField({ key: '', value: '' })
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleAddCustomField}
                    disabled={!newCustomField.key || !newCustomField.value}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    追加
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// InfoRow コンポーネント
interface InfoRowProps {
  icon: React.ElementType
  label: string
  value: string
  highlight?: boolean
  compact?: boolean
}

function InfoRow({ icon: Icon, label, value, highlight = false, compact = false }: InfoRowProps) {
  return (
    <div className={`flex items-center justify-between ${compact ? 'py-1' : 'py-1.5'}`}>
      <div className="flex items-center gap-2">
        <Icon className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-gray-400 dark:text-gray-500`} />
        <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>{label}</span>
      </div>
      <span className={`${compact ? 'text-xs' : 'text-sm'} ${highlight ? 'font-semibold text-purple-600 dark:text-purple-400' : 'font-medium text-gray-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  )
}

// Tag コンポーネント
interface TagProps {
  label: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
}

function Tag({ label, color }: TagProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}
