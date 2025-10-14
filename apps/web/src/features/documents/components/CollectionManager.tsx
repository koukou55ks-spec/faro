'use client'

import { useState, useEffect } from 'react'
import { useDocumentsStore } from '../stores/documentsStore'
import { FolderPlus, Folder, ChevronRight, FileText } from 'lucide-react'

interface CollectionManagerProps {
  authToken?: string
  onSelectCollection?: (collectionId: string | undefined) => void
  selectedCollectionId?: string
}

export function CollectionManager({ authToken, onSelectCollection, selectedCollectionId }: CollectionManagerProps) {
  const { collections, documents, fetchCollections, createCollection } = useDocumentsStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  useEffect(() => {
    if (authToken) {
      fetchCollections(authToken)
    }
  }, [authToken, fetchCollections])

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !authToken) return

    await createCollection(newCollectionName.trim(), authToken)
    setNewCollectionName('')
    setIsCreating(false)
  }

  const getDocumentCount = (collectionId: string) => {
    return documents.filter(doc => doc.collection_id === collectionId).length
  }

  const allDocumentsCount = documents.filter(doc => !doc.collection_id).length

  return (
    <div className="space-y-3">
      {/* All Documents */}
      <button
        onClick={() => onSelectCollection?.(undefined)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          selectedCollectionId === undefined
            ? 'bg-faro-purple text-white'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <FileText className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left font-medium">すべてのドキュメント</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          selectedCollectionId === undefined
            ? 'bg-white/20 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}>
          {allDocumentsCount}
        </span>
      </button>

      {/* Collections List */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            コレクション
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="新規コレクション"
          >
            <FolderPlus className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* New Collection Input */}
        {isCreating && (
          <div className="px-3 py-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCollection()
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setNewCollectionName('')
                }
              }}
              onBlur={handleCreateCollection}
              placeholder="コレクション名"
              className="w-full px-3 py-1.5 text-sm border border-faro-purple rounded-md focus:outline-none focus:ring-2 focus:ring-faro-purple/20"
              autoFocus
            />
          </div>
        )}

        {/* Collections */}
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => onSelectCollection?.(collection.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              selectedCollectionId === collection.id
                ? 'bg-faro-purple text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Folder className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left text-sm truncate">{collection.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedCollectionId === collection.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {getDocumentCount(collection.id)}
            </span>
          </button>
        ))}

        {collections.length === 0 && !isCreating && (
          <p className="px-3 py-4 text-xs text-gray-400 text-center">
            コレクションを作成して<br />ドキュメントを整理
          </p>
        )}
      </div>
    </div>
  )
}
