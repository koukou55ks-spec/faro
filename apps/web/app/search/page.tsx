'use client'

import { useState } from 'react'
import { Search, Play, Clock, TrendingUp, Sparkles, ChevronRight, Zap, MessageSquare, SlidersHorizontal, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

// モジュールの種類
type ModuleType = 'simulator' | 'guide' | 'scan' | 'quiz'

interface Module {
  id: string
  type: ModuleType
  title: string
  duration: string // "3分", "5分" など
  icon: typeof Play
  color: string
}

interface Playlist {
  id: string
  title: string
  description: string
  duration: string
  modules: Module[]
  coverColor: string
  completed?: boolean
}

// プレイリストのサンプルデータ
const playlists: Playlist[] = [
  {
    id: 'furusato',
    title: 'ふるさと納税 完全攻略',
    description: '損せず、迷わず、3ステップで完了',
    duration: '約15分',
    coverColor: 'from-blue-500 to-blue-600',
    modules: [
      {
        id: 'f1',
        type: 'quiz',
        title: '「控除」って何？まずは1分クイズ',
        duration: '1分',
        icon: CheckCircle2,
        color: 'text-green-500'
      },
      {
        id: 'f2',
        type: 'guide',
        title: 'なぜ「2000円で返礼品」がもらえるの？',
        duration: '5分',
        icon: MessageSquare,
        color: 'text-purple-500'
      },
      {
        id: 'f3',
        type: 'simulator',
        title: 'あなたの上限額をシミュレート',
        duration: '3分',
        icon: SlidersHorizontal,
        color: 'text-blue-500'
      },
      {
        id: 'f4',
        type: 'scan',
        title: '源泉徴収票をスキャンして正確な上限額を計算',
        duration: '5分',
        icon: Sparkles,
        color: 'text-orange-500'
      }
    ]
  },
  {
    id: 'fuyou',
    title: '103万・130万の壁 完全理解',
    description: '手取りが減る谷を体験して理解する',
    duration: '約12分',
    coverColor: 'from-purple-500 to-purple-600',
    modules: [
      {
        id: 'w1',
        type: 'quiz',
        title: '103万 vs 130万、どっちが「税金」の壁？',
        duration: '2分',
        icon: CheckCircle2,
        color: 'text-green-500'
      },
      {
        id: 'w2',
        type: 'guide',
        title: 'なぜ「手取りが減る谷」が生まれるのか',
        duration: '5分',
        icon: MessageSquare,
        color: 'text-purple-500'
      },
      {
        id: 'w3',
        type: 'simulator',
        title: '「手取りが減る谷」をスライダーで体験',
        duration: '5分',
        icon: SlidersHorizontal,
        color: 'text-blue-500'
      }
    ]
  },
  {
    id: 'ideco-nisa',
    title: 'iDeCo & NISA 老後資金編',
    description: '税金ゼロの投資を3分で理解',
    duration: '約10分',
    coverColor: 'from-green-500 to-green-600',
    modules: [
      {
        id: 'i1',
        type: 'guide',
        title: 'なぜ「投資」なのに「税金がゼロ」？',
        duration: '5分',
        icon: MessageSquare,
        color: 'text-purple-500'
      },
      {
        id: 'i2',
        type: 'simulator',
        title: '貯金 vs NISA vs iDeCo、30年後を比較',
        duration: '3分',
        icon: SlidersHorizontal,
        color: 'text-blue-500'
      },
      {
        id: 'i3',
        type: 'quiz',
        title: 'あなたに必要なのはNISA？ iDeCo？',
        duration: '2分',
        icon: CheckCircle2,
        color: 'text-green-500'
      }
    ]
  },
  {
    id: 'kakutei',
    title: '確定申告 はじめてガイド',
    description: 'フリーランス・副業の方へ',
    duration: '約20分',
    coverColor: 'from-orange-500 to-orange-600',
    modules: [
      {
        id: 'k1',
        type: 'guide',
        title: '確定申告って何するの？3分で全体像',
        duration: '3分',
        icon: MessageSquare,
        color: 'text-purple-500'
      },
      {
        id: 'k2',
        type: 'quiz',
        title: '「白色」と「青色」、あなたはどっち？',
        duration: '2分',
        icon: CheckCircle2,
        color: 'text-green-500'
      },
      {
        id: 'k3',
        type: 'simulator',
        title: '経費を入力して税額をシミュレート',
        duration: '10分',
        icon: SlidersHorizontal,
        color: 'text-blue-500'
      },
      {
        id: 'k4',
        type: 'scan',
        title: 'レシートスキャンで経費を自動分類',
        duration: '5分',
        icon: Sparkles,
        color: 'text-orange-500'
      }
    ]
  }
]

// モジュールタイプごとのアイコンとラベル
const getModuleDisplay = (type: ModuleType) => {
  switch (type) {
    case 'simulator':
      return { label: 'シミュレーター', icon: SlidersHorizontal, bg: 'bg-blue-500/10', text: 'text-blue-500' }
    case 'guide':
      return { label: 'AIガイド', icon: MessageSquare, bg: 'bg-purple-500/10', text: 'text-purple-500' }
    case 'scan':
      return { label: 'スキャン', icon: Sparkles, bg: 'bg-orange-500/10', text: 'text-orange-500' }
    case 'quiz':
      return { label: 'クイズ', icon: CheckCircle2, bg: 'bg-green-500/10', text: 'text-green-500' }
  }
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

  // プレイリスト詳細表示
  if (selectedPlaylist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-20">
        {/* ヘッダー */}
        <div className={`bg-gradient-to-b ${selectedPlaylist.coverColor} p-6`}>
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="mb-4 text-white/80 hover:text-white"
          >
            ← 戻る
          </button>
          <div className="flex items-end space-x-4">
            <div className={`w-48 h-48 rounded-lg bg-gradient-to-br ${selectedPlaylist.coverColor} shadow-2xl flex items-center justify-center`}>
              <Play className="w-20 h-20 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">プレイリスト</p>
              <h1 className="text-4xl font-bold mb-3">{selectedPlaylist.title}</h1>
              <p className="text-white/80 mb-2">{selectedPlaylist.description}</p>
              <p className="text-sm text-white/60">{selectedPlaylist.modules.length}個のモジュール • {selectedPlaylist.duration}</p>
            </div>
          </div>
        </div>

        {/* 再生ボタン */}
        <div className="px-6 py-6">
          <button className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full flex items-center space-x-2 transition-all shadow-lg">
            <Play className="w-6 h-6 fill-current" />
            <span>プレイリストを開始</span>
          </button>
        </div>

        {/* モジュール一覧 */}
        <div className="px-6 space-y-2">
          {selectedPlaylist.modules.map((module, index) => {
            const display = getModuleDisplay(module.type)
            const Icon = display.icon
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-white/60 w-6">{index + 1}</span>
                    <div className={`${display.bg} p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${display.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white group-hover:text-green-400 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-white/60">{display.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white/60">{module.duration}</span>
                    <Play className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // メイン画面（プレイリスト一覧）
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 検索バー */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="税務プレイリストを探す..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {/* おすすめプレイリスト */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              今日のおすすめ
            </h2>
            <TrendingUp className="w-6 h-6 text-orange-500" />
          </div>

          {/* フィーチャードプレイリスト */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSelectedPlaylist(playlists[0])}
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-2">🔥 今月の人気No.1</p>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {playlists[0].title}
                </h3>
                <p className="text-white/90 mb-4">
                  {playlists[0].description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{playlists[0].duration}</span>
                  </span>
                  <span>{playlists[0].modules.length}個のモジュール</span>
                </div>
              </div>
              <Play className="w-12 h-12 text-white/90" />
            </div>
            <button className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full hover:bg-white/90 transition-colors">
              今すぐ開始 →
            </button>
          </motion.div>
        </section>

        {/* プレイリスト一覧 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            すべてのプレイリスト
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {playlists.slice(1).map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPlaylist(playlist)}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              >
                <div className={`bg-gradient-to-br ${playlist.coverColor} h-32 flex items-center justify-center`}>
                  <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                    {playlist.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {playlist.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{playlist.duration}</span>
                    </span>
                    <span>{playlist.modules.length}個</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* クイックアクション */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            クイックアクション
          </h2>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl flex items-center justify-between hover:from-green-600 hover:to-green-700 transition-all shadow-md">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-bold">AI診断: 今あなたに必要な控除は？</p>
                  <p className="text-sm text-white/80">3つの質問で最適なプレイリストを提案</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>

            <button className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-4 rounded-xl flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-500 transition-all">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">源泉徴収票をスキャン</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AIが自動で最適なプレイリストを作成</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
