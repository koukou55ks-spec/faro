'use client'

import { Pencil, Trash2, Calendar, Tag as TagIcon } from 'lucide-react'
import { Source } from '../../../lib/types/sources'

interface SourceCardProps {
  source: Source
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  '収入': 'bg-green-100 text-green-800',
  '控除': 'bg-blue-100 text-blue-800',
  '医療費': 'bg-red-100 text-red-800',
  '保険': 'bg-purple-100 text-purple-800',
  '資産': 'bg-yellow-100 text-yellow-800',
  '負債': 'bg-orange-100 text-orange-800',
  'その他': 'bg-gray-100 text-gray-800'
}

const AI_PRIORITY_LABELS: Record<string, string> = {
  'always': '常に参照',
  'on_demand': '必要に応じて',
  'manual': '手動のみ'
}

const AI_PRIORITY_COLORS: Record<string, string> = {
  'always': 'text-green-600',
  'on_demand': 'text-blue-600',
  'manual': 'text-gray-600'
}

export default function SourceCard({ source, onEdit, onDelete }: SourceCardProps) {
  const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderContent = () => {
    if (source.type === 'text' && source.content.text) {
      return (
        <div className="text-sm text-gray-700 line-clamp-3">
          {source.content.text}
        </div>
      )
    }

    if (source.type === 'number' && source.content.number) {
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-gray-900">
            {source.content.number.value.toLocaleString()}
          </span>
          {source.content.number.unit && (
            <span className="text-sm text-gray-500">
              {source.content.number.unit}
            </span>
          )}
        </div>
      )
    }

    return (
      <div className="text-sm text-gray-500">
        コンテンツなし
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {source.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(source.category)}`}>
                {source.category}
              </span>
              <span className={`text-xs ${AI_PRIORITY_COLORS[source.ai_priority]}`}>
                {AI_PRIORITY_LABELS[source.ai_priority]}
              </span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(source.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="編集"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(source.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* フッター */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          {/* 作成日時 */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(source.created_at)}</span>
          </div>

          {/* タグ */}
          {source.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <TagIcon className="w-3 h-3" />
              <div className="flex items-center gap-1 flex-wrap">
                {source.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
                {source.tags.length > 3 && (
                  <span className="text-gray-500">
                    +{source.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
