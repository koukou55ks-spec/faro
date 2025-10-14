'use client'

import { useEffect, useState } from 'react'
import { Document } from '../stores/documentsStore'
import { GuestDocument } from '../stores/guestDocumentsStore'
import { X, Download, FileText, Loader2 } from 'lucide-react'

interface DocumentPreviewModalProps {
  document: Document | GuestDocument
  authToken?: string
  onClose: () => void
}

export function DocumentPreviewModal({ document, authToken, onClose }: DocumentPreviewModalProps) {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocumentContent()
  }, [document.id])

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const loadDocumentContent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Guest document: content is stored locally
      if ('content' in document) {
        setContent(document.content)
        setIsLoading(false)
        return
      }

      // Auth document: fetch from file_url
      const authDoc = document as Document
      if (!authDoc.file_url) {
        throw new Error('ドキュメントのURLが見つかりません')
      }

      // For PDF files, show download link instead
      if (authDoc.file_type === 'pdf') {
        setContent('PDFファイルのプレビューは現在サポートされていません。ダウンロードしてご確認ください。')
        setIsLoading(false)
        return
      }

      // Fetch text content
      const response = await fetch(authDoc.file_url)
      if (!response.ok) {
        throw new Error('ドキュメントの読み込みに失敗しました')
      }

      const text = await response.text()
      setContent(text)
    } catch (err: any) {
      console.error('[DocumentPreview] Error loading content:', err)
      setError(err.message || 'ドキュメントの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if ('content' in document) {
      // Guest mode: create blob and download
      const blob = new Blob([document.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.title
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Auth mode: open file_url
      const authDoc = document as Document
      window.open(authDoc.file_url, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-faro-purple flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {document.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                {document.file_type.toUpperCase()} • {document.word_count?.toLocaleString() || 0} words
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="ダウンロード"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="閉じる"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-faro-purple animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm md:prose max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
