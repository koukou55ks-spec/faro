'use client'

import { useState } from 'react'
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  Shield,
  Lock,
  Smartphone,
  Info,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/hooks/useAuth'
import { useSettings } from '../../lib/hooks/useSettings'
import type { SettingsSection } from '../../types/settings'

// セクションコンポーネントを動的インポート
import { AccountSection } from '../../components/features/settings/AccountSection'
import { AppearanceSection } from '../../components/features/settings/AppearanceSection'
import { NotificationsSection } from '../../components/features/settings/NotificationsSection'
import { PrivacySection } from '../../components/features/settings/PrivacySection'
import { SecuritySection } from '../../components/features/settings/SecuritySection'
import { AppSection } from '../../components/features/settings/AppSection'
import { AboutSection } from '../../components/features/settings/AboutSection'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { settings, loading: settingsLoading } = useSettings()
  const [activeSection, setActiveSection] = useState<SettingsSection | null>(null)

  const loading = authLoading || settingsLoading

  // ログインしていない場合
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <SettingsIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ログインが必要です
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            設定ページを表示するには、ログインしてください。
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            ログイン
          </a>
        </div>
      </div>
    )
  }

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  // 設定セクション一覧
  const sections = [
    {
      id: 'account' as SettingsSection,
      icon: User,
      label: 'アカウント',
      description: 'プロフィール、メール、パスワード',
      color: 'text-blue-500',
    },
    {
      id: 'appearance' as SettingsSection,
      icon: Palette,
      label: '表示設定',
      description: 'テーマ、言語、フォントサイズ',
      color: 'text-purple-500',
    },
    {
      id: 'notifications' as SettingsSection,
      icon: Bell,
      label: '通知',
      description: 'メール、プッシュ通知',
      color: 'text-orange-500',
    },
    {
      id: 'privacy' as SettingsSection,
      icon: Shield,
      label: 'プライバシー',
      description: 'データ共有、公開範囲',
      color: 'text-green-500',
    },
    {
      id: 'security' as SettingsSection,
      icon: Lock,
      label: 'セキュリティ',
      description: '二段階認証、ログイン履歴',
      color: 'text-red-500',
    },
    {
      id: 'app' as SettingsSection,
      icon: Smartphone,
      label: 'アプリ',
      description: 'キャッシュ、データエクスポート',
      color: 'text-indigo-500',
    },
    {
      id: 'about' as SettingsSection,
      icon: Info,
      label: 'アプリ情報',
      description: 'バージョン、利用規約',
      color: 'text-gray-500',
    },
  ]

  // セクション詳細を表示
  if (activeSection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">設定に戻る</span>
            </button>
          </div>
        </div>

        {/* セクションコンテンツ */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'account' && <AccountSection />}
              {activeSection === 'appearance' && <AppearanceSection />}
              {activeSection === 'notifications' && <NotificationsSection />}
              {activeSection === 'privacy' && <PrivacySection />}
              {activeSection === 'security' && <SecuritySection />}
              {activeSection === 'app' && <AppSection />}
              {activeSection === 'about' && <AboutSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // メイン設定画面
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 p-6 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">設定</h1>
        </div>
        <p className="text-white/80 text-sm ml-15">
          アカウントやアプリの設定を管理します
        </p>
      </div>

      {/* 設定セクション一覧 */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="space-y-3 pb-20">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setActiveSection(section.id)}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* アイコン */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                </div>

                {/* ラベルと説明 */}
                <div className="flex-1 text-left">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {section.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {section.description}
                  </p>
                </div>

                {/* 矢印 */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
