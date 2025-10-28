/**
 * システムタブパネル - メインコンポーネント
 *
 * すべてのシステムタブを管理し、データの読み込み・保存・バリデーションを行う
 */

'use client'

import React, { useState, useEffect } from 'react'
import { SYSTEM_TABS, validateField } from '../../../lib/constants/system-tabs'
import SystemTabField from './SystemTabField'
import type { SystemTabId, SystemTabCompletion } from '../../../lib/types/systemTab'

interface SystemTabPanelProps {
  token: string
  onSaveSuccess?: () => void
}

export default function SystemTabPanel({ token, onSaveSuccess }: SystemTabPanelProps) {
  const [activeTab, setActiveTab] = useState<SystemTabId>('basic_info')
  const [data, setData] = useState<Record<SystemTabId, Record<string, any>>>({
    basic_info: {},
    tax_deductions: {},
    documents: {},
  })
  const [completions, setCompletions] = useState<Record<SystemTabId, SystemTabCompletion>>({
    basic_info: { total_fields: 0, filled_fields: 0, completion_rate: 0 },
    tax_deductions: { total_fields: 0, filled_fields: 0, completion_rate: 0 },
    documents: { total_fields: 0, filled_fields: 0, completion_rate: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  // ============================================================================
  // データ読み込み - 遅延読み込みでパフォーマンス向上
  // ============================================================================
  useEffect(() => {
    // 初回は現在のタブのみ読み込む
    loadTabData(activeTab)
  }, [])

  // タブ切り替え時にまだ読み込んでいなければ読み込む
  useEffect(() => {
    if (Object.keys(data[activeTab]).length === 0 && !loading) {
      loadTabData(activeTab)
    }
  }, [activeTab])

  const loadTabData = async (tabId: SystemTabId) => {
    try {
      if (!token) {
        console.warn('[SystemTabPanel] No token available, skipping load')
        return
      }

      console.log(`[SystemTabPanel] Loading ${tabId}`)

      const response = await fetch(`/api/system-tabs?tab_id=${tabId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error(`[SystemTabPanel] Failed to load ${tabId}:`, response.status, await response.text())
        throw new Error('Failed to load tab data')
      }

      const result = await response.json()

      setData((prev) => ({
        ...prev,
        [tabId]: result.data || {},
      }))

      setCompletions((prev) => ({
        ...prev,
        [tabId]: result.completion,
      }))
    } catch (error) {
      console.error(`[SystemTabPanel] Load error for ${tabId}:`, error)
    }
  }

  // ============================================================================
  // フィールド値変更
  // ============================================================================
  const handleFieldChange = (tabId: SystemTabId, fieldKey: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        [fieldKey]: value,
      },
    }))

    // リアルタイムバリデーション
    const error = validateField(tabId, fieldKey, value)
    setErrors((prev) => ({
      ...prev,
      [`${tabId}.${fieldKey}`]: error || '',
    }))
  }

  // ============================================================================
  // 保存
  // ============================================================================
  const handleSave = async () => {
    const currentTab = SYSTEM_TABS.find((t) => t.id === activeTab)
    if (!currentTab) return

    // バリデーション
    const validationErrors: Record<string, string> = {}
    const fields = []

    for (const field of currentTab.fields) {
      const value = data[activeTab][field.key]
      const error = validateField(activeTab, field.key, value)

      if (error) {
        validationErrors[`${activeTab}.${field.key}`] = error
      }

      // 値がある場合のみ保存対象に追加
      if (value !== null && value !== undefined && value !== '') {
        fields.push({
          field_key: field.key,
          value: value,
        })
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    setSuccessMessage('')

    try {
      const response = await fetch('/api/system-tabs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tab_id: activeTab,
          fields,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      // 完成度を再取得
      await loadTabData(activeTab)

      setSuccessMessage('保存しました')
      setTimeout(() => setSuccessMessage(''), 3000)

      if (onSaveSuccess) {
        onSaveSuccess()
      }
    } catch (error: any) {
      console.error('[SystemTabPanel] Save error:', error)
      setErrors({ _general: error.message || '保存に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  // ============================================================================
  // レンダリング
  // ============================================================================
  const currentTab = SYSTEM_TABS.find((t) => t.id === activeTab)
  const currentCompletion = completions[activeTab]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* ============================================================================ */}
      {/* タブヘッダー */}
      {/* ============================================================================ */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {SYSTEM_TABS.map((tab) => {
            const completion = completions[tab.id]
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 min-w-[140px] px-6 py-4 text-center
                  border-b-2 transition-all duration-200
                  ${
                    isActive
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(completion.completion_rate)}%完了
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ============================================================================ */}
      {/* タブコンテンツ */}
      {/* ============================================================================ */}
      <div className="p-6 md:p-8">
        {/* タブ説明 */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{currentTab?.description}</p>
        </div>

        {/* 完成度プログレスバー */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              入力完成度
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {currentCompletion.filled_fields}/{currentCompletion.total_fields} 項目
              ({Math.round(currentCompletion.completion_rate)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentCompletion.completion_rate}%` }}
            />
          </div>
        </div>

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm font-medium">
              ✓ {successMessage}
            </p>
          </div>
        )}

        {/* 一般エラー */}
        {errors._general && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{errors._general}</p>
          </div>
        )}

        {/* フィールド一覧 */}
        <div className="space-y-6">
          {currentTab?.fields.map((field) => (
            <SystemTabField
              key={field.key}
              field={field}
              value={data[activeTab][field.key]}
              onChange={(value) => handleFieldChange(activeTab, field.key, value)}
              error={errors[`${activeTab}.${field.key}`]}
              disabled={saving}
            />
          ))}
        </div>

        {/* 保存ボタン */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              px-8 py-3 rounded-lg font-medium
              transition-all duration-200
              ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              }
              text-white
            `}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                保存中...
              </span>
            ) : (
              '保存する'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
