'use client'

import { useState } from 'react'
import { User, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useAuth } from '../../lib/hooks/useAuth'
import { useSources } from '../../lib/hooks/useSources'
import { PRESET_CATEGORIES } from '../../lib/types/sources'
import { CreateSourceInput } from '../../lib/types/sources'
import BasicProfileSection from '../../components/features/sources-v5/BasicProfileSection'
import SourceCard from '../../components/features/sources-v5/SourceCard'
import AddSourceModal from '../../components/features/sources-v5/AddSourceModal'
import CategoryFilter from '../../components/features/sources-v5/CategoryFilter'

export default function MyPageV5() {
  // 状態管理
  const { user } = useAuth()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProfileExpanded, setIsProfileExpanded] = useState(true)
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)

  // フィルター適用
  const filters = selectedCategories.length > 0 ? { categories: selectedCategories } : undefined
  const { sources, loading, createSource, updateSource, deleteSource } = useSources(filters)

  // ハンドラー関数
  const handleCreateSource = async (input: CreateSourceInput) => {
    try {
      await createSource(input)
      setIsModalOpen(false)
    } catch (err) {
      console.error('[MyPageV5] Error creating source:', err)
      alert('ソースの作成に失敗しました')
    }
  }

  const handleEdit = (id: string) => {
    // TODO: 編集機能を実装（EditSourceModalを作成）
    console.log('Edit source:', id)
    alert('編集機能は近日公開予定です')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('このソースを削除しますか？')) {
      return
    }

    try {
      await deleteSource(id)
    } catch (err) {
      console.error('[MyPageV5] Error deleting source:', err)
      alert('ソースの削除に失敗しました')
    }
  }

  // UI構築
  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black min-h-screen">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-8 px-4 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border-2 border-white/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {user?.email || 'ゲストユーザー'}
              </h1>
              <p className="text-white/80 text-xs">
                マイソース v5.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20 w-full">
        <div className="space-y-6 w-full">
          {/* 基本プロファイル（折りたたみ可能） */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">基本プロファイル</h2>
              {isProfileExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isProfileExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="border-t border-gray-100">
                <BasicProfileSection />
              </div>
            </div>
          </div>

          {/* カテゴリフィルター */}
          <CategoryFilter
            categories={[...PRESET_CATEGORIES]}
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
          />

          {/* ソース一覧 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                マイソース
                {selectedCategories.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({sources.length}件)
                  </span>
                )}
              </h2>
            </div>

            {loading ? (
              // ローディング中のスケルトン表示
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-gray-100 rounded mb-3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : sources.length === 0 ? (
              // 空の状態
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedCategories.length > 0
                      ? 'このカテゴリにはソースがありません'
                      : 'まだソースがありません'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {selectedCategories.length > 0
                      ? '別のカテゴリを選択するか、新しいソースを追加してください。'
                      : 'AIがあなたに最適なアドバイスをするための情報源を追加しましょう。'}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    最初のソースを追加
                  </button>
                </div>
              </div>
            ) : (
              // ソース一覧表示
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map((source) => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 追加ボタン（ソースがある場合） */}
          {sources.length > 0 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                新しいソースを追加
              </button>
            </div>
          )}

          {/* フッター説明 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>ソースとは？</strong> AIチャットがあなたに最適な回答をするために参照する情報源です。
                どの情報がいつ使われるか明示され、必要な情報だけをAIが自動で参照します。
              </p>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              チャットで質問すると、これらのソースが自動的に参照されます
            </p>
          </div>
        </div>
      </div>

      {/* AddSourceModal */}
      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSource}
      />
    </div>
  )
}
