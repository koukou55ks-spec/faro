'use client'

import { useState, useEffect } from 'react'
import { useDocumentsStore } from '../stores/documentsStore'
import { useGuestDocumentsStore } from '../stores/guestDocumentsStore'
import { CollectionTree } from './CollectionTree'
import { DocumentList } from './DocumentList'
import { DocumentUpload } from './DocumentUpload'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { Document } from '../stores/documentsStore'
import { GuestDocument } from '../stores/guestDocumentsStore'
import {
  FolderPlus,
  Upload,
  Search,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface DocumentsPanelProps {
  authToken?: string
  onDocumentSelect?: (documentId: string) => void
}

export function DocumentsPanel({ authToken, onDocumentSelect }: DocumentsPanelProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [previewDocument, setPreviewDocument] = useState<Document | GuestDocument | null>(null)

  // Auth mode
  const {
    collections: authCollections,
    documents: authDocuments,
    fetchCollections: fetchAuthCollections,
    fetchDocuments: fetchAuthDocuments,
    createCollection: createAuthCollection,
    isLoading: authLoading,
    error: authError,
    setError: setAuthError,
  } = useDocumentsStore()

  // Guest mode
  const {
    collections: guestCollections,
    documents: guestDocuments,
    addCollection: addGuestCollection,
    error: guestError,
    setError: setGuestError,
  } = useGuestDocumentsStore()

  // Determine which data to use
  const collections = authToken ? authCollections : guestCollections
  const documents: Document[] | GuestDocument[] = authToken ? authDocuments : guestDocuments
  const error = authToken ? authError : guestError
  const setError = authToken ? setAuthError : setGuestError
  const isLoading = authToken ? authLoading : false

  // Fetch data on mount (auth mode only)
  useEffect(() => {
    if (authToken) {
      fetchAuthCollections(authToken)
      fetchAuthDocuments(authToken)
    }
  }, [authToken])

  // Filter documents by selected collection and search query
  const filteredDocuments: Document[] | GuestDocument[] = authToken
    ? (documents as Document[]).filter(doc => {
        const matchesCollection = !selectedCollectionId || doc.collection_id === selectedCollectionId
        const matchesSearch = !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCollection && matchesSearch
      })
    : (documents as GuestDocument[]).filter(doc => {
        const matchesCollection = !selectedCollectionId || doc.collectionId === selectedCollectionId
        const matchesSearch = !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCollection && matchesSearch
      })

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      setError('コレクション名を入力してください')
      return
    }

    try {
      if (authToken) {
        await createAuthCollection(
          authToken,
          newCollectionName,
          undefined,
          '📁',
          selectedCollectionId || undefined
        )
      } else {
        addGuestCollection(
          newCollectionName,
          undefined,
          '📁',
          selectedCollectionId || undefined
        )
      }

      setNewCollectionName('')
      setShowNewCollection(false)
    } catch (error: any) {
      console.error('[DocumentsPanel] Create collection error:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-3 md:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              ドキュメント
            </h2>
            {selectedCollectionId && (
              <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center gap-1">
                <span>📁</span>
                <span className="truncate">
                  {collections.find(c => c.id === selectedCollectionId)?.name || 'コレクション'}
                </span>
                <button
                  onClick={() => setSelectedCollectionId(null)}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  title="すべてのドキュメントに戻る"
                >
                  <X className="w-3 h-3" />
                </button>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewCollection(!showNewCollection)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={selectedCollectionId ? "子フォルダを追加" : "新しいコレクション"}
            >
              <FolderPlus className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-3 py-2 bg-faro-purple hover:bg-faro-purple-dark text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              title={selectedCollectionId ? "このフォルダにアップロード" : "アップロード"}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">アップロード</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ドキュメントを検索..."
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:border-faro-purple focus:ring-2 focus:ring-faro-purple/20 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 mx-3 md:mx-4 mt-3 p-2.5 md:p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs md:text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      )}

      {/* New Collection Form */}
      {showNewCollection && (
        <div className="flex-shrink-0 mx-3 md:mx-4 mt-3 p-3 md:p-4 rounded-lg bg-purple-50 border border-faro-purple/30">
          {selectedCollectionId && (
            <p className="text-xs text-faro-purple mb-2">
              📁 {collections.find(c => c.id === selectedCollectionId)?.name} の中に追加
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              placeholder={selectedCollectionId ? "子フォルダ名を入力..." : "コレクション名を入力..."}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-faro-purple focus:ring-2 focus:ring-faro-purple/20 outline-none"
              autoFocus
            />
            <button
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim()}
              className="px-3 py-2 bg-faro-purple hover:bg-faro-purple-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              作成
            </button>
            <button
              onClick={() => {
                setShowNewCollection(false)
                setNewCollectionName('')
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUpload && (
        <div className="flex-shrink-0 mx-3 md:mx-4 mt-3">
          {selectedCollectionId && (
            <div className="mb-3 p-2 bg-purple-50 border border-faro-purple/30 rounded-lg">
              <p className="text-xs text-faro-purple flex items-center gap-1">
                <span>📁</span>
                <span className="font-medium">{collections.find(c => c.id === selectedCollectionId)?.name}</span>
                <span>に追加されます</span>
              </p>
            </div>
          )}
          <DocumentUpload
            authToken={authToken}
            collectionId={selectedCollectionId || undefined}
            onComplete={() => {
              setShowUpload(false)
              if (authToken) {
                fetchAuthDocuments(authToken, selectedCollectionId || undefined)
              }
            }}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-faro-purple animate-spin" />
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 md:p-4">
            {/* Collections Tree (Left Sidebar on Desktop, Top on Mobile) */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
              <CollectionTree
                collections={collections}
                selectedCollectionId={selectedCollectionId}
                onSelectCollection={setSelectedCollectionId}
                authToken={authToken}
              />
            </div>

            {/* Documents List (Right Content Area) */}
            <div className="md:col-span-2 overflow-y-auto">
              <DocumentList
                documents={filteredDocuments}
                authToken={authToken}
                onDocumentSelect={(documentId) => {
                  const doc = filteredDocuments.find(d => d.id === documentId)
                  if (doc) {
                    setPreviewDocument(doc)
                  }
                  onDocumentSelect?.(documentId)
                }}
                onRefresh={() => {
                  if (authToken) {
                    fetchAuthDocuments(authToken, selectedCollectionId || undefined)
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          authToken={authToken}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  )
}
