'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Source, UpdateSourceInput, PRESET_CATEGORIES, SourceType, AIPriority } from '../../../lib/types/sources'

interface EditSourceModalProps {
  isOpen: boolean
  source: Source | null
  onClose: () => void
  onUpdate: (id: string, input: UpdateSourceInput) => Promise<void>
}

const SOURCE_TYPES: { value: SourceType; label: string; description: string }[] = [
  { value: 'text', label: 'テキスト', description: '自由記述の情報' },
  { value: 'number', label: '数値', description: '金額や人数など' },
  { value: 'document', label: 'ドキュメント', description: 'PDF、画像などのファイル' },
  { value: 'link', label: 'リンク', description: '外部URLの参照' }
]

const AI_PRIORITIES: { value: AIPriority; label: string; description: string }[] = [
  { value: 'always', label: '常に参照', description: 'AIが常にこの情報を参照します' },
  { value: 'on_demand', label: '必要に応じて', description: 'AIが必要と判断した時に参照します' },
  { value: 'manual', label: '手動のみ', description: '手動で指定した時のみ参照します' }
]

export default function EditSourceModal({ isOpen, source, onClose, onUpdate }: EditSourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: 'text' as SourceType,
    textContent: '',
    numberValue: '',
    numberUnit: '',
    documentFileName: '',
    documentFileUrl: '',
    documentFileType: '',
    linkUrl: '',
    linkTitle: '',
    linkDescription: '',
    tags: '',
    aiPriority: 'on_demand' as AIPriority
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // sourceが変更されたらフォームを初期化
  useEffect(() => {
    if (source) {
      setFormData({
        title: source.title,
        category: source.category,
        type: source.type,
        textContent: source.content.text || '',
        numberValue: source.content.number?.value.toString() || '',
        numberUnit: source.content.number?.unit || '',
        documentFileName: source.content.document?.file_name || '',
        documentFileUrl: source.content.document?.file_url || '',
        documentFileType: source.content.document?.file_type || '',
        linkUrl: source.content.link?.url || '',
        linkTitle: source.content.link?.title || '',
        linkDescription: source.content.link?.description || '',
        tags: source.tags.join(', '),
        aiPriority: source.ai_priority
      })
      setError(null)
    }
  }, [source])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!source) return

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
      const content: UpdateSourceInput['content'] = {}

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
      } else if (formData.type === 'document') {
        if (!formData.documentFileName.trim()) {
          setError('ファイル名を入力してください')
          return
        }
        if (!formData.documentFileUrl.trim()) {
          setError('ファイルURLを入力してください')
          return
        }
        content.document = {
          file_name: formData.documentFileName.trim(),
          file_url: formData.documentFileUrl.trim(),
          file_type: formData.documentFileType.trim() || ''
        }
      } else if (formData.type === 'link') {
        if (!formData.linkUrl.trim()) {
          setError('URLを入力してください')
          return
        }
        content.link = {
          url: formData.linkUrl.trim(),
          title: formData.linkTitle.trim() || undefined,
          description: formData.linkDescription.trim() || undefined
        }
      }

      // タグの処理
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const input: UpdateSourceInput = {
        title: formData.title.trim(),
        category: formData.category,
        type: formData.type,
        content,
        tags,
        ai_priority: formData.aiPriority
      }

      await onUpdate(source.id, input)

      onClose()
    } catch (err) {
      console.error('[EditSourceModal] Error updating source:', err)
      setError(err instanceof Error ? err.message : 'ソースの更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null)
      onClose()
    }
  }

  if (!isOpen || !source) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">ソースを編集</h2>
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
                  {type.label} - {type.description}
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
            ) : formData.type === 'number' ? (
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
            ) : formData.type === 'document' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.documentFileName}
                  onChange={(e) => setFormData({ ...formData, documentFileName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ファイル名 (例: 確定申告書.pdf)"
                  required
                />
                <input
                  type="url"
                  value={formData.documentFileUrl}
                  onChange={(e) => setFormData({ ...formData, documentFileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ファイルURL (例: https://example.com/document.pdf)"
                  required
                />
                <input
                  type="text"
                  value={formData.documentFileType}
                  onChange={(e) => setFormData({ ...formData, documentFileType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ファイル形式 (例: pdf, png, jpg) - 任意"
                />
              </div>
            ) : formData.type === 'link' ? (
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="URL (例: https://example.com/article)"
                  required
                />
                <input
                  type="text"
                  value={formData.linkTitle}
                  onChange={(e) => setFormData({ ...formData, linkTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="リンクタイトル (任意)"
                />
                <textarea
                  value={formData.linkDescription}
                  onChange={(e) => setFormData({ ...formData, linkDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="リンクの説明 (任意)"
                />
              </div>
            ) : null}
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
              {isSubmitting ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
