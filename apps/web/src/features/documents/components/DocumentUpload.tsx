'use client'

import { useState, useRef, DragEvent } from 'react'
import { useDocumentsStore } from '../stores/documentsStore'
import { useGuestDocumentsStore } from '../stores/guestDocumentsStore'
import { Upload, X, File as FileIcon, Loader2, CheckCircle, AlertCircle, FileText, FileEdit } from 'lucide-react'

interface DocumentUploadProps {
  collectionId?: string
  authToken?: string
  onComplete?: () => void
}

type UploadMode = 'file' | 'text'

export function DocumentUpload({ collectionId, authToken, onComplete }: DocumentUploadProps) {
  const { uploadDocument, error, setError } = useDocumentsStore()
  const { addDocument: addGuestDocument } = useGuestDocumentsStore()
  const [uploadMode, setUploadMode] = useState<UploadMode>('file')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    name: string
    status: 'uploading' | 'success' | 'error'
    error?: string
  }>>([])
  const [textContent, setTextContent] = useState('')
  const [textTitle, setTextTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    if (!authToken) {
      setError('ログインが必要です')
      return
    }

    // Filter valid file types
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv']
      const validExtensions = ['.pdf', '.txt', '.md', '.csv', '.docx']
      return validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    })

    if (validFiles.length === 0) {
      setError('サポートされていないファイル形式です。PDF, TXT, MD, CSV のみ対応しています。')
      return
    }

    // Initialize upload status
    const initialStatus = validFiles.map(file => ({
      name: file.name,
      status: 'uploading' as const,
    }))
    setUploadingFiles(initialStatus)

    // Upload files sequentially
    for (let i = 0; i < validFiles.length; i++) {
      try {
        await uploadDocument(validFiles[i], authToken, collectionId)
        setUploadingFiles(prev =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'success' } : item
          )
        )
      } catch (error: any) {
        setUploadingFiles(prev =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', error: error.message } : item
          )
        )
      }
    }

    // Clear after 3 seconds
    setTimeout(() => {
      setUploadingFiles([])
      onComplete?.()
    }, 3000)
  }

  const handleTextUpload = async () => {
    if (!textContent.trim()) {
      setError('テキストを入力してください')
      return
    }

    if (!textTitle.trim()) {
      setError('タイトルを入力してください')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      if (!authToken) {
        // Guest mode: save to localStorage
        console.log('[DocumentUpload] Guest mode: saving to localStorage')
        addGuestDocument(textTitle, textContent)

        // Clear form
        setTextContent('')
        setTextTitle('')

        // Show success message
        setUploadingFiles([{
          name: textTitle,
          status: 'success'
        }])

        setTimeout(() => {
          setUploadingFiles([])
          onComplete?.()
        }, 2000)
      } else {
        // Authenticated mode: upload to Supabase
        const blob = new Blob([textContent], { type: 'text/plain' })
        const file = new File([blob], `${textTitle}.txt`, { type: 'text/plain' })

        await uploadDocument(file, authToken, collectionId)

        // Clear form
        setTextContent('')
        setTextTitle('')

        // Show success message
        setUploadingFiles([{
          name: textTitle,
          status: 'success'
        }])

        setTimeout(() => {
          setUploadingFiles([])
          onComplete?.()
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-1 md:gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setUploadMode('file')}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-sm md:text-base font-medium transition-colors relative whitespace-nowrap ${
            uploadMode === 'file'
              ? 'text-faro-purple'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">ファイルアップロード</span>
          <span className="sm:hidden">ファイル</span>
          {uploadMode === 'file' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-faro-purple" />
          )}
        </button>
        <button
          onClick={() => setUploadMode('text')}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-sm md:text-base font-medium transition-colors relative whitespace-nowrap ${
            uploadMode === 'text'
              ? 'text-faro-purple'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">テキストを貼り付け</span>
          <span className="sm:hidden">テキスト</span>
          {uploadMode === 'text' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-faro-purple" />
          )}
        </button>
      </div>

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg md:rounded-xl p-6 md:p-8 transition-all cursor-pointer ${
          isDragging
            ? 'border-faro-purple bg-purple-50 scale-[1.02]'
            : 'border-gray-300 hover:border-faro-purple hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.csv,.docx"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={`w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 transition-colors ${isDragging ? 'text-faro-purple' : 'text-gray-400'}`} />
          <p className="text-base md:text-lg font-semibold text-gray-900 mb-1">
            {isDragging ? 'ここにドロップ' : 'ファイルをアップロード'}
          </p>
          <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
            クリックして選択、またはドラッグ&ドロップ
          </p>
          <p className="text-[10px] md:text-xs text-gray-400">
            PDF, TXT, Markdown, CSV（最大50MB）
          </p>
        </div>
      </div>
      )}

      {/* Text Paste Mode */}
      {uploadMode === 'text' && (
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              タイトル
            </label>
            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="例：2024年度予算案"
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:border-faro-purple focus:ring-2 focus:ring-faro-purple/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              テキスト内容
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="テキストをここに貼り付けてください..."
              rows={10}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-faro-purple focus:ring-2 focus:ring-faro-purple/20 outline-none transition-all resize-none font-mono"
            />
            <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2">
              {textContent.length.toLocaleString()} 文字
            </p>
          </div>

          <button
            onClick={handleTextUpload}
            disabled={isUploading || !textContent.trim() || !textTitle.trim()}
            className="w-full bg-faro-purple hover:bg-faro-purple-dark text-white font-semibold py-2.5 md:py-3 text-sm md:text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                アップロード中...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                ドキュメントを作成
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-gray-50 border border-gray-200"
            >
              <FileIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                {file.status === 'uploading' && (
                  <div className="w-full h-1 bg-gray-200 rounded-full mt-1.5 md:mt-2">
                    <div
                      className="h-full bg-faro-purple rounded-full transition-all duration-300 animate-pulse"
                      style={{ width: '60%' }}
                    />
                  </div>
                )}
                {file.error && (
                  <p className="text-[10px] md:text-xs text-red-500 mt-1">{file.error}</p>
                )}
              </div>
              {file.status === 'uploading' && <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-faro-purple animate-spin flex-shrink-0" />}
              {file.status === 'success' && <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />}
              {file.status === 'error' && <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs md:text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
