'use client'

import { StickyNote, Plus } from 'lucide-react'

interface NoteSourceProps {
  onNavigateToNotes: () => void
  noteCount: number
}

export function NoteSource({ onNavigateToNotes, noteCount }: NoteSourceProps) {
  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <StickyNote className="w-5 h-5 text-amber-500" />
          自由メモ
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          医療費、保険、その他の情報を自由に記録
        </p>
      </div>

      {noteCount > 0 ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-1">
            {noteCount}件
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-500 mb-3">
            のメモが保存されています
          </p>
          <button
            onClick={onNavigateToNotes}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            メモを見る・編集する
          </button>
        </div>
      ) : (
        <button
          onClick={onNavigateToNotes}
          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
        >
          <Plus className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            メモを追加
          </p>
          <p className="text-xs text-gray-500">
            医療費レシート、保険情報など
          </p>
        </button>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        💡 医療費、保険情報など、自由に情報を整理・管理できます
      </p>
    </div>
  )
}
