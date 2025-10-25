'use client'

import { Palette, Sun, Moon, Globe, Type } from 'lucide-react'
import { useSettings } from '../../../lib/hooks/useSettings'
import {
  THEME_OPTIONS,
  LANGUAGE_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_SCHEME_OPTIONS,
} from '../../../types/settings'

export function AppearanceSection() {
  const { settings, updateSetting } = useSettings()

  if (!settings) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">表示設定</h2>
        <p className="text-gray-600 dark:text-gray-400">
          テーマ、言語、フォントサイズなどの表示設定を変更します
        </p>
      </div>

      {/* テーマ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          テーマ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => {
            const isSelected = settings.theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => updateSetting('theme', option.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* カラースキーム */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          カラースキーム
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COLOR_SCHEME_OPTIONS.map((option) => {
            const isSelected = settings.color_scheme === option.value
            return (
              <button
                key={option.value}
                onClick={() => updateSetting('color_scheme', option.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div
                  className={`w-full h-12 rounded-lg bg-gradient-to-r ${option.gradient} mb-2`}
                />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* 言語 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          言語
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = settings.language === option.value
            return (
              <button
                key={option.value}
                onClick={() => updateSetting('language', option.value)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-3xl">{option.flag}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* フォントサイズ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Type className="w-5 h-5" />
          フォントサイズ
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZE_OPTIONS.map((option) => {
            const isSelected = settings.font_size === option.value
            return (
              <button
                key={option.value}
                onClick={() => updateSetting('font_size', option.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div
                  className="font-medium text-gray-900 dark:text-white mb-1"
                  style={{ fontSize: option.size }}
                >
                  Aa
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {option.label}
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          変更は次回ページ読み込み時に反映されます
        </p>
      </section>

      {/* その他の表示オプション */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          その他のオプション
        </h3>

        <div className="space-y-3">
          <ToggleOption
            label="コンパクト表示"
            description="情報を詰めて表示します"
            checked={settings.compact_view}
            onChange={(checked) => updateSetting('compact_view', checked)}
          />

          <ToggleOption
            label="オンボーディング表示"
            description="初回利用時のガイドを表示します"
            checked={settings.show_onboarding}
            onChange={(checked) => updateSetting('show_onboarding', checked)}
          />
        </div>
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
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
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
