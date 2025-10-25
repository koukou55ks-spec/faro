'use client'

import { Shield, Eye, Database, BarChart3 } from 'lucide-react'
import { useSettings } from '../../../lib/hooks/useSettings'

export function PrivacySection() {
  const { settings, updateSetting } = useSettings()

  if (!settings) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          プライバシー設定
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          データの共有範囲やプライバシー設定を管理します
        </p>
      </div>

      {/* プロフィール公開設定 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          プロフィール公開設定
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => updateSetting('profile_visibility', 'public')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              settings.profile_visibility === 'public'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              公開
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              他のユーザーがあなたのプロフィールを閲覧できます（将来の機能）
            </div>
          </button>

          <button
            onClick={() => updateSetting('profile_visibility', 'private')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              settings.profile_visibility === 'private'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              非公開
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              プロフィールは自分だけが閲覧できます（推奨）
            </div>
          </button>
        </div>
      </section>

      {/* データ共有設定 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          データ共有設定
        </h3>

        <div className="space-y-3">
          <ToggleOption
            label="統計データの共有"
            description="匿名化された統計データをサービス改善に利用することを許可"
            checked={settings.data_sharing}
            onChange={(checked) => updateSetting('data_sharing', checked)}
          />

          <ToggleOption
            label="アクセス解析"
            description="アプリの利用状況を解析し、サービス改善に役立てます"
            checked={settings.analytics_enabled}
            onChange={(checked) => updateSetting('analytics_enabled', checked)}
          />
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            個人を特定できる情報は含まれません。統計データは全て匿名化され、
            サービスの品質向上のみに使用されます。
          </p>
        </div>
      </section>

      {/* Cookie設定 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Cookie設定
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                必須Cookie
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">常に有効</div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ログイン状態の維持など、アプリの基本機能に必要です
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                分析Cookie
              </div>
              <button
                onClick={() => updateSetting('analytics_enabled', !settings.analytics_enabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.analytics_enabled
                    ? 'bg-purple-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.analytics_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              利用状況の分析とサービス改善に使用します
            </div>
          </div>
        </div>
      </section>

      {/* プライバシーポリシー */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          データの取り扱いについて
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          詳細なデータの取り扱いについては、プライバシーポリシーをご確認ください。
        </p>
        <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
          プライバシーポリシーを見る
        </button>
      </div>
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
