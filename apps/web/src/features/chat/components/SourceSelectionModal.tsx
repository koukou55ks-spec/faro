'use client'

import { X, FileText, Folder, Sparkles } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description?: string
  documentCount?: number
}

interface Document {
  id: string
  title: string
  file_type: string
}

interface SourceSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  collections: Collection[]
  documents: Document[]
  selectedCollections: string[]
  selectedDocuments: string[]
  includeNotes: boolean
  includeMessages: boolean
  onToggleCollection: (id: string) => void
  onToggleDocument: (id: string) => void
  onToggleNotes: (value: boolean) => void
  onToggleMessages: (value: boolean) => void
  onReset: () => void
}

export function SourceSelectionModal({
  isOpen,
  onClose,
  collections,
  documents,
  selectedCollections,
  selectedDocuments,
  includeNotes,
  includeMessages,
  onToggleCollection,
  onToggleDocument,
  onToggleNotes,
  onToggleMessages,
  onReset,
}: SourceSelectionModalProps) {
  if (!isOpen) return null

  const selectedSourcesCount = selectedDocuments.length + selectedCollections.length + (includeNotes ? 1 : 0) + (includeMessages ? 1 : 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            参照するソースを選択
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Include Options */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">全般</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => onToggleNotes(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">ノートを含める</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeMessages}
                  onChange={(e) => onToggleMessages(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Sparkles className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">過去の会話を含める</span>
              </label>
            </div>
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                コレクション ({collections.length})
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {collections.map((collection) => (
                  <label
                    key={collection.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.id)}
                      onChange={() => onToggleCollection(collection.id)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Folder className="w-5 h-5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{collection.name}</p>
                      {collection.description && (
                        <p className="text-xs text-gray-500 truncate">{collection.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{collection.documentCount}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                ドキュメント ({documents.length})
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => onToggleDocument(doc.id)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500">{doc.file_type.toUpperCase()}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {collections.length === 0 && documents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ドキュメントがありません
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                ノートからドキュメントをアップロードしてください
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedSourcesCount}個のソースを選択中
          </p>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              リセット
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              適用
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
