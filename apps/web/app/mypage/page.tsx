'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
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
  Sparkles,
  Plus,
  Edit2,
  Check,
  X,
  ChevronRight,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Loader2,
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserProfile } from '../../lib/hooks/useUserProfile'
import { useAuth } from '../../lib/hooks/useAuth'
import { useSubscription } from '../../lib/hooks/useSubscription'
import { CustomTabsSection } from '../../components/features/mypage/CustomTabsSection'
import { ProfileEditModal } from '../../components/features/mypage/ProfileEditModal'

// 大きなコンポーネントは動的インポートでバンドルサイズを削減
const SystemTabPanel = dynamic(
  () => import('../../components/features/system-tabs/SystemTabPanel'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    ),
    ssr: false, // クライアントサイドのみで読み込む
  }
)

export default function MyPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { profile, events, loading: profileLoading, error, createProfile, updateProfile, refetch } = useUserProfile()
  const { subscription, usage, loading: subLoading } = useSubscription()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    event_type: '',
    event_year: new Date().getFullYear(),
    description: ''
  })

  const loading = authLoading || profileLoading || subLoading

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

      if (!response.ok) throw new Error('Failed to add event')

      // リセット
      setNewEvent({
        event_type: '',
        event_year: new Date().getFullYear(),
        description: ''
      })
      setIsAddEventModalOpen(false)

      // 再取得
      setTimeout(() => {
        refetch()
      }, 500)
    } catch (err) {
      console.error('[MyPage] Failed to add event:', err)
      alert('ライフイベントの追加に失敗しました')
    }
  }

  // デバッグ情報をコンソールに出力
  useEffect(() => {
    console.log('[MyPage] Auth state:', { user: user?.email, authLoading, profileLoading, subLoading })
  }, [user, authLoading, profileLoading, subLoading])

  // ログインしていない場合
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ログインが必要です
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            マイページを表示するには、ログインしてください。
          </p>
          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              メールアドレスでログイン
            </a>
            <a
              href="/signup"
              className="block w-full px-6 py-3 bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 rounded-lg font-semibold transition-colors"
            >
              新規登録
            </a>
          </div>
        </div>
      </div>
    )
  }

  // 情報の完成度を計算（より詳細に）
  const calculateCompleteness = () => {
    if (!profile) return 0

    let total = 0
    let filled = 0

    // 基本情報 (8項目)
    total += 8
    if (profile.age) filled++
    if (profile.birth_year) filled++
    if (profile.gender) filled++
    if (profile.occupation) filled++
    if (profile.employment_type) filled++
    if (profile.prefecture) filled++
    if (profile.city) filled++
    if (profile.industry) filled++

    // 家族構成 (3項目)
    total += 3
    if (profile.marital_status) filled++
    if (profile.num_children !== undefined && profile.num_children !== null) filled++
    if (profile.num_dependents !== undefined && profile.num_dependents !== null) filled++

    // 収入情報 (3項目)
    total += 3
    if (profile.annual_income) filled++
    if (profile.household_income) filled++
    if (profile.residence_type) filled++

    // 関心事・目標 (3項目)
    total += 3
    if (profile.interests && profile.interests.length > 0) filled++
    if (profile.life_goals && profile.life_goals.length > 0) filled++
    if (profile.concerns && profile.concerns.length > 0) filled++

    // 金融状況 (3項目) - booleanなので値がセットされていればカウント
    total += 3
    if (profile.has_mortgage !== undefined && profile.has_mortgage !== null) filled++
    if (profile.has_savings !== undefined && profile.has_savings !== null) filled++
    if (profile.has_investments !== undefined && profile.has_investments !== null) filled++

    return total > 0 ? Math.round((filled / total) * 100) : 0
  }

  const completeness = calculateCompleteness()

  // AIによる分析・助言を生成（実際はAPI呼び出し）
  const generateAIAdvice = () => {
    if (!profile) return []

    const advice = []

    // 年収ベースの助言
    if (profile.annual_income) {
      if (profile.annual_income >= 20000000) {
        advice.push('高所得者向けの節税策（法人化、不動産投資）を検討しましょう')
      } else if (profile.annual_income >= 10000000) {
        advice.push('ふるさと納税の限度額は約' + Math.floor(profile.annual_income * 0.023).toLocaleString() + '円です')
      } else if (profile.annual_income >= 3000000) {
        advice.push('ふるさと納税の限度額は約' + Math.floor(profile.annual_income * 0.020).toLocaleString() + '円です')
      }
    }

    // 家族構成ベースの助言
    if (profile.marital_status === 'married') {
      advice.push('配偶者控除や配偶者特別控除が利用できる可能性があります')
    }

    if (profile.num_children && profile.num_children > 0) {
      advice.push('扶養控除で最大' + (profile.num_children * 380000).toLocaleString() + '円の控除が受けられます')
    }

    // 関心事ベースの助言
    if (profile.interests) {
      if (profile.interests.includes('NISA') && !profile.has_investments) {
        advice.push('NISAを活用すると年間最大360万円の非課税投資が可能です')
      }
      if (profile.interests.includes('iDeCo') && profile.employment_type === 'full_time') {
        advice.push('iDeCoで掛金全額が所得控除になります（会社員は年間27.6万円まで）')
      }
      if (profile.interests.includes('住宅購入') && !profile.has_mortgage) {
        advice.push('住宅ローン控除で最大400万円の控除が受けられます')
      }
    }

    // 投資状況ベースの助言
    if (profile.has_investments && profile.annual_income && profile.annual_income > 5000000) {
      advice.push('投資収益の確定申告を忘れずに。損益通算で税負担を軽減できます')
    }

    // 不安・関心事への対応
    if (profile.concerns) {
      if (profile.concerns.includes('税金対策')) {
        advice.push('節税の基本は控除の最大活用です。医療費控除、生命保険料控除なども確認しましょう')
      }
      if (profile.concerns.includes('年金不安')) {
        advice.push('公的年金だけでなく、iDeCoやNISAで私的年金を準備することを検討しましょう')
      }
    }

    if (advice.length === 0) {
      advice.push('もっと情報を追加すると、より具体的なアドバイスができます')
    }

    return advice
  }

  const aiAdvice = generateAIAdvice()

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
      <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {user?.email || 'ゲストユーザー'}
              </h1>
              <p className="text-white/80 text-sm">
                {profile?.occupation || '職業未設定'}
              </p>
            </div>
          </div>
          <a
            href="/settings"
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </a>
        </div>

        {/* 完成度インジケーター */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 border border-white/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/90 text-sm font-medium">プロフィール完成度</span>
            <span className="text-white font-bold text-lg">{completeness}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-white h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-white/70 text-xs mt-2">
            {completeness < 50 ? '基本情報を追加して、より正確なアドバイスを受けましょう' :
             completeness < 80 ? 'もう少しで完璧！追加情報でさらに精度UP' :
             '素晴らしい！Faroが最適なアドバイスを提供できます'}
          </p>
        </div>
      </div>

      {/* メインコンテンツ - スクロール可能 */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="px-4 -mt-4 space-y-4 pb-20">
        {/* システムタブセクション（構造化データ） - AIが参照する重要情報 */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 shadow-sm border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">AI用の詳細情報</h2>
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                AI参照
              </span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              AIが必要な情報だけを自動取得
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            ここに入力した情報は、AIチャットで質問した時に必要な項目だけが自動で参照されます。
            より正確なアドバイスのために、基本情報だけでも入力してください。
          </p>
          {token && (
            <SystemTabPanel
              token={token}
              onSaveSuccess={() => {
                refetch()
              }}
            />
          )}
        </section>

        {/* サブスクリプション状況 */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">プラン状況</h2>
            </div>
            {subscription?.plan === 'free' && (
              <button
                className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                onClick={() => alert('Pro版へのアップグレードは準備中です')}
              >
                Proにアップグレード
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">現在のプラン</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                subscription?.plan === 'pro'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {subscription?.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            </div>

            {/* AI利用状況 */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">AI相談利用</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {usage?.chat_count || 0} / {subscription?.plan === 'pro' ? '1000' : '30'} 回
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full ${
                    ((usage?.chat_count || 0) / (subscription?.plan === 'pro' ? 1000 : 30)) > 0.8
                      ? 'bg-orange-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((usage?.chat_count || 0) / (subscription?.plan === 'pro' ? 1000 : 30)) * 100)}%`
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subscription?.plan === 'free'
                  ? 'Freeプラン: 月30回まで'
                  : 'Proプラン: 月1000回まで'}
              </p>
            </div>
          </div>
        </section>

        {/* AI助言セクション */}
        {aiAdvice.length > 0 && (
          <section className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-5 shadow-sm border border-purple-100 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">AI助言</h2>
              </div>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                あなた専用のアドバイス
              </span>
            </div>
            <div className="space-y-2">
              {aiAdvice.map((advice, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {advice}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                プロフィール情報をもっと追加すると、より具体的なアドバイスができます
              </p>
            </div>
          </section>
        )}

        {/* 基本情報 */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">基本情報</h2>
            </div>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            <InfoRow icon={Calendar} label="年齢" value={profile?.age ? `${profile.age}歳` : '未設定'} />
            <InfoRow icon={Briefcase} label="職業" value={profile?.occupation || '未設定'} />
            <InfoRow icon={Building2} label="業種" value={profile?.industry || '未設定'} />
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
            />
            <InfoRow icon={MapPin} label="居住地" value={profile?.prefecture ? `${profile.prefecture}${profile.city ? ' ' + profile.city : ''}` : '未設定'} />
          </div>
        </section>

        {/* 家族構成 */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">家族構成</h2>
            </div>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={Heart}
              label="婚姻状況"
              value={
                profile?.marital_status === 'single' ? '独身' :
                profile?.marital_status === 'married' ? '既婚' :
                profile?.marital_status === 'divorced' ? '離婚' :
                profile?.marital_status === 'widowed' ? '死別' : '未設定'
              }
            />
            <InfoRow icon={GraduationCap} label="子供" value={profile?.num_children ? `${profile.num_children}人` : '0人'} />
            <InfoRow icon={Users} label="扶養家族" value={profile?.num_dependents ? `${profile.num_dependents}人` : '0人'} />
          </div>
        </section>

        {/* 収入情報 */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">収入情報</h2>
            </div>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={TrendingUp}
              label="年収"
              value={profile?.annual_income ? `${Math.round(profile.annual_income / 10000).toLocaleString()}万円` : '未設定'}
              highlight={!!profile?.annual_income}
            />
            <InfoRow
              icon={TrendingUp}
              label="世帯年収"
              value={profile?.household_income ? `${Math.round(profile.household_income / 10000).toLocaleString()}万円` : '未設定'}
              highlight={!!profile?.household_income}
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
            />
          </div>
        </section>

        {/* 利用中の制度・サービス */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">利用中の制度・サービス</h2>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-2">
            {/* 金融状況 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">金融状況</p>
              <div className="flex flex-wrap gap-2">
                {profile?.has_mortgage && <Tag label="住宅ローン" color="orange" />}
                {profile?.has_savings && <Tag label="貯蓄あり" color="green" />}
                {profile?.has_investments && <Tag label="投資運用中" color="blue" />}
                {!profile?.has_mortgage && !profile?.has_savings && !profile?.has_investments && (
                  <p className="text-xs text-gray-400">未設定</p>
                )}
              </div>
            </div>

            {/* 関心事 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">関心のあること</p>
              <div className="flex flex-wrap gap-2">
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
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">人生の目標</p>
              <div className="flex flex-wrap gap-2">
                {profile?.life_goals && profile.life_goals.length > 0 ? (
                  profile.life_goals.map((goal, idx) => (
                    <Tag key={idx} label={goal} color="indigo" />
                  ))
                ) : (
                  <p className="text-xs text-gray-400">未設定</p>
                )}
              </div>
            </div>

            {/* 不安・悩み */}
            {profile?.concerns && profile.concerns.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">不安・悩み</p>
                <div className="flex flex-wrap gap-2">
                  {profile.concerns.map((concern, idx) => (
                    <Tag key={idx} label={concern} color="red" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 予定されているライフイベント */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">ライフイベント予定</h2>
            </div>
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {events && events.length > 0 ? (
            <div className="space-y-2">
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
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="flex-1">
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {eventTypeMap[event.event_type] || event.event_type}
                      </span>
                      {event.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
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
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                結婚、出産、住宅購入など、ライフイベントを追加すると<br />
                より長期的な視点でアドバイスができます
              </p>
            </div>
          )}
        </section>

        {/* カスタムタブセクション（NotebookLM風） */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">自由メモ・ファイル管理</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              自由にタブを作成して、メモやファイルを保存できます。
            </p>
          </div>
          <CustomTabsSection />
        </section>

        {/* 情報追加を促すCTA */}
        {completeness < 80 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-center shadow-xl"
          >
            <Sparkles className="w-12 h-12 text-white mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">
              もっと詳しく教えてください
            </h3>
            <p className="text-white/90 text-sm mb-4">
              情報が充実するほど、Faroはあなたに最適な<br />
              税金アドバイスを提供できます
            </p>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              プロフィールを完成させる
            </button>
          </motion.div>
        )}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddEventModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  ライフイベントを追加
                </h3>
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    イベント種類
                  </label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">選択してください</option>
                    <option value="marriage">結婚</option>
                    <option value="child_birth">出産</option>
                    <option value="job_change">転職</option>
                    <option value="promotion">昇進</option>
                    <option value="retirement">退職</option>
                    <option value="house_purchase">住宅購入</option>
                    <option value="house_sale">住宅売却</option>
                    <option value="relocation">転居</option>
                    <option value="inheritance">相続</option>
                    <option value="business_start">起業</option>
                    <option value="business_close">事業終了</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    予定年
                  </label>
                  <input
                    type="number"
                    value={newEvent.event_year}
                    onChange={(e) => setNewEvent({ ...newEvent, event_year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    メモ（任意）
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="例: 第一子誕生予定"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddEvent}
                  disabled={!newEvent.event_type}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  追加
                </button>
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 情報行コンポーネント
function InfoRow({
  icon: Icon,
  label,
  value,
  highlight = false
}: {
  icon: any
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  )
}

// タグコンポーネント
function Tag({ label, color }: { label: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}>
      {label}
    </span>
  )
}
