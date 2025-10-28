/**
 * カスタムタブテンプレート選択モーダル
 *
 * ユーザーがカスタムタブを作成する際に、テンプレートを選択する
 */

'use client'

import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  icon: string
  category: string
  default_tags: string[]
  fields: any[]
  is_system: boolean
}

interface TemplateSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
  token: string
}

export default function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectTemplate,
  token,
}: TemplateSelectionModalProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/custom-tab-templates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('[TemplateSelection] Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            テンプレートを選択
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                    ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">{template.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        {template.is_system && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            公式
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      {template.default_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.default_tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${
                selectedTemplate
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            このテンプレートを使う
          </button>
        </div>
      </div>
    </div>
  )
}
