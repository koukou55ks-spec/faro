'use client'

import { useState } from 'react'
import { Search, Play, Clock, TrendingUp, Sparkles, MessageSquare, SlidersHorizontal, CheckCircle2, ChevronRight, Trophy, Briefcase, Heart, GraduationCap, Home as HomeIcon } from 'lucide-react'
import { motion } from 'framer-motion'

type ModuleType = 'simulator' | 'guide' | 'scan' | 'quiz'

interface Module {
  id: string
  type: ModuleType
  title: string
  duration: string
}

interface Playlist {
  id: string
  title: string
  description: string
  duration: string
  modules: Module[]
  coverColor: string
  plays?: number
  category?: string
}

// プレイリストデータを大幅拡張
const allPlaylists: Playlist[] = [
  // 本日のランキング
  { id: '1', title: 'ふるさと納税 完全攻略', description: '3ステップで完了', duration: '15分', coverColor: 'from-blue-500 to-blue-600', plays: 12453, category: 'ranking', modules: [] },
  { id: '2', title: '103万・130万の壁', description: '手取り減少を体験', duration: '12分', coverColor: 'from-purple-500 to-purple-600', plays: 9821, category: 'ranking', modules: [] },
  { id: '3', title: '確定申告はじめて', description: 'フリーランス必見', duration: '20分', coverColor: 'from-orange-500 to-orange-600', plays: 8234, category: 'ranking', modules: [] },
  { id: '4', title: '医療費控除の全て', description: '10万円超えたら', duration: '10分', coverColor: 'from-green-500 to-green-600', plays: 7102, category: 'ranking', modules: [] },
  { id: '5', title: '住宅ローン控除', description: '最大400万円', duration: '18分', coverColor: 'from-red-500 to-red-600', plays: 6543, category: 'ranking', modules: [] },

  // サラリーマンにおすすめ
  { id: '11', title: '給与明細の読み方', description: '手取りの仕組み', duration: '8分', coverColor: 'from-cyan-500 to-cyan-600', category: 'salary', modules: [] },
  { id: '12', title: '年末調整 完璧ガイド', description: '11月までに準備', duration: '12分', coverColor: 'from-indigo-500 to-indigo-600', category: 'salary', modules: [] },
  { id: '13', title: '副業の確定申告', description: '20万円ルール', duration: '15分', coverColor: 'from-pink-500 to-pink-600', category: 'salary', modules: [] },
  { id: '14', title: '通勤手当と税金', description: '非課税の上限', duration: '6分', coverColor: 'from-teal-500 to-teal-600', category: 'salary', modules: [] },
  { id: '15', title: '退職金の税金', description: '控除を最大化', duration: '14分', coverColor: 'from-amber-500 to-amber-600', category: 'salary', modules: [] },

  // 所得税について
  { id: '21', title: '所得税の基本', description: '累進課税とは', duration: '10分', coverColor: 'from-violet-500 to-violet-600', category: 'income-tax', modules: [] },
  { id: '22', title: '10種類の所得', description: '給与・事業・雑所得', duration: '16分', coverColor: 'from-fuchsia-500 to-fuchsia-600', category: 'income-tax', modules: [] },
  { id: '23', title: '所得控除14種類', description: '税金を減らす', duration: '22分', coverColor: 'from-rose-500 to-rose-600', category: 'income-tax', modules: [] },
  { id: '24', title: '税率シミュレーター', description: '5%〜45%を体験', duration: '8分', coverColor: 'from-sky-500 to-sky-600', category: 'income-tax', modules: [] },
  { id: '25', title: '源泉徴収のカラクリ', description: '天引きの仕組み', duration: '12分', coverColor: 'from-lime-500 to-lime-600', category: 'income-tax', modules: [] },

  // 投資・資産運用
  { id: '31', title: 'NISA完全ガイド', description: '1800万円非課税', duration: '18分', coverColor: 'from-emerald-500 to-emerald-600', category: 'investment', modules: [] },
  { id: '32', title: 'iDeCo節税効果', description: '年間27.6万円控除', duration: '14分', coverColor: 'from-blue-400 to-blue-500', category: 'investment', modules: [] },
  { id: '33', title: '株式投資と税金', description: '特定口座を理解', duration: '16分', coverColor: 'from-purple-400 to-purple-500', category: 'investment', modules: [] },
  { id: '34', title: '仮想通貨の確定申告', description: '雑所得の計算', duration: '20分', coverColor: 'from-orange-400 to-orange-500', category: 'investment', modules: [] },
  { id: '35', title: '不動産投資の税金', description: '減価償却を活用', duration: '24分', coverColor: 'from-red-400 to-red-500', category: 'investment', modules: [] },

  // フリーランス・個人事業主
  { id: '41', title: '青色申告65万円控除', description: '最強の節税', duration: '18分', coverColor: 'from-cyan-400 to-cyan-500', category: 'freelance', modules: [] },
  { id: '42', title: '経費の境界線', description: '何が認められる？', duration: '12分', coverColor: 'from-indigo-400 to-indigo-500', category: 'freelance', modules: [] },
  { id: '43', title: 'インボイス制度', description: '登録すべき？', duration: '16分', coverColor: 'from-pink-400 to-pink-500', category: 'freelance', modules: [] },
  { id: '44', title: '小規模企業共済', description: '退職金を作る', duration: '14分', coverColor: 'from-teal-400 to-teal-500', category: 'freelance', modules: [] },
  { id: '45', title: '帳簿のつけ方', description: 'freee vs 弥生', duration: '10分', coverColor: 'from-amber-400 to-amber-500', category: 'freelance', modules: [] },

  // 家族の税金
  { id: '51', title: '配偶者控除・特別控除', description: '150万円の壁', duration: '14分', coverColor: 'from-violet-400 to-violet-500', category: 'family', modules: [] },
  { id: '52', title: '扶養控除を最大化', description: '16歳以上の子供', duration: '10分', coverColor: 'from-fuchsia-400 to-fuchsia-500', category: 'family', modules: [] },
  { id: '53', title: 'ひとり親控除', description: '35万円控除', duration: '8分', coverColor: 'from-rose-400 to-rose-500', category: 'family', modules: [] },
  { id: '54', title: '教育資金の贈与', description: '1500万円非課税', duration: '16分', coverColor: 'from-sky-400 to-sky-500', category: 'family', modules: [] },
  { id: '55', title: '相続税の基本', description: '3000万円+600万円×人数', duration: '20分', coverColor: 'from-lime-400 to-lime-500', category: 'family', modules: [] },
]

