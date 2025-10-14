'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Menu, Plus, Mic, Send, Loader2, Sparkles, X, ChevronRight, ChevronDown, FileText, Wallet, Upload, TrendingUp } from 'lucide-react'
import { NotesPanel } from '@/src/features/notes/components/NotesPanel'
import { ChatPanel } from '@/src/features/chat/components/ChatPanel'
import { useGuestNotesStore } from '@/src/features/notes/stores/guestNotesStore'
import { SourceSelector } from '@/src/features/documents/components/SourceSelector'
import { DocumentsPanel } from '@/src/features/documents/components/DocumentsPanel'
import { NotebookLMView } from '@/src/features/documents/components/NotebookLMView'
import { useDocumentsStore } from '@/src/features/documents/stores/documentsStore'
import { KakeiboPanel } from '@/src/features/kakeibo/components/KakeiboPanel'
import { ReportPanel } from '@/src/features/kakeibo/components/ReportPanel'
import { useAppStore } from '@/lib/store/useAppStore'
import { createClient } from '@supabase/supabase-js'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  expertMode?: boolean
}

export default function FaroMainPage() {
  const { user, loading } = useAuth()
  const { notes: guestNotes } = useGuestNotesStore()
  const { fetchDocuments, fetchCollections } = useDocumentsStore()
  const { viewMode, isSidebarOpen, setViewMode, setSidebarOpen, toggleSidebar } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [expertMode, setExpertMode] = useState(false)
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sourceSelection, setSourceSelection] = useState<{
    documents: string[]
    collections: string[]
    includeNotes: boolean
    includeMessages: boolean
  }>({
    documents: [],
    collections: [],
    includeNotes: true,
    includeMessages: true,
  })
  const [authToken, setAuthToken] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isGuest = !user

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Get auth token for API calls
  useEffect(() => {
    if (user) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          setAuthToken(session.access_token)
          // Fetch documents and collections
          fetchDocuments(session.access_token)
          fetchCollections(session.access_token)
        }
      })
    }
  }, [user])

  // 初回挨拶 (MVP: user check removed for guest access)
  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: Message = {
        role: 'assistant',
        content: `こんにちは！\n\n私はFaro、あなたのパーソナルCFOです。\n\nお金のこと、何でも相談してください。`,
        timestamp: new Date()
      }
      setMessages([greetingMessage])
    }
  }, [])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 時刻更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const requestBody: any = {
        message: inputMessage,
        userId: user?.id,
        appContext: 'main', // メイン画面
        sourceSelection: sourceSelection, // Add source selection
        expertMode: expertMode
      }

      // Add guest notes to request if user is guest
      if (isGuest && guestNotes.length > 0) {
        console.log('[App Page] Adding', guestNotes.length, 'guest notes to request');
        requestBody.guestNotes = guestNotes
      }

      console.log('[App Page] Sending request with source selection:', requestBody);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        expertMode: expertMode
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // MVP: Allow guest access (skip auth check)
  // if (!user) {
  //   router.push('/auth/login')
  //   return null
  // }

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* サイドバー */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } bg-gray-50 border-r border-gray-200 flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* サイドバーヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-faro-purple to-faro-purple-light flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">Faro</h1>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 新規チャット */}
          <div className="p-4">
            <button
              onClick={() => {
                setMessages([])
                setViewMode('chat')
                if (window.innerWidth < 768) {
                  setSidebarOpen(false)
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all bg-faro-purple hover:bg-faro-purple-dark text-white"
            >
              <Plus className="w-5 h-5" />
              新規チャット
            </button>
          </div>

          {/* チャット履歴 */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="mb-6">
              <button
                onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
                className="w-full flex items-center justify-between text-sm font-semibold mb-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>チャット履歴</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isChatHistoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isChatHistoryOpen && (
                <div className="space-y-2">
                  {[
                    '投資について相談',
                    '確定申告の準備',
                    '家計簿の分析',
                  ].map((title, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-200 text-gray-700"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ノート */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setViewMode('notebook')
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false)
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  viewMode === 'notebook' ? 'bg-faro-purple text-white' : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                ノート
              </button>
            </div>

            {/* 家計簿 */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setViewMode('kakeibo')
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false)
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  viewMode === 'kakeibo' ? 'bg-faro-purple text-white' : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Wallet className="w-4 h-4" />
                家計簿
              </button>
            </div>

            {/* レポート */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setViewMode('report')
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false)
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  viewMode === 'report' ? 'bg-faro-purple text-white' : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                レポート
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* サイドバーオーバーレイ (モバイルのみ) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSidebar()}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-faro-purple to-faro-purple-light flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                {viewMode === 'chat' ? 'Faro' :
                 viewMode === 'notes' ? 'ノート' :
                 viewMode === 'documents' ? 'ドキュメント' :
                 viewMode === 'notebook' ? 'Notebook' :
                 viewMode === 'kakeibo' ? '家計簿' :
                 viewMode === 'report' ? 'レポート' :
                 'Faro'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'chat' && (
              <div className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100">
                {formatTime(currentTime)}
              </div>
            )}
          </div>
        </header>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-hidden">
        {viewMode === 'chat' ? (
          <div className="h-full animate-fadeIn">
            <ChatPanel userId={user?.id} />
          </div>
        ) : viewMode === 'notes' ? (
          <div className="h-full animate-fadeIn">
            <NotesPanel userId={user?.id || 'guest'} />
          </div>
        ) : viewMode === 'documents' ? (
          <div className="h-full animate-fadeIn">
            <DocumentsPanel authToken={authToken || undefined} />
          </div>
        ) : viewMode === 'notebook' ? (
          <div className="h-full animate-fadeIn">
            <NotebookLMView authToken={authToken || undefined} isGuest={isGuest} />
          </div>
        ) : viewMode === 'kakeibo' ? (
          <div className="h-full animate-fadeIn">
            <KakeiboPanel userId={user?.id} />
          </div>
        ) : viewMode === 'report' ? (
          <div className="h-full animate-fadeIn">
            <ReportPanel userId={user?.id} />
          </div>
        ) : null}
        </div>
      </main>
    </div>
  )
}
