'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CreateSourceInput, PRESET_CATEGORIES, SourceType, AIPriority } from '../../../lib/types/sources'

interface AddSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (input: CreateSourceInput) => Promise<void>
}

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'text', label: 'テキスト' },
  { value: 'number', label: '数値' }
]

const AI_PRIORITIES: { value: AIPriority; label: string; description: string }[] = [
  { value: 'always', label: '常に参照', description: 'AIが常にこの情報を参照します' },
  { value: 'on_demand', label: '必要に応じて', description: 'AIが必要と判断した時に参照します' },
  { value: 'manual', label: '手動のみ', description: '手動で指定した時のみ参照します' }
]

export default function AddSourceModal({ isOpen, onClose, onCreate }: AddSourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: 'text' as SourceType,
    textContent: '',
    numberValue: '',
    numberUnit: '',
    tags: '',
    aiPriority: 'on_demand' as AIPriority
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
    if (!formData.title.trim()) {
      setError('タイトルを入力してください')
      return
    }
    if (!formData.category) {
      setError('カテゴリを選択してください')
      return
    }

    try {
      setIsSubmitting(true)

      // コンテンツの構築
      const content: CreateSourceInput['content'] = {}

      if (formData.type === 'text') {
        if (!formData.textContent.trim()) {
          setError('テキストコンテンツを入力してください')
          return
        }
        content.text = formData.textContent
      } else if (formData.type === 'number') {
        if (!formData.numberValue) {
          setError('数値を入力してください')
          return
        }
        content.number = {
          value: Number(formData.numberValue),
          unit: formData.numberUnit || undefined
        }
      }

      // タグの処理
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const input: CreateSourceInput = {
        title: formData.title.trim(),
        category: formData.category,
        type: formData.type,
        content,
        tags,
        ai_priority: formData.aiPriority
      }

      await onCreate(input)

      // フォームをリセット
      setFormData({
        title: '',
        category: '',
        type: 'text',
        textContent: '',
        numberValue: '',
        numberUnit: '',
        tags: '',
        aiPriority: 'on_demand'
      })
      onClose()
    } catch (err) {
      console.error('[AddSourceModal] Error creating source:', err)
      setError(err instanceof Error ? err.message : 'ソースの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        category: '',
        type: 'text',
        textContent: '',
        numberValue: '',
        numberUnit: '',
        tags: '',
        aiPriority: 'on_demand'
      })
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">新しいソースを追加</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors disabled:opacity-50"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 2024年給与所得"
              required
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">選択してください</option>
              {PRESET_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* タイプ */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              タイプ
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as SourceType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* コンテンツ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コンテンツ <span className="text-red-500">*</span>
            </label>
            {formData.type === 'text' ? (
              <textarea
                value={formData.textContent}
                onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="詳細な情報を入力してください..."
                required
              />
            ) : (
              <div className="flex gap-3">
                <input
                  type="number"
                  value={formData.numberValue}
                  onChange={(e) => setFormData({ ...formData, numberValue: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="数値"
                  required
                />
                <input
                  type="text"
                  value={formData.numberUnit}
                  onChange={(e) => setFormData({ ...formData, numberUnit: e.target.value })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="単位 (例: 円)"
                />
              </div>
            )}
          </div>

          {/* タグ */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="カンマ区切りで入力 (例: 給与, ボーナス, 年末調整)"
            />
          </div>

          {/* AI参照優先度 */}
          <div>
            <label htmlFor="aiPriority" className="block text-sm font-medium text-gray-700 mb-2">
              AI参照優先度
            </label>
            <select
              id="aiPriority"
              value={formData.aiPriority}
              onChange={(e) => setFormData({ ...formData, aiPriority: e.target.value as AIPriority })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {AI_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label} - {priority.description}
                </option>
              ))}
            </select>
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
