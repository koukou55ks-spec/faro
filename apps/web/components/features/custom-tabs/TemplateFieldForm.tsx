'use client'

import { useState } from 'react'
import { FileText, Calendar, Hash, Type, AlignLeft, Upload } from 'lucide-react'

// テンプレートフィールド定義の型
export interface TemplateField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'file'
  options?: string[]
  unit?: string
  required?: boolean
}

interface TemplateFieldFormProps {
  fields: TemplateField[]
  onSubmit: (data: Record<string, any>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function TemplateFieldForm({
  fields,
  onSubmit,
  onCancel,
  isSubmitting = false
}: TemplateFieldFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // エラーをクリア
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label}は必須項目です`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return Type
      case 'textarea': return AlignLeft
      case 'number': return Hash
      case 'date': return Calendar
      case 'file': return Upload
      default: return FileText
    }
  }

  const renderField = (field: TemplateField) => {
    const Icon = getFieldIcon(field.type)
    const value = formData[field.key] ?? ''
    const error = errors[field.key]

    return (
      <div key={field.key} className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Icon className="w-4 h-4 text-gray-400" />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
          {field.unit && <span className="text-xs text-gray-500">（{field.unit}）</span>}
        </label>

        {field.type === 'text' && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
            }`}
            placeholder={`${field.label}を入力`}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
            }`}
            placeholder={`${field.label}を入力`}
          />
        )}

        {field.type === 'number' && (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || '')}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
            }`}
            placeholder={`${field.label}を入力`}
          />
        )}

        {field.type === 'select' && field.options && (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
            }`}
          >
            <option value="">選択してください</option>
            {field.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {field.type === 'date' && (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
            }`}
          />
        )}

        {field.type === 'file' && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFieldChange(field.key, file)
                }
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/20 dark:file:text-purple-400"
            />
            <p className="text-xs text-gray-500 mt-2">
              PDF、画像などのファイルをアップロード
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 全フィールドをレンダリング */}
      {fields.map(field => renderField(field))}

      {/* アクションボタン */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? '追加中...' : '追加'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors font-medium"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
