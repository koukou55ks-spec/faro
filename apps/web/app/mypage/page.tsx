'use client'

import { useState } from 'react'
import {
  User,
  Target,
  Wallet,
  FileText,
  Settings,
  Bell,
  Shield,
  ChevronRight,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react'
import { motion } from 'framer-motion'

const profileData = {
  name: '田中 太郎',
  occupation: 'フリーランスエンジニア',
  taxYear: 2025,
  income: 6500000,
  expenses: 1800000,
  taxSaved: 450000,
  filingStatus: '準備中'
}

const goals = [
  { label: '確定申告完了', deadline: '2025/03/15', progress: 40 },
  { label: '経費30%達成', target: '¥1,950,000', progress: 92 },
  { label: '節税目標', target: '¥500,000', progress: 90 }
]

const achievements = [
  { icon: Award, label: '早期申告者', earned: false },
  { icon: TrendingUp, label: '節税マスター', earned: true },
  { icon: FileText, label: '青色申告デビュー', earned: false }
]

export default function MyPage() {
  const [activeSection, setActiveSection] = useState('profile')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-blue-500 to-purple-500 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profileData.name}
              </h1>
              <p className="text-white/80 text-sm">
                {profileData.occupation}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/20 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
            <p className="text-white/80 text-xs">今年の収入</p>
            <p className="text-white font-bold">
              ¥{(profileData.income / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
            <p className="text-white/80 text-xs">節税額</p>
            <p className="text-white font-bold">
              ¥{(profileData.taxSaved / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
            <p className="text-white/80 text-xs">申告状況</p>
            <p className="text-white font-bold text-sm">
              {profileData.filingStatus}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Goals & Targets */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              今年の目標
            </h2>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {goal.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {goal.deadline || goal.target}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Financial Summary */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              財務サマリー
            </h2>
            <Wallet className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                総収入
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ¥{profileData.income.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                必要経費
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ¥{profileData.expenses.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                所得金額
              </span>
              <span className="text-sm font-semibold text-green-600">
                ¥{(profileData.income - profileData.expenses).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            実績バッジ
          </h2>
          <div className="flex space-x-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <div
                  key={achievement.label}
                  className={`flex flex-col items-center ${
                    achievement.earned ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    achievement.earned
                      ? 'bg-yellow-100 dark:bg-yellow-900'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      achievement.earned
                        ? 'text-yellow-500'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                    {achievement.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Menu Items */}
        <section className="space-y-2">
          <button className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">通知設定</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">プライバシー</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">税務カレンダー</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </section>
      </div>
    </div>
  )
}