'use client'

import { useState } from 'react'
import { User, Mail, Key, Trash2, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../../../lib/hooks/useAuth'
import { createClient } from '../../../lib/supabase/client'

export function AccountSection() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // パスワード変更
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'パスワードは8文字以上必要です' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードが一致しません' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'パスワードを変更しました' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('[AccountSection] Failed to update password:', error)
      setMessage({ type: 'error', text: 'パスワードの変更に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  // アカウント削除
  const handleDeleteAccount = async () => {
    if (!confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      return
    }

    if (!confirm('すべてのデータが削除されます。本当によろしいですか？')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/v1/account/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // ログアウトしてトップページにリダイレクト
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('[AccountSection] Failed to delete account:', error)
      setMessage({ type: 'error', text: 'アカウントの削除に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          アカウント設定
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          プロフィール情報やパスワードを管理します
        </p>
      </div>

      {/* メッセージ */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 基本情報 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          基本情報
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              メールアドレス
            </label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              メールアドレスの変更は準備中です
            </p>
          </div>
        </div>
      </section>

      {/* パスワード変更 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          パスワード変更
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              新しいパスワード
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8文字以上"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              パスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                変更中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                パスワードを変更
              </>
            )}
          </button>
        </div>
      </section>

      {/* 危険な操作 */}
      <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          危険な操作
        </h3>

        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
        </p>

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              削除中...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              アカウントを削除
            </>
          )}
        </button>
      </section>
    </div>
  )
}
