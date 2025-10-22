'use client'

import { useState } from 'react'
import { Search, Play, TrendingUp, Sparkles, MessageSquare, SlidersHorizontal, CheckCircle2, ChevronRight, Trophy, Briefcase, Heart, GraduationCap, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { allPlaylists, type Playlist, type ModuleType } from '../../lib/playlistData'
import { GuideChat } from '../../src/features/chat/components/GuideChat'
import { SimulatorView } from '../../src/features/simulator/components/SimulatorView'

// カテゴリ別セクション定義
const sections = [
  { id: 'ranking', title: '本日のランキング', icon: Trophy, playlists: allPlaylists.filter(p => p.category === 'ranking') },
  { id: 'salary', title: 'サラリーマンにおすすめ', icon: Briefcase, playlists: allPlaylists.filter(p => p.category === 'salary') },
  { id: 'income-tax', title: '所得税について', icon: GraduationCap, playlists: allPlaylists.filter(p => p.category === 'income-tax') },
  { id: 'investment', title: '投資・資産運用', icon: TrendingUp, playlists: allPlaylists.filter(p => p.category === 'investment') },
  { id: 'freelance', title: 'フリーランス・個人事業主', icon: Sparkles, playlists: allPlaylists.filter(p => p.category === 'freelance') },
  { id: 'family', title: '家族の税金', icon: Heart, playlists: allPlaylists.filter(p => p.category === 'family') },
]

// モジュールタイプごとの表示設定
const getModuleDisplay = (type: ModuleType) => {
  switch (type) {
    case 'simulator':
      return { label: 'シミュレーター', icon: SlidersHorizontal, bg: 'bg-blue-500/10', text: 'text-blue-500', iconBg: 'bg-blue-500' }
    case 'guide':
      return { label: 'AIガイド', icon: MessageSquare, bg: 'bg-purple-500/10', text: 'text-purple-500', iconBg: 'bg-purple-500' }
    case 'scan':
      return { label: 'スキャン', icon: Sparkles, bg: 'bg-orange-500/10', text: 'text-orange-500', iconBg: 'bg-orange-500' }
    case 'quiz':
      return { label: 'クイズ', icon: CheckCircle2, bg: 'bg-green-500/10', text: 'text-green-500', iconBg: 'bg-green-500' }
  }
}

// プレイリストカードコンポーネント（Spotifyスタイル）
function PlaylistCard({ playlist, size = 'normal', onClick }: { playlist: Playlist; size?: 'normal' | 'large'; onClick?: () => void }) {
  const isLarge = size === 'large'

  return (
    <div onClick={onClick} className={`group cursor-pointer ${isLarge ? 'w-full' : 'w-40 sm:w-44 flex-shrink-0'}`}>
      <div className="relative mb-2">
        <div className={`aspect-square bg-gradient-to-br ${playlist.coverColor} rounded-lg shadow-md overflow-hidden ${isLarge ? 'rounded-xl' : ''}`}>
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
        {playlist.title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
        {playlist.description}
      </p>
      {playlist.plays && (
        <p className="text-xs text-gray-500 mt-1">
          {playlist.plays.toLocaleString()}回再生
        </p>
      )}
    </div>
  )
}

// 横スクロールセクション
function ScrollableSection({ section, onPlaylistClick }: { section: typeof sections[0]; onPlaylistClick: (playlist: Playlist) => void }) {
  const Icon = section.icon

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
          {section.playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} onClick={() => onPlaylistClick(playlist)} />
          ))}
        </div>
      </div>
    </section>
  )
}

