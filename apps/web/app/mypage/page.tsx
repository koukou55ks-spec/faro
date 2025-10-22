'use client'

import { useState } from 'react'
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
  MapPin
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// パーソナル情報のカテゴリ
interface PersonalInfo {
  // 基本情報
  name: string
  age: number
  occupation: string
  employmentType: 'employee' | 'freelance' | 'business_owner' | 'part_time' | 'other'
  residence: string

  // 家族構成
  maritalStatus: 'single' | 'married' | 'divorced' | 'other'
  spouse?: {
    hasIncome: boolean
    annualIncome?: number
  }
  dependents: {
    children: number
    childrenUnder16: number
    parents: number
    other: number
  }

  // 収入情報
  annualIncome: number
  incomeType: 'salary' | 'business' | 'multiple' | 'other'

  // 利用中の制度・サービス
  activeServices: string[]

  // 保険
  insurances: {
    lifeInsurance: boolean
    medicalInsurance: boolean
    earthquakeInsurance: boolean
    pension: boolean
  }

  // 投資・資産運用
  investments: {
    nisa: boolean
    iDeCo: boolean
    stocks: boolean
    realEstate: boolean
    other: string[]
  }

  // ライフイベント予定
  upcomingEvents: Array<{
    event: string
    year: number
  }>
}

const initialPersonalInfo: PersonalInfo = {
  name: 'ゲストユーザー',
  age: 30,
  occupation: '',
  employmentType: 'employee',
  residence: '',
  maritalStatus: 'single',
  dependents: {
    children: 0,
    childrenUnder16: 0,
    parents: 0,
    other: 0
  },
  annualIncome: 0,
  incomeType: 'salary',
  activeServices: [],
  insurances: {
    lifeInsurance: false,
    medicalInsurance: false,
    earthquakeInsurance: false,
    pension: false
  },
  investments: {
    nisa: false,
    iDeCo: false,
    stocks: false,
    realEstate: false,
    other: []
  },
  upcomingEvents: []
}

