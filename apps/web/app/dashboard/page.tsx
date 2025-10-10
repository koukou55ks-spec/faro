'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Wallet, BookOpen, Calculator, Calendar,
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
  ArrowUpRight, ArrowDownRight, Plus, Search, Bell,
  Settings, LogOut, Home, Layers, FileText, CreditCard,
  Sparkles, ChevronRight, Activity, Target, Shield
} from 'lucide-react'

interface StatCard {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
  color: string
}

interface WorkspaceApp {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  route: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [activeView, setActiveView] = useState<'overview' | 'workspace'>('overview')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const stats: StatCard[] = [
    {
      title: '総資産',
      value: '¥1,234,567',
      change: '+12.5%',
      trend: 'up',
      icon: <Wallet />,
      color: 'from-violet-500 to-purple-500'
    },
    {
      title: '今月の支出',
      value: '¥234,567',
      change: '-8.3%',
      trend: 'down',
      icon: <TrendingDown />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: '投資収益',
      value: '¥45,678',
      change: '+23.1%',
      trend: 'up',
      icon: <TrendingUp />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: '貯蓄率',
      value: '32%',
      change: '+5.2%',
      trend: 'up',
      icon: <Target />,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const workspaceApps: WorkspaceApp[] = [
    {
      id: 'kakeibo',
      name: '家計簿',
      description: 'AI家計簿で支出を自動分類',
      icon: <Calculator />,
      color: 'from-blue-500 to-cyan-500',
      route: '/apps/kakeibo'
    },
    {
      id: 'shiwake',
      name: '仕訳帳',
      description: '簡単な記帳・仕訳管理',
      icon: <FileText />,
      color: 'from-green-500 to-emerald-500',
      route: '/apps/shiwake'
    },
    {
      id: 'calendar',
      name: 'カレンダー',
      description: '支払い・納税スケジュール',
      icon: <Calendar />,
      color: 'from-purple-500 to-pink-500',
      route: '/apps/calendar'
    },
    {
      id: 'notes',
      name: 'ノート',
      description: 'Notion風メモ・ドキュメント',
      icon: <BookOpen />,
      color: 'from-orange-500 to-red-500',
      route: '/apps/notes'
    }
  ]

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-violet-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Faro</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-all text-gray-300 hover:text-white"
          >
            <Home className="w-5 h-5" />
            <span>ホーム</span>
          </button>

          <button
            onClick={() => setActiveView('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeView === 'overview'
                ? 'bg-violet-500/20 text-violet-400'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>概要</span>
          </button>

          <button
            onClick={() => setActiveView('workspace')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeView === 'workspace'
                ? 'bg-violet-500/20 text-violet-400'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Workspace</span>
          </button>

          <div className="pt-4 pb-2">
            <p className="text-xs text-gray-500 px-3 mb-2">アプリ</p>
            {workspaceApps.map((app) => (
              <button
                key={app.id}
                onClick={() => router.push(app.route)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-all text-gray-300 hover:text-white"
              >
                <div className="w-5 h-5">{app.icon}</div>
                <span className="text-sm">{app.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">設定</span>
          </button>

          <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {activeView === 'overview' ? 'ダッシュボード概要' : 'Workspace'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {activeView === 'overview'
                  ? '財務状況の概要を確認'
                  : '統合された作業環境で効率的に管理'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-all relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeView === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                          <div className="text-white">{stat.icon}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${
                          stat.trend === 'up' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          <span>{stat.change}</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: '支出を記録', icon: <Plus />, color: 'from-blue-500 to-cyan-500' },
                      { label: 'レポート生成', icon: <BarChart3 />, color: 'from-green-500 to-emerald-500' },
                      { label: '予算設定', icon: <Target />, color: 'from-purple-500 to-pink-500' },
                      { label: '分析する', icon: <Activity />, color: 'from-orange-500 to-red-500' }
                    ].map((action, i) => (
                      <button
                        key={action.label}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all group"
                      >
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <span className="text-sm text-gray-300">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {workspaceApps.map((app, i) => (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => router.push(app.route)}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all text-left group relative overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${app.color} mb-4 group-hover:scale-110 transition-transform`}>
                            <div className="w-8 h-8">{app.icon}</div>
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{app.name}</h3>
                          <p className="text-gray-400 text-sm">{app.description}</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
