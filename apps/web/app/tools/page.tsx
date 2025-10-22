'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  Users,
  Home,
  PieChart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// エージェントの提案タイプ
type ProposalType = 'action' | 'opportunity' | 'warning' | 'milestone'

interface AgentProposal {
  id: string
  type: ProposalType
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string // 節税額、メリットなど
  action: {
    label: string
    route?: string
    moduleId?: string
  }
  deadline?: string
  category: 'tax' | 'investment' | 'insurance' | 'deduction' | 'family'
  icon: any
  estimatedTime?: string
}

// ダミーデータ（実際はマイページ情報から生成）
const generateProposals = (): AgentProposal[] => {
  return [
    {
      id: 'furusato-limit',
      type: 'opportunity',
      priority: 'high',
      title: 'ふるさと納税の限度額を確認しましょう',
      description: '年収500万円の場合、約6万円までふるさと納税が可能です。実質2,000円で返礼品がもらえます。',
      impact: '最大58,000円相当の返礼品',
      action: {
        label: '限度額を計算する',
        moduleId: 'f3'
      },
      category: 'deduction',
      icon: Target,
      estimatedTime: '3分'
    },
    {
      id: 'nisa-start',
      type: 'opportunity',
      priority: 'high',
      title: 'NISAを始めて280万円の節税',
      description: '30年間、毎月3万円投資すると約280万円の税金が節約できます。今すぐ始めましょう。',
      impact: '30年で280万円の節税',
      action: {
        label: 'シミュレーションで確認',
        moduleId: 'n2'
      },
      category: 'investment',
      icon: TrendingUp,
      estimatedTime: '5分'
    },
    {
      id: 'kakutei-shinkoku-deadline',
      type: 'warning',
      priority: 'high',
      title: '確定申告の期限が近づいています',
      description: '2025年3月15日までに提出が必要です。準備を始めましょう。',
      impact: '期限内申告で延滞税回避',
      action: {
        label: '準備ガイドを見る',
        moduleId: 'k1'
      },
      deadline: '2025/03/15',
      category: 'tax',
      icon: AlertCircle,
      estimatedTime: '20分'
    },
    {
      id: 'life-insurance-deduction',
      type: 'opportunity',
      priority: 'medium',
      title: '生命保険料控除を最大化',
      description: '生命保険に加入済みですが、控除額を最大12万円まで活用できていますか？',
      impact: '最大12万円の控除',
      action: {
        label: '控除額を確認',
        route: '/app?view=mypage'
      },
      category: 'insurance',
      icon: Shield,
      estimatedTime: '5分'
    },
    {
      id: 'ideco-recommendation',
      type: 'opportunity',
      priority: 'medium',
      title: 'iDeCoで年間27.6万円の控除',
      description: '会社員の場合、iDeCoで掛金全額が所得控除になります。老後資金を準備しながら節税できます。',
      impact: '年間27.6万円の所得控除',
      action: {
        label: '詳しく学ぶ',
        moduleId: 'n1'
      },
      category: 'investment',
      icon: DollarSign,
      estimatedTime: '5分'
    },
    {
      id: 'medical-expense',
      type: 'opportunity',
      priority: 'low',
      title: '医療費が10万円を超えていませんか？',
      description: '家族全員の医療費を合算して、10万円を超えた分が控除できます。',
      impact: '超過分の10%還付',
      action: {
        label: '医療費控除を学ぶ',
        moduleId: 'm2'
      },
      category: 'deduction',
      icon: Home,
      estimatedTime: '4分'
    },
    {
      id: 'dependent-deduction',
      type: 'opportunity',
      priority: 'medium',
      title: '扶養控除を忘れずに申告',
      description: '子供1人につき38万円の控除が受けられます。申告漏れがないか確認しましょう。',
      impact: '38万円×人数の控除',
      action: {
        label: 'マイページで確認',
        route: '/app?view=mypage'
      },
      category: 'family',
      icon: Users,
      estimatedTime: '2分'
    },
    {
      id: 'year-end-planning',
      type: 'action',
      priority: 'medium',
      title: '年末までにできる節税対策',
      description: '12月末までに実行すれば、今年の税金を減らせる施策があります。',
      impact: '数万円の節税可能',
      action: {
        label: 'Faroに相談',
        route: '/app?view=home'
      },
      category: 'tax',
      icon: Calendar,
      estimatedTime: '10分'
    }
  ]
}