export default function MyPage() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialPersonalInfo)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)

  // 情報の完成度を計算
  const calculateCompleteness = () => {
    let total = 0
    let filled = 0

    // 基本情報 (5項目)
    total += 5
    if (personalInfo.name !== 'ゲストユーザー') filled++
    if (personalInfo.age > 0) filled++
    if (personalInfo.occupation) filled++
    if (personalInfo.employmentType) filled++
    if (personalInfo.residence) filled++

    // 家族構成 (2項目)
    total += 2
    if (personalInfo.maritalStatus) filled++
    if (personalInfo.dependents.children >= 0) filled++

    // 収入情報 (2項目)
    total += 2
    if (personalInfo.annualIncome > 0) filled++
    if (personalInfo.incomeType) filled++

    // 制度・サービス (1項目)
    total += 1
    if (personalInfo.activeServices.length > 0) filled++

    // 保険 (1項目)
    total += 1
    const hasInsurance = Object.values(personalInfo.insurances).some(v => v)
    if (hasInsurance) filled++

    // 投資 (1項目)
    total += 1
    const hasInvestment = personalInfo.investments.nisa || personalInfo.investments.iDeCo || personalInfo.investments.stocks
    if (hasInvestment) filled++

    return Math.round((filled / total) * 100)
  }

  const completeness = calculateCompleteness()

  // AIによる分析・助言を生成（実際はAPI呼び出し）
  const generateAIAdvice = () => {
    const advice = []

    // 年収ベースの助言
    if (personalInfo.annualIncome > 0) {
      if (personalInfo.annualIncome >= 20000000) {
        advice.push('高所得者向けの節税策（法人化、不動産投資）を検討しましょう')
      } else if (personalInfo.annualIncome >= 10000000) {
        advice.push('ふるさと納税の限度額は約' + Math.floor(personalInfo.annualIncome * 0.023) + '円です')
      }
    }

    // 家族構成ベースの助言
    if (personalInfo.maritalStatus === 'married' && personalInfo.spouse?.hasIncome === false) {
      advice.push('配偶者控除（38万円）を忘れずに申告しましょう')
    }

    if (personalInfo.dependents.children > 0) {
      advice.push('扶養控除で' + (personalInfo.dependents.children * 380000) + '円の控除が受けられます')
    }

    // 投資ベースの助言
    if (!personalInfo.investments.nisa && personalInfo.annualIncome > 3000000) {
      advice.push('NISAを活用すると年間最大360万円の非課税投資が可能です')
    }

    if (!personalInfo.investments.iDeCo && personalInfo.employmentType === 'employee') {
      advice.push('iDeCoで掛金全額が所得控除になります（年間27.6万円まで）')
    }

    // 保険ベースの助言
    if (personalInfo.insurances.lifeInsurance || personalInfo.insurances.medicalInsurance) {
      advice.push('生命保険料控除で最大12万円の控除を受けられます')
    }

    if (advice.length === 0) {
      advice.push('もっと情報を追加すると、より具体的なアドバイスができます')
    }

    return advice
  }

  const aiAdvice = generateAIAdvice()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {personalInfo.name}
              </h1>
              <p className="text-white/80 text-sm">
                {personalInfo.occupation || '職業未設定'}
              </p>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-white/80" />
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

      <div className="px-4 -mt-4 space-y-4">
        {/* AIによる分析・助言 */}
        {completeness >= 30 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Faroからの助言
              </h3>
            </div>
            <div className="space-y-2">
              {aiAdvice.map((advice, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {advice}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
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
              onClick={() => alert('編集機能は準備中です')}
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            <InfoRow icon={User} label="名前" value={personalInfo.name} />
            <InfoRow icon={Calendar} label="年齢" value={personalInfo.age > 0 ? `${personalInfo.age}歳` : '未設定'} />
            <InfoRow icon={Briefcase} label="職業" value={personalInfo.occupation || '未設定'} />
            <InfoRow
              icon={Building2}
              label="雇用形態"
              value={
                personalInfo.employmentType === 'employee' ? '会社員' :
                personalInfo.employmentType === 'freelance' ? 'フリーランス' :
                personalInfo.employmentType === 'business_owner' ? '事業主' :
                personalInfo.employmentType === 'part_time' ? 'パート・アルバイト' : 'その他'
              }
            />
            <InfoRow icon={MapPin} label="居住地" value={personalInfo.residence || '未設定'} />
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
              onClick={() => alert('編集機能は準備中です')}
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={Heart}
              label="婚姻状況"
              value={
                personalInfo.maritalStatus === 'single' ? '独身' :
                personalInfo.maritalStatus === 'married' ? '既婚' :
                personalInfo.maritalStatus === 'divorced' ? '離婚' : 'その他'
              }
            />
            {personalInfo.maritalStatus === 'married' && (
              <InfoRow
                icon={User}
                label="配偶者の収入"
                value={personalInfo.spouse?.hasIncome ? `年間${(personalInfo.spouse.annualIncome || 0).toLocaleString()}円` : '収入なし'}
              />
            )}
            <InfoRow icon={GraduationCap} label="子供" value={`${personalInfo.dependents.children}人`} />
            {personalInfo.dependents.children > 0 && (
              <InfoRow icon={GraduationCap} label="16歳未満の子供" value={`${personalInfo.dependents.childrenUnder16}人`} />
            )}
            <InfoRow icon={Home} label="扶養中の親" value={`${personalInfo.dependents.parents}人`} />
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
              onClick={() => alert('編集機能は準備中です')}
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={TrendingUp}
              label="年収"
              value={personalInfo.annualIncome > 0 ? `${personalInfo.annualIncome.toLocaleString()}円` : '未設定'}
              highlight={personalInfo.annualIncome > 0}
            />
            <InfoRow
              icon={FileText}
              label="収入タイプ"
              value={
                personalInfo.incomeType === 'salary' ? '給与所得' :
                personalInfo.incomeType === 'business' ? '事業所得' :
                personalInfo.incomeType === 'multiple' ? '複数の収入源' : 'その他'
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
            {/* 保険 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">保険</p>
              <div className="flex flex-wrap gap-2">
                {personalInfo.insurances.lifeInsurance && <Tag label="生命保険" color="blue" />}
                {personalInfo.insurances.medicalInsurance && <Tag label="医療保険" color="green" />}
                {personalInfo.insurances.earthquakeInsurance && <Tag label="地震保険" color="red" />}
                {personalInfo.insurances.pension && <Tag label="年金" color="purple" />}
                {!Object.values(personalInfo.insurances).some(v => v) && (
                  <p className="text-xs text-gray-400">未設定</p>
                )}
              </div>
            </div>

            {/* 投資・資産運用 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">投資・資産運用</p>
              <div className="flex flex-wrap gap-2">
                {personalInfo.investments.nisa && <Tag label="NISA" color="purple" />}
                {personalInfo.investments.iDeCo && <Tag label="iDeCo" color="indigo" />}
                {personalInfo.investments.stocks && <Tag label="株式投資" color="blue" />}
                {personalInfo.investments.realEstate && <Tag label="不動産投資" color="orange" />}
                {personalInfo.investments.other.map((item, idx) => (
                  <Tag key={idx} label={item} color="gray" />
                ))}
                {!personalInfo.investments.nisa && !personalInfo.investments.iDeCo && !personalInfo.investments.stocks && !personalInfo.investments.realEstate && (
                  <p className="text-xs text-gray-400">未設定</p>
                )}
              </div>
            </div>

            {/* その他の制度 */}
            {personalInfo.activeServices.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">その他</p>
                <div className="flex flex-wrap gap-2">
                  {personalInfo.activeServices.map((service, idx) => (
                    <Tag key={idx} label={service} color="green" />
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
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {personalInfo.upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {personalInfo.upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="text-sm text-gray-900 dark:text-white">{event.event}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{event.year}年</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                結婚、出産、住宅購入など、将来の予定を追加すると<br />
                より長期的な視点でアドバイスができます
              </p>
            </div>
          )}
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
            <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              プロフィールを完成させる
            </button>
          </motion.div>
        )}
      </div>
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
