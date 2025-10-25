'use client'

import { useState, useEffect } from 'react'
import { Lock, Shield, Clock, Smartphone, MapPin, Loader2, Trash2 } from 'lucide-react'
import { useSettings } from '../../../lib/hooks/useSettings'
import type { LoginHistory, ActiveSession } from '../../../types/settings'

export function SecuritySection() {
  const { settings, updateSetting } = useSettings()
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      // ログイン履歴を取得
      const historyRes = await fetch('/api/v1/settings/history?limit=10')
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setLoginHistory(historyData.history)
      }

      // アクティブセッションを取得
      const sessionsRes = await fetch('/api/v1/settings/sessions')
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setActiveSessions(sessionsData.sessions)
      }
    } catch (error) {
      console.error('[SecuritySection] Failed to fetch security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutSession = async (sessionId: string) => {
    if (!confirm('このデバイスからログアウトしますか?')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/settings/sessions?session_id=${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSecurityData()
      }
    } catch (error) {
      console.error('[SecuritySection] Failed to logout session:', error)
    }
  }

  const handleLogoutAllSessions = async () => {
    if (!confirm('すべてのデバイスからログアウトしますか？')) {
      return
    }

    try {
      const response = await fetch('/api/v1/settings/sessions?session_id=all', {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('[SecuritySection] Failed to logout all sessions:', error)
    }
  }

  if (!settings) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          セキュリティ設定
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          二段階認証やログイン履歴を管理します
        </p>
      </div>

      {/* 二段階認証 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          二段階認証
        </h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              二段階認証を有効化
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ログイン時に追加の認証を要求してセキュリティを強化
            </div>
          </div>
          <button
            onClick={() => updateSetting('two_factor_enabled', !settings.two_factor_enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.two_factor_enabled
                ? 'bg-purple-600'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.two_factor_enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.two_factor_enabled && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              二段階認証が有効です。ログイン時に認証コードの入力が必要になります。
            </p>
          </div>
        )}

        {!settings.two_factor_enabled && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              セキュリティ強化のため、二段階認証の有効化を推奨します。
            </p>
          </div>
        )}
      </section>

      {/* セッションタイムアウト */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          セッションタイムアウト
        </h3>

        <div className="space-y-2">
          {[
            { value: 3600, label: '1時間' },
            { value: 7200, label: '2時間（推奨）' },
            { value: 14400, label: '4時間' },
            { value: 28800, label: '8時間' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateSetting('session_timeout', option.value)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                settings.session_timeout === option.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {option.label}
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          一定時間操作がない場合、自動的にログアウトされます
        </p>
      </section>

      {/* アクティブセッション */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            アクティブセッション
          </h3>
          {activeSessions.length > 0 && (
            <button
              onClick={handleLogoutAllSessions}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              すべてログアウト
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : activeSessions.length > 0 ? (
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {session.device_name || session.device_type || 'Unknown Device'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    最終アクセス: {new Date(session.last_activity).toLocaleString('ja-JP')}
                  </div>
                  {session.ip_address && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      IP: {session.ip_address}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            アクティブなセッションがありません
          </p>
        )}
      </section>

      {/* ログイン履歴 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          ログイン履歴
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : loginHistory.length > 0 ? (
          <div className="space-y-2">
            {loginHistory.map((record) => (
              <div
                key={record.id}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(record.login_at).toLocaleString('ja-JP')}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      record.success
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {record.success ? '成功' : '失敗'}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {record.device_type && `${record.device_type} · `}
                  {record.ip_address}
                  {record.location && ` · ${record.location}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            ログイン履歴がありません
          </p>
        )}
      </section>
    </div>
  )
}
