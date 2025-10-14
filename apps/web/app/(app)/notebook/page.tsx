'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Plus, Send, Loader2, X, ChevronLeft, ChevronRight,
  FileText, Upload, Sparkles, File, Link as LinkIcon,
  MoreVertical, Trash2, Download, Eye
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useDocumentsStore } from '@/src/features/documents/stores/documentsStore'
import { useGuestDocumentsStore } from '@/src/features/documents/stores/guestDocumentsStore'
import { useNotesStore } from '@/src/features/notes/stores/notesStore'
import { useGuestNotesStore } from '@/src/features/notes/stores/guestNotesStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

type PanelState = 'sources' | 'chat' | 'notes'

export default function NotebookPage() {
  const { user } = useAuth()
  const isGuest = !user

  // Store hooks
  const { documents, collections, fetchDocuments, fetchCollections } = useDocumentsStore()
  const { documents: guestDocuments } = useGuestDocumentsStore()
  const { notes } = useNotesStore()
  const { notes: guestNotes } = useGuestNotesStore()

  // State
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get auth token
  useEffect(() => {
    if (user) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          setAuthToken(session.access_token)
          fetchDocuments(session.access_token)
          fetchCollections(session.access_token)
        }
      })
    }
  }, [user, fetchDocuments, fetchCollections])

  // Initial greeting
  useEffect(() => {
    const greetingMessage: Message = {
      role: 'assistant',
      content: 'こんにちは！ソースを追加して、質問してください。',
      timestamp: new Date()
    }
    setMessages([greetingMessage])
  }, [])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const allDocuments = isGuest ? guestDocuments : documents
  const allNotes = isGuest ? guestNotes : notes

  const toggleSource = (id: string) => {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      sources: selectedSources
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          userId: user?.id,
          appContext: 'notebook',
          sourceSelection: {
            documents: selectedSources.filter(id => allDocuments.some(d => d.id === id)),
            collections: [],
            includeNotes: selectedSources.some(id => allNotes.some(n => n.id === id)),
            includeMessages: false
          }
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '申し訳ありません。エラーが発生しました。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // TODO: Implement file upload
    console.log('Uploading files:', files)
    setIsUploadModalOpen(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel - Sources */}
      <div
        className={`border-r border-gray-200 transition-all duration-300 flex flex-col ${
          leftPanelOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">ソース</h2>
          <button
            onClick={() => setLeftPanelOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            ソースを追加
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Documents */}
          {allDocuments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">ドキュメント</h3>
              <div className="space-y-2">
                {allDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleSource(doc.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedSources.includes(doc.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className={`w-5 h-5 flex-shrink-0 ${
                        selectedSources.includes(doc.id) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {allNotes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">ノート</h3>
              <div className="space-y-2">
                {allNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => toggleSource(note.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedSources.includes(note.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <File className={`w-5 h-5 flex-shrink-0 ${
                        selectedSources.includes(note.id) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{note.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {note.content.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {allDocuments.length === 0 && allNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-1">ソースがありません</p>
              <p className="text-xs text-gray-400">ドキュメントやノートを追加してください</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Left Panel Button */}
      {!leftPanelOpen && (
        <button
          onClick={() => setLeftPanelOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      )}

      {/* Center Panel - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold">Faro Notebook</h1>
            </div>
            {selectedSources.length > 0 && (
              <div className="text-sm text-gray-500">
                {selectedSources.length}個のソースを選択中
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">NotebookLMへようこそ</h2>
              <p className="text-sm text-gray-500 text-center max-w-md">
                左側のパネルからソースを選択し、AIに質問してください
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <LinkIcon className="w-3 h-3" />
                        <span>{message.sources.length}個のソースを参照</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-gray-100">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-600">考えています...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 rounded-xl border-2 border-gray-200 focus-within:border-blue-500 p-2 bg-white transition-colors">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="質問してください..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 text-sm"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                  inputMessage.trim()
                    ? 'bg-gray-900 hover:bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Notes/Studio */}
      <div
        className={`border-l border-gray-200 transition-all duration-300 flex flex-col ${
          rightPanelOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">ノート</h2>
          <button
            onClick={() => setRightPanelOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">ノート機能</p>
            <p className="text-xs text-gray-400">近日公開予定</p>
          </div>
        </div>
      </div>

      {/* Toggle Right Panel Button */}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-200 rounded-l-lg shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">ソースを追加</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-700 mb-2">
                  ファイルをドラッグ&ドロップ
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  または
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  ファイルを選択
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.txt,.md,.doc,.docx"
                />
                <p className="text-xs text-gray-400 mt-4">
                  PDF, TXT, MD, DOC, DOCX (最大10MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
