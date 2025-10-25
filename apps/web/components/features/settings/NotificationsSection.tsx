'use client'

import { Bell, Mail, Smartphone } from 'lucide-react'
import { useSettings } from '../../../lib/hooks/useSettings'

export function NotificationsSection() {
  const { settings, updateSetting } = useSettings()

  if (!settings) {
    return null
  }

  const notificationCategories = [
    {
      key: 'notify_ai_response' as const,
      label: 'AI回答通知',
      description: 'AIからの回答があった時に通知',
    },
    {
      key: 'notify_new_features' as const,
      label: '新機能通知',
      description: '新しい機能が追加された時に通知',
    },
    {
      key: 'notify_tax_deadline' as const,
      label: '税金締切通知',
      description: '確定申告などの締切が近づいた時に通知',
    },
    {
      key: 'notify_tips' as const,
      label: '節税Tips通知',
      description: 'あなたにおすすめの節税情報を通知',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">通知設定</h2>
        <p className="text-gray-600 dark:text-gray-400">
          メールやプッシュ通知の設定を管理します
        </p>
      </div>

      {/* 基本設定 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          基本設定
        </h3>

        <div className="space-y-3">
          <ToggleOption
            icon={<Mail className="w-5 h-5" />}
            label="メール通知"
            description="重要な情報をメールで受け取る"
            checked={settings.email_notifications}
            onChange={(checked) => updateSetting('email_notifications', checked)}
          />

          <ToggleOption
            icon={<Smartphone className="w-5 h-5" />}
            label="プッシュ通知"
            description="ブラウザやアプリからの通知を受け取る"
            checked={settings.push_notifications}
            onChange={(checked) => updateSetting('push_notifications', checked)}
          />

          <ToggleOption
            icon={<Bell className="w-5 h-5" />}
            label="ダイジェスト通知"
            description="複数の通知をまとめて受け取る"
            checked={settings.notification_digest}
            onChange={(checked) => updateSetting('notification_digest', checked)}
          />
        </div>
      </section>

      {/* 通知カテゴリ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          通知カテゴリ
        </h3>

        <div className="space-y-3">
          {notificationCategories.map((category) => (
            <ToggleOption
              key={category.key}
              label={category.label}
              description={category.description}
              checked={settings[category.key]}
              onChange={(checked) => updateSetting(category.key, checked)}
            />
          ))}
        </div>
      </section>

      {/* 注意事項 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          プッシュ通知を有効にするには、ブラウザで通知の許可が必要です。
          設定を変更した場合、ブラウザに通知の許可を求めるダイアログが表示されます。
        </p>
      </div>
    </div>
  )
}

function ToggleOption({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        {icon && <div className="text-gray-600 dark:text-gray-400">{icon}</div>}
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
        </div>
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
