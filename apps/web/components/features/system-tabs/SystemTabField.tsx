/**
 * システムタブフィールドコンポーネント
 *
 * すべてのフィールドタイプに対応した汎用フィールドコンポーネント
 */

'use client'

import React from 'react'
import type { FieldDefinition } from '../../../lib/types/systemTab'

interface SystemTabFieldProps {
  field: FieldDefinition
  value: any
  onChange: (value: any) => void
  error?: string | null
  disabled?: boolean
}

export default function SystemTabField({
  field,
  value,
  onChange,
  error,
  disabled = false,
}: SystemTabFieldProps) {
  const inputClasses = `
    w-full px-4 py-3
    bg-white dark:bg-gray-800
    border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
    rounded-lg
    focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const labelClasses = `
    block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2
    ${field.required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}
  `

  // ============================================================================
  // テキスト入力
  // ============================================================================
  if (field.type === 'text') {
    return (
      <div className="mb-6">
        <label className={labelClasses}>{field.label}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={inputClasses}
        />
        {field.helpText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // ============================================================================
  // テキストエリア
  // ============================================================================
  if (field.type === 'textarea') {
    return (
      <div className="mb-6">
        <label className={labelClasses}>{field.label}</label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={4}
          className={inputClasses}
        />
        {field.helpText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // ============================================================================
  // 数値入力
  // ============================================================================
  if (field.type === 'number') {
    return (
      <div className="mb-6">
        <label className={labelClasses}>{field.label}</label>
        <div className="relative">
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const num = e.target.value === '' ? null : parseFloat(e.target.value)
              onChange(num)
            }}
            placeholder={field.placeholder}
            disabled={disabled}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            className={inputClasses + ' pr-16'}
          />
          {field.unit && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 pointer-events-none">
              {field.unit}
            </div>
          )}
        </div>
        {field.helpText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // ============================================================================
  // 選択肢
  // ============================================================================
  if (field.type === 'select') {
    return (
      <div className="mb-6">
        <label className={labelClasses}>{field.label}</label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">選択してください</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {field.helpText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // ============================================================================
  // 日付
  // ============================================================================
  if (field.type === 'date') {
    return (
      <div className="mb-6">
        <label className={labelClasses}>{field.label}</label>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClasses}
        />
        {field.helpText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // ============================================================================
  // ファイル
  // ============================================================================
  if (field.type === 'file' || field.type === 'files') {
    return (
      <div className="mb-6">
        <label className={labelClasses}>{field.label}</label>
        <div
          className={`
            border-2 border-dashed ${error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}
            rounded-lg p-6 text-center
            hover:border-blue-400 dark:hover:border-blue-500
            transition-colors duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              onChange(field.multiple ? files : files[0] || null)
            }}
            disabled={disabled}
            className="hidden"
            id={`file-${field.key}`}
          />
          <label
            htmlFor={`file-${field.key}`}
            className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          >
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              クリックしてファイルを選択
              {field.multiple && 'またはドラッグ&ドロップ'}
            </p>
            {field.accept && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                対応形式: {field.accept}
              </p>
            )}
          </label>

          {value && (
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              {Array.isArray(value)
                ? `${value.length}個のファイルが選択されています`
                : value.name || 'ファイルが選択されています'}
            </div>
          )}
        </div>
        {field.helpText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{field.helpText}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return null
}
