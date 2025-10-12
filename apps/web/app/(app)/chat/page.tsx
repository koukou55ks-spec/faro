'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Send, Paperclip, Camera, Mic, Code2,
  BarChart3, TrendingUp, Wallet, Brain, Plus, Settings,
  Share2, Grid3x3, Shield, LayoutGrid,
  BookOpen, Calculator, X as CloseIcon, StickyNote, Receipt
} from 'lucide-react'
// Workspace apps removed - redirect to dedicated pages

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showApps, setShowApps] = useState(false)
  const [activeApp, setActiveApp] = useState<'notes' | 'kakeibo' | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const [expertMode, setExpertMode] = useState(false)

  const callChatAPI = useCallback(async (query: string) => {
    setIsTyping(true)

    const aiMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true
    }

    setMessages(prev => [...prev, aiMessage])

    try {
      // Generate a consistent guest UUID for non-logged-in users
      const guestUserId = '00000000-0000-0000-0000-000000000000'

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          expert_mode: expertMode,
          userId: user?.id || guestUserId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API call failed')
      }

      const data = await response.json()
      console.log('API Response:', data)

      // Get response from Clean Architecture API format
      const fullResponse = data.data?.assistantMessage?.content || data.answer || data.response

      if (!fullResponse) {
        throw new Error('No response content from API')
      }

      // Simulate streaming effect
      let currentText = ''
      const words = fullResponse.split(' ')

      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + ' '
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessage.id
            ? { ...msg, content: currentText.trim(), streaming: i < words.length - 1 }
            : msg
        ))
        await new Promise(resolve => setTimeout(resolve, 30))
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessage.id
          ? { ...msg, content: 'エラーが発生しました。もう一度お試しください。', streaming: false }
          : msg
      ))
    }

    setIsTyping(false)
  }, [expertMode, user])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const query = inputValue
    setInputValue('')

    await callChatAPI(query)
  }, [inputValue, callChatAPI])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-violet-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Sidebar - Hidden on mobile by default */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed sm:relative w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-40 h-full"
          >
            <div className="p-3">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-black rounded-lg hover:bg-gray-100 transition-all font-medium">
                <Plus className="w-4 h-4" />
                新しいチャット
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {['今日', '昨日', '過去7日間'].map((period) => (
                <div key={period}>
                  <p className="text-xs text-gray-500 px-2 py-1 mt-3">{period}</p>
                  {[1, 2, 3].map((i) => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm text-gray-300 hover:text-white truncate"
                    >
                      財務分析 {i}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-800 space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm"
              >
                <Grid3x3 className="w-4 h-4" />
                <span>ダッシュボード</span>
              </button>

              <button
                onClick={() => router.push('/notes')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm"
              >
                <StickyNote className="w-4 h-4" />
                <span>ノート</span>
              </button>

              <button
                onClick={() => router.push('/kakeibo')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm"
              >
                <Receipt className="w-4 h-4" />
                <span>家計簿</span>
              </button>

              {user ? (
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 truncate">
                    {user.email}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full px-3 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg transition-all text-sm font-medium"
                >
                  ログイン
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800 px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              <Grid3x3 className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <span className="font-semibold text-base sm:text-lg">Faro</span>
              <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full hidden sm:inline">AI CFO</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Apps Toggle */}
            <button
              onClick={() => setShowApps(!showApps)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-all ${
                showApps
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">アプリ</span>
            </button>

            {/* Expert Mode Toggle */}
            <button
              onClick={() => setExpertMode(!expertMode)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-all ${
                expertMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">
                {expertMode ? '法律順守' : 'Expert'}
              </span>
            </button>

            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all hidden sm:block">
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="w-16 h-16 text-violet-500" />
                </motion.div>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Faro
                </h1>
                <p className="text-xl text-gray-400 mb-2">あなたのパーソナルCFO AI</p>
                <p className="text-sm text-gray-500">知識格差を是正し、誰もが富裕層の知恵にアクセスできる世界へ</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: <BarChart3 />, text: '支出パターンを分析', color: 'from-blue-500 to-cyan-500' },
                  { icon: <TrendingUp />, text: '貯蓄プランを作成', color: 'from-green-500 to-emerald-500' },
                  { icon: <Wallet />, text: 'サブスク管理', color: 'from-purple-500 to-pink-500' },
                  { icon: <Brain />, text: '投資戦略の提案', color: 'from-orange-500 to-red-500' }
                ].map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setInputValue(prompt.text)}
                    className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 hover:border-violet-500/50 transition-all text-left group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${prompt.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative flex items-start gap-3">
                      <div className="p-3 bg-gray-800 rounded-xl text-violet-400 group-hover:scale-110 transition-transform">
                        {prompt.icon}
                      </div>
                      <p className="text-sm text-gray-300 pt-2">{prompt.text}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-violet-500 to-pink-500'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-sm font-bold">U</span>
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </div>

                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block max-w-[85%] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-violet-100 border border-violet-500/30'
                          : 'bg-gray-900 text-gray-100 border border-gray-800'
                      } rounded-2xl px-5 py-3 ${message.role === 'user' ? 'text-left' : ''}`}>
                        {message.streaming ? (
                          <div className="flex items-center gap-2">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="inline-block w-0.5 h-4 bg-white"
                            />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-1">
                        {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          className="w-2 h-2 bg-gray-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 px-3 sm:px-6 py-3 sm:py-4 bg-gray-950/50 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gray-900/80 rounded-2xl border border-gray-700 focus-within:border-violet-500/50 focus-within:shadow-lg focus-within:shadow-violet-500/20 transition-all">
              <div className="flex items-end gap-2 px-3 sm:px-4 py-2 sm:py-3">
                <button className="p-2 hover:bg-gray-800 rounded-lg transition-all text-gray-400 hover:text-white">
                  <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Faroに聞いてみる..."
                  className="flex-1 bg-transparent outline-none resize-none text-white placeholder-gray-500 max-h-32"
                  rows={1}
                />

                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`p-2.5 rounded-xl transition-all ${
                    inputValue.trim()
                      ? 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-lg shadow-violet-500/50'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 pb-2 sm:pb-3 text-gray-500">
                <button className="hover:text-gray-300 transition-all p-1">
                  <Camera className="w-4 h-4" />
                </button>
                <button className="hover:text-gray-300 transition-all p-1">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="hover:text-gray-300 transition-all p-1 hidden sm:block">
                  <Code2 className="w-4 h-4" />
                </button>
                <div className="flex-1" />
                <span className="text-xs hidden sm:inline">⌘ + K</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 mt-3">
              Faroは税務・金融の専門知識を提供しますが、最終判断は専門家にご相談ください
            </p>
          </div>
        </div>
      </div>

      {/* Apps Panel - Slide in from right */}
      <AnimatePresence>
        {showApps && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[600px] lg:w-[800px] bg-gray-950 border-l border-gray-800 z-50 flex flex-col"
          >
            {/* Apps Header */}
            <div className="border-b border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold">アプリ</h2>
              </div>
              <button
                onClick={() => setShowApps(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-all"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* App Selector */}
            {!activeApp ? (
              <div className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/notes')}
                    className="p-8 bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-2xl text-left hover:border-violet-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 bg-violet-500 rounded-xl group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">ノート</h3>
                    <p className="text-gray-400 text-sm">
                      メモ・ドキュメント管理。Faroが内容を理解してパーソナライズされた提案を行います。
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/kakeibo')}
                    className="p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl text-left hover:border-green-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 bg-green-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Calculator className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">AI家計簿</h3>
                    <p className="text-gray-400 text-sm">
                      AIが自動でカテゴリ分類。支出パターンを分析し、最適な節約方法を提案します。
                    </p>
                  </motion.button>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-violet-400 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">よく使う機能</h4>
                      <p className="text-sm text-gray-400">
                        ノートと家計簿はサイドバーから素早くアクセスできます。
                        その他の追加機能は今後このアプリパネルに追加されます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
