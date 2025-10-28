'use client'

import { useState } from 'react'
import { Database, Edit2, Check, X, AlertCircle } from 'lucide-react'
import { RequiredField } from '../../../lib/types/sources'
import { motion, AnimatePresence } from 'framer-motion'

interface RequiredSourceProps {
  fields: RequiredField[]
  completion: number
  impact: string[]
  onFieldUpdate: (key: string, value: any) => Promise<void>
}

export function RequiredSource({ fields, completion, impact, onFieldUpdate }: RequiredSourceProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const missingFields = fields.filter(f => f.missing)
  const completedFields = fields.filter(f => !f.missing)

  const handleStartEdit = (field: RequiredField) => {
    setEditingField(field.key)
    setEditValue(field.value || '')
  }

  const handleSave = async (field: RequiredField) => {
    if (!editValue && field.required) return

    setIsSaving(true)
    try {
      await onFieldUpdate(field.key, editValue)
      setEditingField(null)
      setEditValue(null)
    } catch (err) {
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue(null)
  }

  return (
    <div className="border-2 border-purple-500 rounded-xl p-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Database className="w-5 h-5 text-purple-500" />
            基本プロファイル
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-normal">
              AIが常に参照
            </span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            この情報は全ての相談で自動的に参照されます
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {completion}%
          </div>
          <div className="text-xs text-gray-500">完了</div>
        </div>
      </div>

      {/* 完成時のメリット */}
      {missingFields.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4 mb-6"
        >
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
            あと{missingFields.length}項目入力すると...
          </p>
          <ul className="text-sm space-y-1">
            {impact.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                <Check className="w-4 h-4 text-purple-600" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* フィールド一覧 */}
      <div className="space-y-3">
        {/* 未入力フィールド（優先表示） */}
        {missingFields.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-4 h-4" />
              入力してください
            </div>
            {missingFields.map(field => (
              <EditableField
                key={field.key}
                field={field}
                isEditing={editingField === field.key}
                editValue={editValue}
                isSaving={isSaving}
                onStartEdit={handleStartEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onValueChange={setEditValue}
                highlight
              />
            ))}
          </div>
        )}

        {/* 入力済みフィールド */}
        {completedFields.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              入力済み
            </div>
            {completedFields.map(field => (
              <EditableField
                key={field.key}
                field={field}
                isEditing={editingField === field.key}
                editValue={editValue}
                isSaving={isSaving}
                onStartEdit={handleStartEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onValueChange={setEditValue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// インライン編集可能フィールド
function EditableField({
  field,
  isEditing,
  editValue,
  isSaving,
  onStartEdit,
  onSave,
  onCancel,
  onValueChange,
  highlight = false
}: {
  field: RequiredField
  isEditing: boolean
  editValue: any
  isSaving: boolean
  onStartEdit: (field: RequiredField) => void
  onSave: (field: RequiredField) => Promise<void>
  onCancel: () => void
  onValueChange: (value: any) => void
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg p-3 transition-all ${
        highlight
          ? 'bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </span>
            {field.required && (
              <span className="text-xs text-red-500">*必須</span>
            )}
          </div>

          {/* 編集モード */}
          {isEditing ? (
            <div className="space-y-2">
              {field.type === 'select' ? (
                <select
                  value={editValue}
                  onChange={(e) => onValueChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                >
                  <option value="">選択してください</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'number' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => onValueChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                  {field.unit && (
                    <span className="text-sm text-gray-500">{field.unit}</span>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => onValueChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              )}

              {/* 保存/キャンセル */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSave(field)}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={onCancel}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            /* 表示モード */
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                {field.value || <span className="text-gray-400">未設定</span>}
                {field.unit && field.value && ` ${field.unit}`}
              </span>
              <button
                onClick={() => onStartEdit(field)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

          {/* インパクト表示 */}
          {field.impact && !isEditing && (
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              💡 {field.impact}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
