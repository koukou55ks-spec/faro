'use client'

import { useState } from 'react'
import { Smartphone, Save, Download, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { useSettings } from '../../../lib/hooks/useSettings'

export function AppSection() {
  const { settings, updateSetting } = useSettings()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!settings) {
    return null
  }

  // キャッシュクリア
  const handleClearCache = async () => {
    if (!confirm('キャッシュをクリアしますか？再読み込みが必要になります。')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // IndexedDB, LocalStorage, SessionStorageをクリア
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases()
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      }

      localStorage.clear()
      sessionStorage.clear()

      // Service Workerのキャッシュもクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }

      setMessage({ type: 'success', text: 'キャッシュをクリアしました' })

      // 3秒後にリロード
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('[AppSection] Failed to clear cache:', error)
      setMessage({ type: 'error', text: 'キャッシュのクリアに失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  // データエクスポート
  const handleExportData = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/v1/account/export')

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faro-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({ type: 'success', text: 'データをエクスポートしました' })
    } catch (error) {
      console.error('[AppSection] Failed to export data:', error)
      setMessage({ type: 'error', text: 'データのエクスポートに失敗しました（準備中）' })
    } finally {
      setLoading(false)
    }
  }

  // データ削除
  const handleDeleteAllData = async () => {
    if (!confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      return
    }

    if (!confirm('本当によろしいですか？アカウントは残りますが、すべてのデータが削除されます。')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/v1/account/delete-data', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete data')
      }

      setMessage({ type: 'success', text: 'データを削除しました。ページをリロードします...' })

      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      console.error('[AppSection] Failed to delete data:', error)
      setMessage({ type: 'error', text: 'データの削除に失敗しました（準備中）' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">アプリ設定</h2>
        <p className="text-gray-600 dark:text-gray-400">
          キャッシュ管理やデータのエクスポートを行います
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

      {/* アプリの動作設定 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          アプリの動作
        </h3>

        <div className="space-y-3">
          <ToggleOption
            label="自動保存"
            description="編集内容を自動的に保存します"
            checked={settings.auto_save}
            onChange={(checked) => updateSetting('auto_save', checked)}
          />
        </div>
      </section>

      {/* キャッシュ管理 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          キャッシュ管理
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          キャッシュをクリアすると、アプリの動作が改善される場合があります。
          ログイン状態は維持されます。
        </p>

        <button
          onClick={handleClearCache}
          disabled={loading}
          className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              クリア中...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              キャッシュをクリア
            </>
          )}
        </button>
      </section>

      {/* データ管理 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          データ管理
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          あなたのデータをJSON形式でエクスポートできます。
          バックアップや他のサービスへの移行に利用できます。
        </p>

        <button
          onClick={handleExportData}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              エクスポート中...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              データをエクスポート
            </>
          )}
        </button>
      </section>

      {/* 危険な操作 */}
      <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          データの完全削除
        </h3>

        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          すべてのプロフィール、ノート、設定を削除します。
          アカウント自体は残りますが、データは復元できません。
        </p>

        <button
          onClick={handleDeleteAllData}
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
              すべてのデータを削除
            </>
          )}
        </button>
      </section>
    </div>
  )
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex-1 pr-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
