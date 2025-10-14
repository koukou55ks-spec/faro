'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Upload, Loader2, X, FileText, Plus, Type, Trash2 } from 'lucide-react'
import { useDocumentsStore } from '../stores/documentsStore'
import { useGuestDocumentsStore } from '../stores/guestDocumentsStore'

interface NotebookLMProjectViewProps {
  projectId: string
  authToken?: string
  isGuest?: boolean
  onBack: () => void
}

export function NotebookLMProjectView({
  projectId,
  authToken,
  isGuest = false,
  onBack
}: NotebookLMProjectViewProps) {
  const { documents: authDocuments, collections: authCollections, fetchDocuments, uploadDocument, deleteDocument: deleteAuthDocument } = useDocumentsStore()
  const { documents: guestDocuments, addDocument: addGuestDocument, deleteDocument: deleteGuestDocument } = useGuestDocumentsStore()
  const [isUploading, setIsUploading] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documents = authToken ? authDocuments : guestDocuments
  const collections = authToken ? authCollections : []

  const project = collections.find(c => c.id === projectId)
  const projectDocuments = documents.filter(d =>
    (d as any).collectionId === projectId || (d as any).collection_id === projectId
  )

  useEffect(() => {
    if (authToken) {
      fetchDocuments(authToken, projectId)
    }
  }, [authToken, projectId, fetchDocuments])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setShowAddMenu(false)
    try {
      if (authToken) {
        await uploadDocument(authToken, file, projectId)
        await fetchDocuments(authToken, projectId)
      } else {
        const text = await file.text()
        addGuestDocument(file.name, text, projectId)
      }
    } catch (error) {
      console.error('[NotebookLM] Error uploading document:', error)
      alert('ドキュメントのアップロードに失敗しました')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddText = () => {
    if (!textTitle.trim() || !textContent.trim()) {
      alert('タイトルと内容を入力してください')
      return
    }

    try {
      if (authToken) {
        const blob = new Blob([textContent], { type: 'text/plain' })
        const file = new File([blob], `${textTitle}.txt`, { type: 'text/plain' })
        uploadDocument(authToken, file, projectId)
        fetchDocuments(authToken, projectId)
      } else {
        addGuestDocument(textTitle, textContent, projectId)
      }

      setTextTitle('')
      setTextContent('')
      setShowTextInput(false)
      setShowAddMenu(false)
    } catch (error) {
      console.error('[NotebookLM] Error adding text:', error)
      alert('テキストの追加に失敗しました')
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('このソースを削除しますか？')) return

    try {
      if (authToken) {
        await deleteAuthDocument(documentId, authToken)
      } else {
        deleteGuestDocument(documentId)
      }
    } catch (error) {
      console.error('[NotebookLM] Error deleting document:', error)
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{project?.name || 'ノートブック'}</h1>
            <p className="text-xs text-gray-500">{projectDocuments.length}件のソース</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            追加
          </button>

          {/* Add Menu Dropdown */}
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
              <button
                onClick={() => {
                  fileInputRef.current?.click()
                  setShowAddMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                ファイルをアップロード
              </button>
              <button
                onClick={() => {
                  setShowTextInput(true)
                  setShowAddMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Type className="w-4 h-4" />
                テキストを追加
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </header>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-4">
        {projectDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ソースを追加
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              ファイルをアップロードするか、<br />
              テキストを直接追加してください
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {projectDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate mb-1">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {(doc as any).word_count ? `${(doc as any).word_count}文字` : ''}
                        {(doc as any).file_type && ` • ${(doc as any).file_type.toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">テキストを追加</h2>
              <button
                onClick={() => {
                  setShowTextInput(false)
                  setTextTitle('')
                  setTextContent('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="例: 会議メモ、重要な情報"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="テキストを入力またはペーストしてください..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => {
                  setShowTextInput(false)
                  setTextTitle('')
                  setTextContent('')
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddText}
                disabled={!textTitle.trim() || !textContent.trim()}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
