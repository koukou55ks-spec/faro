'use client'

import { useState } from 'react'
import { useDocumentsStore } from '../stores/documentsStore'
import { ChevronDown, FileText, Folder, Check } from 'lucide-react'

interface SourceSelectorProps {
  onSelectionChange?: (selection: {
    documents: string[]
    collections: string[]
    includeNotes: boolean
    includeMessages: boolean
  }) => void
}

export function SourceSelector({ onSelectionChange }: SourceSelectorProps) {
  const {
    documents,
    collections,
    selectedDocuments,
    selectedCollections,
    toggleDocumentSelection,
    toggleCollectionSelection,
    clearSelection,
  } = useDocumentsStore()

  const [isOpen, setIsOpen] = useState(false)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeMessages, setIncludeMessages] = useState(true)

  const totalSelected = selectedDocuments.length + selectedCollections.length

  const handleToggle = (type: 'document' | 'collection', id: string) => {
    if (type === 'document') {
      toggleDocumentSelection(id)
    } else {
      toggleCollectionSelection(id)
    }

    // Notify parent after state update
    setTimeout(() => {
      onSelectionChange?.({
        documents: useDocumentsStore.getState().selectedDocuments,
        collections: useDocumentsStore.getState().selectedCollections,
        includeNotes,
        includeMessages,
      })
    }, 0)
  }

  const handleClearAll = () => {
    clearSelection()
    onSelectionChange?.({
      documents: [],
      collections: [],
      includeNotes,
      includeMessages,
    })
  }

  const handleCheckboxChange = (type: 'notes' | 'messages', checked: boolean) => {
    if (type === 'notes') {
      setIncludeNotes(checked)
    } else {
      setIncludeMessages(checked)
    }

    onSelectionChange?.({
      documents: selectedDocuments,
      collections: selectedCollections,
      includeNotes: type === 'notes' ? checked : includeNotes,
      includeMessages: type === 'messages' ? checked : includeMessages,
    })
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
      >
        <FileText className="w-4 h-4" />
        <span>
          {totalSelected === 0
            ? 'ソースを選択'
            : `${totalSelected}個のソース`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-full left-0 mb-2 w-80 max-h-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">コンテキストソース</h3>
              {totalSelected > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  すべて解除
                </button>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-72">
              {/* Built-in Sources */}
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">組み込みソース</p>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => handleCheckboxChange('notes', e.target.checked)}
                    className="w-4 h-4 text-faro-purple rounded border-gray-300 focus:ring-faro-purple"
                  />
                  <span className="text-sm text-gray-700">📝 ノート</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={includeMessages}
                    onChange={(e) => handleCheckboxChange('messages', e.target.checked)}
                    className="w-4 h-4 text-faro-purple rounded border-gray-300 focus:ring-faro-purple"
                  />
                  <span className="text-sm text-gray-700">💬 会話履歴</span>
                </label>
              </div>

              {/* Collections */}
              {collections.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">コレクション</p>
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleToggle('collection', collection.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        selectedCollections.includes(collection.id)
                          ? 'bg-purple-50 text-faro-purple'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Folder className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm flex-1 text-left truncate">
                        {collection.icon} {collection.name}
                      </span>
                      {selectedCollections.includes(collection.id) && (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">ドキュメント</p>
                  {documents.slice(0, 10).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleToggle('document', doc.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        selectedDocuments.includes(doc.id)
                          ? 'bg-purple-50 text-faro-purple'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm flex-1 text-left truncate">
                        {doc.title}
                      </span>
                      {selectedDocuments.includes(doc.id) && (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  {documents.length > 10 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      他 {documents.length - 10} 件...
                    </p>
                  )}
                </div>
              )}

              {/* Empty State */}
              {documents.length === 0 && collections.length === 0 && (
                <div className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    まだドキュメントがありません
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
