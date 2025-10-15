'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/hooks/useAuth'
import {
  Menu, Plus, Sparkles, X, ChevronRight, ChevronDown,
  FileText, Wallet, TrendingUp, MessageSquare, Trash2,
  Moon, Sun, Search, Bell, Settings, LogOut, User,
  Home, BookOpen, PieChart, HelpCircle, Command
} from 'lucide-react'
import { NotesPanel } from '../src/features/notes/components/NotesPanel'
import { ChatPanel } from '../src/features/chat/components/ChatPanel'
import { useChatStore } from '../src/features/chat/stores/chatStore'
import { useGuestNotesStore } from '../src/features/notes/stores/guestNotesStore'
import { NotebookLMView } from '../src/features/documents/components/NotebookLMView'
import { useDocumentsStore } from '../src/features/documents/stores/documentsStore'
import { KakeiboPanel } from '../src/features/kakeibo/components/KakeiboPanel'
import { ReportPanel } from '../src/features/kakeibo/components/ReportPanel'
import { useAppStore } from '../lib/store/useAppStore'
import { createClient } from '@supabase/supabase-js'
import { useAccessibility } from '../hooks/useAccessibility'

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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { announce } = useAccessibility({ enableKeyboardShortcuts: true })

  const isGuest = !user

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDarkMode(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

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
          fetchDocuments(session.access_token)
          fetchCollections(session.access_token)
        }
      })
    }
  }, [user, fetchDocuments, fetchCollections])

  // Initial conversation creation
  useEffect(() => {
    if (conversations.length === 0 && viewMode === 'chat') {
      createConversation()
    }
  }, [conversations.length, viewMode, createConversation])

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleNewChat = () => {
    createConversation()
    setViewMode('chat')
    announce('新しいチャットを作成しました')
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleSelectConversation = (convId: string) => {
    setCurrentConversation(convId)
    setViewMode('chat')
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

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

  const menuItems = [
    { id: 'chat', label: 'チャット', icon: MessageSquare, shortcut: '⌘K' },
    { id: 'notebook', label: 'ノートブック', icon: BookOpen, shortcut: '⌘N' },
    { id: 'kakeibo', label: '家計簿', icon: Wallet, shortcut: '⌘B' },
    { id: 'report', label: 'レポート', icon: PieChart, shortcut: '⌘R' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-white animate-spin-slow" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 blur-2xl opacity-50 animate-pulse-slow"></div>
          </div>
          <div className="flex space-x-1">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${!isSidebarOpen && 'lg:justify-center'}`}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                {(isSidebarOpen || window.innerWidth < 1024) && (
                  <div className="animate-fade-in">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Faro
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your AI Assistant</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all lg:hidden"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {(isSidebarOpen || window.innerWidth < 1024) && (
            <div className="p-4 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* New Chat Button */}
          <div className={`px-4 ${!isSidebarOpen && window.innerWidth >= 1024 ? 'lg:px-2' : ''}`}>
            <button
              onClick={handleNewChat}
              className={`w-full flex items-center ${!isSidebarOpen && window.innerWidth >= 1024 ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group`}
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              {(isSidebarOpen || window.innerWidth < 1024) && <span className="animate-fade-in">新規チャット</span>}
            </button>
          </div>

          {/* Chat History - Directly under New Chat Button */}
          {viewMode === 'chat' && (isSidebarOpen || window.innerWidth < 1024) && (
            <div className="px-4 pt-3 pb-2 animate-fade-in">
              <button
                onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>履歴 ({conversations.length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isChatHistoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isChatHistoryOpen && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto animate-slide-in-bottom">
                  {conversations.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">まだ会話がありません</p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          conv.id === currentConversationId
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-500'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            conv.id === currentConversationId ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'
                          }`} />
                          <button
                            onClick={() => handleSelectConversation(conv.id)}
                            className="flex-1 min-w-0 text-left"
                          >
                            <p className="truncate text-gray-900 dark:text-gray-100">{conv.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {new Date(conv.updatedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                            </p>
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all duration-200 flex-shrink-0"
                            aria-label="会話を削除"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = viewMode === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setViewMode(item.id as any)
                    if (window.innerWidth < 1024) setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center ${!isSidebarOpen && window.innerWidth >= 1024 ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`flex items-center ${!isSidebarOpen && window.innerWidth >= 1024 ? '' : 'gap-3'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'} group-hover:scale-110 transition-transform`} />
                    {(isSidebarOpen || window.innerWidth < 1024) && (
                      <span className="animate-fade-in">{item.label}</span>
                    )}
                  </div>
                  {(isSidebarOpen || window.innerWidth < 1024) && item.shortcut && (
                    <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded animate-fade-in">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            {(isSidebarOpen || window.innerWidth < 1024) ? (
              <div className="space-y-2 animate-fade-in">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">設定</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">ヘルプ</span>
                </button>
                {user && (
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm">
                    <LogOut className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">ログアウト</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleSidebar()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {viewMode === 'chat' ? 'AI チャット' :
                   viewMode === 'notebook' ? 'ノートブック' :
                   viewMode === 'kakeibo' ? '家計簿' :
                   viewMode === 'report' ? 'レポート' :
                   'Faro'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isGuest ? 'ゲストモード' : user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Command Palette Trigger */}
              <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                <Command className="w-4 h-4" />
                <span>⌘K</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-all duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 group-hover:rotate-12 transition-all duration-300" />
                )}
              </button>

              {/* Profile */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                {window.innerWidth >= 1280 && (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area with Animation */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="h-full animate-fade-in">
            {viewMode === 'chat' ? (
              <div className="h-full">
                <ChatPanel userId={user?.id} />
              </div>
            ) : viewMode === 'notebook' ? (
              <div className="h-full">
                <NotebookLMView authToken={authToken || undefined} isGuest={isGuest} />
              </div>
            ) : viewMode === 'kakeibo' ? (
              <div className="h-full">
                <KakeiboPanel userId={user?.id} />
              </div>
            ) : viewMode === 'report' ? (
              <div className="h-full">
                <ReportPanel userId={user?.id} />
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}