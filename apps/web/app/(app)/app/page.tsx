'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Menu, Plus, Mic, Send, Loader2, Sparkles, X, ChevronRight, ChevronDown, FileText, Wallet, Upload, TrendingUp, MessageSquare, Trash2 } from 'lucide-react'
import { NotesPanel } from '@/features/notes/components/NotesPanel'
import { ChatPanel } from '@/features/chat/components/ChatPanel'
import { useChatStore } from '@/features/chat/stores/chatStore'
import { useGuestNotesStore } from '@/features/notes/stores/guestNotesStore'
import { SourceSelector } from '@/features/documents/components/SourceSelector'
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel'
import { NotebookLMView } from '@/features/documents/components/NotebookLMView'
import { useDocumentsStore } from '@/features/documents/stores/documentsStore'
import { KakeiboPanel } from '@/features/kakeibo/components/KakeiboPanel'
import { ReportPanel } from '@/features/kakeibo/components/ReportPanel'
import { useAppStore } from '@/lib/store/useAppStore'
import { createClient } from '@supabase/supabase-js'
import { useAccessibility } from '@/hooks/useAccessibility'

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
  const { conversations, currentConversationId, createConversation, setCurrentConversation, deleteConversation } = useChatStore()
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [authToken, setAuthToken] = useState<string | null>(null)
  const { announce } = useAccessibility({ enableKeyboardShortcuts: true })

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

  // 初回会話作成
  useEffect(() => {
    if (conversations.length === 0 && viewMode === 'chat') {
      createConversation()
    }
  }, [])

  // 時刻更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 新規チャット作成
  const handleNewChat = () => {
    createConversation()
    setViewMode('chat')
    announce('新しいチャットを作成しました')
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  // 会話選択
  const handleSelectConversation = (convId: string) => {
    setCurrentConversation(convId)
    setViewMode('chat')
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  // 会話削除
  const handleDeleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('この会話を削除しますか？')) {
      deleteConversation(convId)
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
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
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
                <span>💬 チャット履歴 ({conversations.length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isChatHistoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isChatHistoryOpen && (
                <div className="space-y-1">
                  {conversations.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">まだ会話がありません</p>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`group w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                          conv.id === currentConversationId
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-2 border-purple-500 font-medium'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            conv.id === currentConversationId ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-gray-900">{conv.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(conv.updatedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </button>
                    ))
                  )}
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