// プレイリスト詳細ページ
function PlaylistDetailView({ playlist, onBack, onModuleClick }: { playlist: Playlist; onBack: () => void; onModuleClick: (moduleId: string, moduleType: ModuleType) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-20">
      {/* ヘッダー */}
      <div className={`bg-gradient-to-b ${playlist.coverColor} p-6 pb-8`}>
        <button
          onClick={onBack}
          className="mb-4 flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </button>
        <div className="flex items-end space-x-4">
          <div className={`w-48 h-48 flex-shrink-0 rounded-lg bg-gradient-to-br ${playlist.coverColor} shadow-2xl flex items-center justify-center`}>
            <Play className="w-20 h-20 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2 opacity-80">プレイリスト</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">{playlist.title}</h1>
            <p className="text-white/90 mb-2 text-lg">{playlist.description}</p>
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <span>{playlist.modules.length}個のモジュール</span>
              <span>•</span>
              <span>{playlist.duration}</span>
              {playlist.plays && (
                <>
                  <span>•</span>
                  <span>{playlist.plays.toLocaleString()}回再生</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 再生ボタン */}
      <div className="px-6 py-6">
        <button
          onClick={() => playlist.modules.length > 0 && onModuleClick(playlist.modules[0].id, playlist.modules[0].type)}
          disabled={playlist.modules.length === 0}
          className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-8 rounded-full flex items-center space-x-2 transition-all shadow-lg hover:scale-105 active:scale-100 disabled:hover:scale-100"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>プレイリストを開始</span>
        </button>
      </div>

      {/* モジュール一覧 */}
      <div className="px-6 space-y-2">
        {playlist.modules.length > 0 ? (
          playlist.modules.map((module, index) => {
            const display = getModuleDisplay(module.type)
            const Icon = display.icon
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onModuleClick(module.id, module.type)}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-white/60 w-6 text-sm">{index + 1}</span>
                    <div className={`${display.iconBg} p-2.5 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white group-hover:text-green-400 transition-colors">
                        {module.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 ${display.bg} ${display.text} rounded-full font-medium`}>
                          {display.label}
                        </span>
                        {module.description && (
                          <span className="text-sm text-white/60">{module.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white/60">{module.duration}</span>
                    <Play className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-12 text-white/60">
            <p className="mb-2">このプレイリストは準備中です</p>
            <p className="text-sm">近日公開予定！</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [activeGuide, setActiveGuide] = useState<{ moduleId: string; moduleTitle: string } | null>(null)
  const [activeSimulator, setActiveSimulator] = useState<{ moduleId: string; moduleTitle: string } | null>(null)

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
  }

  const handleBack = () => {
    setSelectedPlaylist(null)
  }

  const handleModuleClick = (moduleId: string, moduleType: ModuleType) => {
    // Find the module to get its title
    const module = selectedPlaylist?.modules.find(m => m.id === moduleId)
    const moduleTitle = module?.title || 'モジュール'

    if (moduleType === 'guide') {
      // Open AI Guide Talk
      setActiveGuide({ moduleId, moduleTitle })
    } else if (moduleType === 'simulator') {
      // Open Simulator
      setActiveSimulator({ moduleId, moduleTitle })
    } else {
      // TODO: スキャン、クイズは次のステップで実装
      console.log('Module clicked:', moduleId, moduleType)
      alert(`${moduleType}モジュールを開始します（準備中）`)
    }
  }

  const handleGuideBack = () => {
    setActiveGuide(null)
  }

  const handleSimulatorBack = () => {
    setActiveSimulator(null)
  }

  // AIガイド表示
  if (activeGuide) {
    return <GuideChat moduleId={activeGuide.moduleId} moduleTitle={activeGuide.moduleTitle} onBack={handleGuideBack} />
  }

  // シミュレーター表示
  if (activeSimulator) {
    return <SimulatorView moduleId={activeSimulator.moduleId} moduleTitle={activeSimulator.moduleTitle} onBack={handleSimulatorBack} />
  }

  // プレイリスト詳細表示
  if (selectedPlaylist) {
    return <PlaylistDetailView playlist={selectedPlaylist} onBack={handleBack} onModuleClick={handleModuleClick} />
  }

  // メイン画面（プレイリスト一覧）
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
              placeholder="プレイリストを探す..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="pt-4">
        {/* フィーチャードプレイリスト（大きめ） */}
        <section className="mb-8 px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            今日のピックアップ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPlaylists.slice(0, 4).map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                size="large"
                onClick={() => handlePlaylistClick(playlist)}
              />
            ))}
          </div>
        </section>

        {/* カテゴリ別セクション（横スクロール） */}
        {sections.map((section) => (
          <ScrollableSection key={section.id} section={section} onPlaylistClick={handlePlaylistClick} />
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
