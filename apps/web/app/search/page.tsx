'use client'

import { useState } from 'react'
import { Search, Play, TrendingUp, Sparkles, MessageSquare, SlidersHorizontal, CheckCircle2, ChevronRight, Trophy, Briefcase, Calculator, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { allModules, getPopularModules, getModulesByCategory, type ExperienceModule, type ModuleType } from '../../lib/modulesData'
import { GuideChat } from '../../components/features/chat/components/GuideChat'
import { SimulatorView } from '../../components/features/simulator/components/SimulatorView'
import { QuizView } from '../../components/features/quiz/components/QuizView'

// カテゴリー別セクション定義
const sections = [
  { id: 'ranking', title: '本日の人気ランキング', icon: Trophy, modules: getPopularModules(10) },
  { id: 'tax', title: '税金', icon: Calculator, modules: getModulesByCategory('tax') },
  { id: 'investment', title: '投資・資産運用', icon: TrendingUp, modules: getModulesByCategory('investment') },
  { id: 'freelance', title: 'フリーランス・個人事業主', icon: Briefcase, modules: getModulesByCategory('freelance') },
]

// モジュールタイプごとの表示設定
const getModuleDisplay = (type: ModuleType) => {
  switch (type) {
    case 'simulator':
      return { label: 'シミュレーター', icon: SlidersHorizontal, bg: 'bg-blue-500/10', text: 'text-blue-500', iconBg: 'bg-blue-500' }
    case 'guide':
      return { label: 'AIガイド', icon: MessageSquare, bg: 'bg-purple-500/10', text: 'text-purple-500', iconBg: 'bg-purple-500' }
    case 'scan':
      return { label: 'スキャン', icon: Camera, bg: 'bg-orange-500/10', text: 'text-orange-500', iconBg: 'bg-orange-500' }
    case 'quiz':
      return { label: 'クイズ', icon: CheckCircle2, bg: 'bg-green-500/10', text: 'text-green-500', iconBg: 'bg-green-500' }
  }
}

// モジュールカードコンポーネント（Spotifyスタイル）
function ModuleCard({ module, size = 'normal', onClick }: { module: ExperienceModule; size?: 'normal' | 'large'; onClick?: () => void }) {
  const isLarge = size === 'large'
  const display = getModuleDisplay(module.type)
  const Icon = display.icon

  return (
    <div onClick={onClick} className={`group cursor-pointer ${isLarge ? 'w-full' : 'w-40 sm:w-44 flex-shrink-0'}`}>
      <div className="relative mb-2">
        <div className={`aspect-square bg-gradient-to-br ${module.coverColor} rounded-lg shadow-md overflow-hidden ${isLarge ? 'rounded-xl' : ''} flex items-center justify-center`}>
          {/* タイプアイコン */}
          <div className="absolute top-2 left-2">
            <div className={`${display.iconBg} p-1.5 rounded-md opacity-90`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* 中央の再生アイコン */}
          <div className="w-full h-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            <Play className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} text-white drop-shadow-lg`} />
          </div>
        </div>

        {/* ホバー時の再生ボタン（Spotifyスタイル） */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:bg-green-400 hover:scale-105 transition-all">
            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <h3 className={`font-bold text-gray-900 dark:text-white ${isLarge ? 'text-base' : 'text-sm'} line-clamp-2 mb-1`}>
        {module.title}
      </h3>

      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs px-2 py-0.5 ${display.bg} ${display.text} rounded-full font-medium`}>
          {display.label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {module.duration}
        </span>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
        {module.description}
      </p>

      {module.plays && (
        <p className="text-xs text-gray-500 mt-1">
          {module.plays.toLocaleString()}回再生
        </p>
      )}
    </div>
  )
}

// 横スクロールセクション
function ScrollableSection({ section, onModuleClick }: { section: typeof sections[0]; onModuleClick: (module: ExperienceModule) => void }) {
  const Icon = section.icon

  if (section.modules.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {section.title}
          </h2>
        </div>
        <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold flex items-center space-x-1">
          <span>すべて表示</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 横スクロール */}
      <div className="overflow-x-auto scrollbar-hide px-4">
        <div className="flex space-x-4">
          {section.modules.map((module) => (
            <ModuleCard key={module.id} module={module} onClick={() => onModuleClick(module)} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeGuide, setActiveGuide] = useState<{ moduleId: string; moduleTitle: string } | null>(null)
  const [activeSimulator, setActiveSimulator] = useState<{ moduleId: string; moduleTitle: string } | null>(null)
  const [activeQuiz, setActiveQuiz] = useState<{ moduleId: string; moduleTitle: string } | null>(null)

  const handleModuleClick = (module: ExperienceModule) => {
    if (module.type === 'guide') {
      // Open AI Guide Talk
      setActiveGuide({ moduleId: module.id, moduleTitle: module.title })
    } else if (module.type === 'simulator') {
      // Open Simulator
      setActiveSimulator({ moduleId: module.id, moduleTitle: module.title })
    } else if (module.type === 'quiz') {
      // Open Quiz
      setActiveQuiz({ moduleId: module.id, moduleTitle: module.title })
    } else {
      // TODO: スキャンは次のステップで実装
      console.log('Module clicked:', module.id, module.type)
      alert(`${getModuleDisplay(module.type).label}を開始します（準備中）`)
    }
  }

  const handleGuideBack = () => {
    setActiveGuide(null)
  }

  const handleSimulatorBack = () => {
    setActiveSimulator(null)
  }

  const handleQuizBack = () => {
    setActiveQuiz(null)
  }

  // AIガイド表示
  if (activeGuide) {
    return <GuideChat moduleId={activeGuide.moduleId} moduleTitle={activeGuide.moduleTitle} onBack={handleGuideBack} />
  }

  // シミュレーター表示
  if (activeSimulator) {
    return <SimulatorView moduleId={activeSimulator.moduleId} moduleTitle={activeSimulator.moduleTitle} onBack={handleSimulatorBack} />
  }

  // クイズ表示
  if (activeQuiz) {
    return <QuizView moduleId={activeQuiz.moduleId} moduleTitle={activeQuiz.moduleTitle} onBack={handleQuizBack} />
  }

  // メイン画面（モジュール一覧）
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 検索バー（固定） */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="モジュールを探す..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="pt-4">
        {/* フィーチャードモジュール（大きめ） */}
        <section className="mb-8 px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            今日のピックアップ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {getPopularModules(4).map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                size="large"
                onClick={() => handleModuleClick(module)}
              />
            ))}
          </div>
        </section>

        {/* カテゴリ別セクション（横スクロール） */}
        {sections.map((section) => (
          <ScrollableSection key={section.id} section={section} onModuleClick={handleModuleClick} />
        ))}
      </div>

      {/* スタイル: 横スクロールのスクロールバーを非表示 */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