// カテゴリ別セクション定義
const sections = [
  { id: 'ranking', title: '本日のランキング', icon: Trophy, playlists: allPlaylists.filter(p => p.category === 'ranking') },
  { id: 'salary', title: 'サラリーマンにおすすめ', icon: Briefcase, playlists: allPlaylists.filter(p => p.category === 'salary') },
  { id: 'income-tax', title: '所得税について', icon: GraduationCap, playlists: allPlaylists.filter(p => p.category === 'income-tax') },
  { id: 'investment', title: '投資・資産運用', icon: TrendingUp, playlists: allPlaylists.filter(p => p.category === 'investment') },
  { id: 'freelance', title: 'フリーランス・個人事業主', icon: Sparkles, playlists: allPlaylists.filter(p => p.category === 'freelance') },
  { id: 'family', title: '家族の税金', icon: Heart, playlists: allPlaylists.filter(p => p.category === 'family') },
]

// プレイリストカードコンポーネント（Spotifyスタイル）
function PlaylistCard({ playlist, size = 'normal' }: { playlist: Playlist; size?: 'normal' | 'large' }) {
  const isLarge = size === 'large'

  return (
    <div className={`group cursor-pointer ${isLarge ? 'w-full' : 'w-40 sm:w-44 flex-shrink-0'}`}>
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
function ScrollableSection({ section }: { section: typeof sections[0] }) {
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
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

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
              <PlaylistCard key={playlist.id} playlist={playlist} size="large" />
            ))}
          </div>
        </section>

        {/* カテゴリ別セクション（横スクロール） */}
        {sections.map((section) => (
          <ScrollableSection key={section.id} section={section} />
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
