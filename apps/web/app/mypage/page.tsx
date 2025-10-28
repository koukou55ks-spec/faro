'use client'

import { useState, useEffect } from 'react'
import {
  User,
  FileText,
  Loader2,
  Settings,
  Database
} from 'lucide-react'
import { useUserProfile } from '../../lib/hooks/useUserProfile'
import { useAuth } from '../../lib/hooks/useAuth'
import { CustomTabsSection } from '../../components/features/mypage/CustomTabsSection'
import { SystemTabsSection } from '../../components/features/mypage/SystemTabsSection'
import { ProfileEditModal } from '../../components/features/mypage/ProfileEditModal'

export default function MyPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { profile, events, loading: profileLoading, error, createProfile, updateProfile, refetch } = useUserProfile()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const loading = authLoading || profileLoading

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
      <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border-2 border-white/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {user?.email || 'ゲストユーザー'}
              </h1>
              <p className="text-white/80 text-xs">
                {profile?.occupation || '職業未設定'}
              </p>
            </div>
          </div>
          <a
            href="/settings"
            className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Settings className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* メインコンテンツ - スクロール可能 */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="px-4 py-4 space-y-4 pb-20">

        {/* カスタムタブセクション（メイン） */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-2 border-purple-200 dark:border-purple-800">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">自由メモ・ファイル管理</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              自由にタブを作成して、メモやファイルを保存できます。AIチャットで自動的に参照されます。
            </p>
          </div>
          <CustomTabsSection />
        </section>

        {/* 基本情報セクション（AI優先参照） */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-5">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">基本情報（AI優先参照）</h2>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              AIチャットで優先的に参照される重要情報です。テキストやリンクを自由に追加できます。
            </p>
          </div>
          <SystemTabsSection onDataChange={() => refetch()} />
        </section>

        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
    </div>
  )
}
