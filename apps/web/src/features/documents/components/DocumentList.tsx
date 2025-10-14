'use client'

import { useState } from 'react'
import { useDocumentsStore, Document } from '../stores/documentsStore'
import { useGuestDocumentsStore, GuestDocument } from '../stores/guestDocumentsStore'
import {
  File as FileIcon,
  FileText,
  Trash2,
  MoreHorizontal,
  Calendar,
  FileType,
  Hash,
  Eye
} from 'lucide-react'

interface DocumentListProps {
  documents: Document[] | GuestDocument[]
  authToken?: string
  onDocumentSelect?: (documentId: string) => void
  onRefresh?: () => void
}

export function DocumentList({
  documents,
  authToken,
  onDocumentSelect,
  onRefresh
}: DocumentListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const { deleteDocument: deleteAuthDocument } = useDocumentsStore()
  const { deleteDocument: deleteGuestDocument } = useGuestDocumentsStore()

  const handleDelete = async (documentId: string) => {
    if (!confirm('このドキュメントを削除しますか?')) {
      return
    }

    try {
      if (authToken) {
        await deleteAuthDocument(documentId, authToken)
      } else {
        deleteGuestDocument(documentId)
      }
      setMenuOpenId(null)
      onRefresh?.()
    } catch (error) {
      console.error('[DocumentList] Delete error:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`

    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'txt':
      case 'md':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'csv':
        return <FileText className="w-5 h-5 text-green-500" />
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />
    }
  }

  if (documents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">ドキュメントがありません</p>
          <p className="text-sm text-gray-400 mt-2">
            右上のアップロードボタンからドキュメントを追加
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      {documents.map((document) => (
        <div
          key={document.id}
          className="group relative flex items-start gap-3 p-3 md:p-4 bg-white border border-gray-200 hover:border-faro-purple rounded-lg transition-all cursor-pointer"
          onClick={() => onDocumentSelect?.(document.id)}
        >
          {/* File Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getFileIcon(document.file_type)}
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate mb-1">
              {document.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {/* File Type */}
              <div className="flex items-center gap-1">
                <FileType className="w-3.5 h-3.5" />
                <span className="uppercase">{document.file_type}</span>
              </div>

              {/* Word Count */}
              {document.word_count && (
                <div className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{document.word_count.toLocaleString()} words</span>
                </div>
              )}

              {/* File Size (for auth mode) */}
              {authToken && (document as Document).file_size && (
                <div className="flex items-center gap-1">
                  <FileIcon className="w-3.5 h-3.5" />
                  <span>{formatFileSize((document as Document).file_size)}</span>
                </div>
              )}

              {/* Upload Date */}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(document.uploaded_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpenId(menuOpenId === document.id ? null : document.id)
              }}
              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>

            {menuOpenId === document.id && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDocumentSelect?.(document.id)
                    setMenuOpenId(null)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-t-lg"
                >
                  <Eye className="w-3.5 h-3.5" />
                  プレビュー
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(document.id)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  削除
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
