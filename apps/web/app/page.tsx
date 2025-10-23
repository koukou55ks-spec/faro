'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/hooks/useAuth'
import { useSubscription } from '../lib/hooks/useSubscription'
import {
  MessageSquare, Search, User as UserIcon, Users,
  Menu, Plus, Moon, Sun, X, ChevronDown, Trash2
} from 'lucide-react'
import { ChatPanel } from '../src/features/chat/components/ChatPanel'
import { NotesPanel } from '../src/features/notes/components/NotesPanel'
import { useChatStore } from '../src/features/chat/stores/chatStore'
import { useGuestNotesStore } from '../src/features/notes/stores/guestNotesStore'
import { useAppStore } from '../lib/store/useAppStore'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { UsageIndicator } from '../src/features/subscription/components/UsageIndicator'
import dynamic from 'next/dynamic'

// Import pages with dynamic loading for better performance
const SearchPage = dynamic(() => import('./search/page').then(mod => mod.default), { ssr: false })
const MyPage = dynamic(() => import('./mypage/page').then(mod => mod.default), { ssr: false })
const ConnectPage = dynamic(() => import('./connect/page').then(mod => mod.default), { ssr: false })

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  id: 'home' | 'search' | 'mypage' | 'connect'
  badge?: number
}

const navItems: NavItem[] = [
  { icon: MessageSquare, label: 'ホーム', id: 'home' },
  { icon: Search, label: 'ライブラリ', id: 'search' },
  { icon: UserIcon, label: 'マイページ', id: 'mypage' },
  { icon: Users, label: 'エキスパート', id: 'connect' }
]

export default function MainApp() {
  const { user, loading } = useAuth()
  const { subscription, isPro, isFree } = useSubscription()
  const { notes: guestNotes } = useGuestNotesStore()
  const { viewMode, setViewMode } = useAppStore()
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation
  } = useChatStore()

  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'mypage' | 'connect'>('home')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClient, setIsClient] = useState(false)

  const isGuest = !user
  const currentPlan = subscription?.plan || 'free'

  // Client-side mounting
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Theme management
  useEffect(() => {
    if (!isClient) return
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDarkMode(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [isClient])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Responsive check
  useEffect(() => {
    if (!isClient) return

    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient])

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
        }
      })
    }
  }, [user])

  const handleNewConversation = () => {
    const newConversationId = createConversation()
    setCurrentConversation(newConversationId)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Desktop Sidebar with Chat History */}
            {!isMobile && (
              <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handleNewConversation}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>新しいチャット</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      チャット履歴
                    </h3>
                    <button
                      onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isChatHistoryOpen ? '' : '-rotate-90'}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isChatHistoryOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-1"
                      >
                        {conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className={`group relative rounded-lg transition-all ${
                              currentConversationId === conv.id
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <button
                              onClick={() => setCurrentConversation(conv.id)}
                              className="w-full text-left py-2.5 px-3"
                            >
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
                                    {conv.title}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(conv.updatedAt).toLocaleDateString('ja-JP')}
                                  </span>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => deleteConversation(conv.id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Info */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {isGuest ? 'ゲスト' : user?.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentPlan === 'pro' ? 'Pro' : 'Free'}プラン
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isMobile && (
                      <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                    )}
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        ZeiGuide AI
                      </h1>
                      <p className="text-xs text-gray-500">
                        {currentTime.toLocaleTimeString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsageIndicator />
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Panel */}
              <div className="flex-1 overflow-hidden">
                <ChatPanel
                  userId={user?.id || 'guest'}
                />
              </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobile && (
              <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black z-40"
                      onClick={() => setIsSidebarOpen(false)}
                    />
                    <motion.div
                      initial={{ x: -300 }}
                      animate={{ x: 0 }}
                      exit={{ x: -300 }}
                      className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-semibold text-gray-900 dark:text-white">チャット履歴</h2>
                          <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            handleNewConversation()
                            setIsSidebarOpen(false)
                          }}
                          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          新しいチャット
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        {conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => {
                              setCurrentConversation(conv.id)
                              setIsSidebarOpen(false)
                            }}
                            className={`w-full text-left py-2 px-3 rounded-lg transition-colors mb-2 ${
                              currentConversationId === conv.id
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="text-sm font-medium truncate">{conv.title}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(conv.updatedAt).toLocaleDateString('ja-JP')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            )}
          </div>
        )

      case 'search':
        return <SearchPage />

      case 'mypage':
        return (
          <div className="flex flex-col lg:flex-row h-full">
            <div className="flex-1">
              <MyPage />
            </div>
            {/* ノート機能をデスクトップで表示 */}
            {!isMobile && viewMode === 'notes' && (
              <div className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ノート</h2>
                    <button
                      onClick={() => setViewMode('mypage')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <NotesPanel userId={user?.id || 'guest'} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'connect':
        return <ConnectPage />

      default:
        return null
    }
  }

  // Prevent hydration mismatch by not rendering until client is ready
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-30 safe-bottom">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center justify-center flex-1 py-2 px-1 relative"
                >
                  <div className="relative">
                    <Icon
                      className={`w-6 h-6 transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Desktop Tab Navigation */}
      {!isMobile && (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex justify-center space-x-8 px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}