export default function AgentPage() {
  const [proposals, setProposals] = useState<AgentProposal[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    // マイページ情報を読み込んで提案を生成（実際はAPIやストアから取得）
    setTimeout(() => {
      setProposals(generateProposals())
      setIsAnalyzing(false)
    }, 1500)
  }, [])

  const categories = [
    { id: 'all', label: 'すべて', icon: Sparkles },
    { id: 'tax', label: '税金', icon: DollarSign },
    { id: 'investment', label: '投資', icon: TrendingUp },
    { id: 'deduction', label: '控除', icon: Target },
    { id: 'insurance', label: '保険', icon: Shield },
    { id: 'family', label: '家族', icon: Users }
  ]

  const filteredProposals = selectedCategory === 'all'
    ? proposals
    : proposals.filter(p => p.category === selectedCategory)

  // 優先度でソート
  const sortedProposals = [...filteredProposals].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const highPriorityCount = proposals.filter(p => p.priority === 'high').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">エージェント</h1>
            <p className="text-white/80 text-sm">Faroからの提案</p>
          </div>
        </div>

        {/* ステータスカード */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 border border-white/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">あなたへの提案</span>
            </div>
            <span className="text-white/90 text-sm">{proposals.length}件</span>
          </div>

          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              <span>あなたの情報を分析中...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-white/90 text-sm">
                  優先度【高】が{highPriorityCount}件あります
                </span>
              </div>
              <p className="text-white/70 text-xs">
                マイページの情報が充実するほど、より精度の高い提案ができます
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* カテゴリフィルター */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 提案リスト */}
        {isAnalyzing ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {sortedProposals.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    このカテゴリには提案がありません
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    マイページで情報を追加すると提案が増えます
                  </p>
                </div>
              ) : (
                sortedProposals.map((proposal, index) => (
                  <ProposalCard key={proposal.id} proposal={proposal} index={index} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* フッター説明 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Faroがあなたをサポート
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                マイページの情報をもとに、Faroがあなたに最適な節税策や制度活用を能動的に提案します。
                情報が充実するほど、提案の精度が高まります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 提案カードコンポーネント
function ProposalCard({ proposal, index }: { proposal: AgentProposal; index: number }) {
  const Icon = proposal.icon

  const typeConfig = {
    action: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-500', label: 'アクション' },
    opportunity: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-500', label: 'チャンス' },
    warning: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-500', label: '注意' },
    milestone: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-500', label: 'マイルストーン' }
  }

  const priorityConfig = {
    high: { text: '優先度【高】', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
    medium: { text: '優先度【中】', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
    low: { text: '優先度【低】', color: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500' }
  }

  const config = typeConfig[proposal.type]
  const priorityStyle = priorityConfig[proposal.priority]

  const handleAction = () => {
    if (proposal.action.route) {
      window.location.href = proposal.action.route
    } else if (proposal.action.moduleId) {
      // さがすタブのモジュールに遷移
      window.location.href = '/app?view=search'
      // TODO: 実際はモジュールIDを渡してダイレクトに開く
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${config.bg} border ${config.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`${config.badge} p-2.5 rounded-xl`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${priorityStyle.color} flex items-center gap-1`}>
                <div className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot} animate-pulse`} />
                {priorityStyle.text}
              </span>
              {proposal.estimatedTime && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {proposal.estimatedTime}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
              {proposal.title}
            </h3>
          </div>
        </div>
      </div>

      {/* 説明 */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
        {proposal.description}
      </p>

      {/* インパクト */}
      <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 mb-3 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {proposal.impact}
          </span>
        </div>
      </div>

      {/* 期限 */}
      {proposal.deadline && (
        <div className="flex items-center gap-2 mb-3 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">期限: {proposal.deadline}</span>
        </div>
      )}

      {/* アクションボタン */}
      <button
        onClick={handleAction}
        className={`w-full ${config.badge} hover:opacity-90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98]`}
      >
        <span>{proposal.action.label}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
