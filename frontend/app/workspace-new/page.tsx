'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  Sparkles, Send, Mic, Camera, Image, Paperclip, Hash, AtSign,
  TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet,
  Shield, Zap, Brain, Target, Award, Bell, Search, Settings,
  ChevronRight, ChevronDown, Plus, X, Check, AlertCircle,
  ArrowUp, ArrowDown, MoreHorizontal, Share2, Bookmark,
  Heart, MessageCircle, BarChart3, PieChart as PieChartIcon,
  Layers, Grid3x3, Play, Pause, RefreshCw, Download,
  Code2, Palette, MousePointer, Move, Type, Square, Circle
} from 'lucide-react'

// Types
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  attachments?: Attachment[]
  citations?: Citation[]
  charts?: ChartData[]
  streaming?: boolean
}

interface Attachment {
  type: 'image' | 'document' | 'code'
  url: string
  name: string
}

interface Citation {
  source: string
  url: string
  relevance: number
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  data: any[]
  title: string
}

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: Date
  merchant?: string
  tags?: string[]
  location?: string
  recurring?: boolean
  sentiment?: 'positive' | 'negative' | 'neutral'
}

// Mock data generators
const generateSpendingData = () => {
  const categories = ['食費', '交通費', '娯楽', '住居費', '通信費', '医療費', 'その他']
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6b7280']

  return categories.map((cat, i) => ({
    name: cat,
    value: Math.floor(Math.random() * 50000) + 10000,
    percentage: Math.floor(Math.random() * 30) + 5,
    color: colors[i]
  }))
}

const generateTrendData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map(month => ({
    month,
    income: Math.floor(Math.random() * 100000) + 200000,
    expense: Math.floor(Math.random() * 80000) + 100000,
    savings: Math.floor(Math.random() * 50000) + 20000
  }))
}

const generateRecentTransactions = (): Transaction[] => {
  const merchants = ['Amazon', 'Uber', 'Netflix', 'Starbucks', '7-Eleven', 'Apple']
  const categories = ['Shopping', 'Transport', 'Entertainment', 'Food', 'Subscription']

  return Array.from({ length: 10 }, (_, i) => ({
    id: `tx-${i}`,
    amount: Math.floor(Math.random() * 50000) + 1000,
    type: Math.random() > 0.3 ? 'expense' : 'income',
    category: categories[Math.floor(Math.random() * categories.length)],
    description: merchants[Math.floor(Math.random() * merchants.length)],
    date: new Date(Date.now() - i * 86400000),
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
    tags: ['business', 'recurring'].slice(0, Math.floor(Math.random() * 2) + 1),
    recurring: Math.random() > 0.7,
    sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any
  }))
}

export default function WorkspaceNewPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedChart, setSelectedChart] = useState<'spending' | 'trend' | 'goals'>('spending')
  const [transactions] = useState(generateRecentTransactions())
  const [spendingData] = useState(generateSpendingData())
  const [trendData] = useState(generateTrendData())
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [selectedThread, setSelectedThread] = useState('main')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Motion values for gestures
  const x = useMotionValue(0)
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['#ef4444', '#1f2937', '#10b981']
  )

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if (e.metaKey && e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Simulate streaming response
  const simulateResponse = useCallback(async (query: string) => {
    setIsTyping(true)

    // Add AI message with streaming
    const aiMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true
    }

    setMessages(prev => [...prev, aiMessage])

    // Simulate streaming text
    const fullResponse = `Based on your spending patterns, I've identified several optimization opportunities:

📊 **Monthly Analysis**
Your total spending this month is ¥${spendingData.reduce((a, b) => a + b.value, 0).toLocaleString()}, which is 12% lower than last month.

💡 **Key Insights**
1. **Food expenses** (¥${spendingData[0].value.toLocaleString()}) can be reduced by 20% through meal planning
2. **Subscription optimization** could save you ¥8,500/month
3. **Transport costs** show irregular patterns - consider a monthly pass

📈 **Recommendations**
- Set up automated savings: ¥50,000/month
- Review recurring subscriptions
- Use cashback credit cards for online shopping

Would you like me to create a detailed savings plan?`

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

    setIsTyping(false)
  }, [spendingData])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Simulate AI response
    await simulateResponse(inputValue)
  }, [inputValue, simulateResponse])

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
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Sidebar - Thread List (ChatGPT style) */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col"
      >
        {/* New Chat Button */}
        <div className="p-3">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-black rounded-lg hover:bg-gray-100 transition-all font-medium">
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days'].map((period) => (
            <div key={period}>
              <p className="text-xs text-gray-500 px-2 py-1 mt-3">{period}</p>
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm text-gray-300 hover:text-white truncate"
                >
                  財務分析レポート {i}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold">
              {user?.email?.[0].toUpperCase() || 'G'}
            </div>
            <span className="text-sm text-gray-300 truncate">
              {user?.email || 'Guest User'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header (Perplexity style) */}
        <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <Grid3x3 className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <span className="font-semibold">Faro Pro</span>
              <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">GPT-4</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {messages.length === 0 ? (
                // Welcome Screen (ChatGPT style)
                <div className="max-w-3xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                  >
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                      Welcome to Faro Pro
                    </h1>
                    <p className="text-gray-400">Your AI-powered financial assistant</p>
                  </motion.div>

                  {/* Example Prompts */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <BarChart3 />, text: 'Analyze my spending patterns' },
                      { icon: <TrendingUp />, text: 'Create a savings plan' },
                      { icon: <Wallet />, text: 'Track my subscriptions' },
                      { icon: <Brain />, text: 'Investment recommendations' }
                    ].map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setInputValue(prompt.text)}
                        className="p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-violet-500 transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-800 rounded-lg text-violet-400 group-hover:bg-violet-500/20 transition-all">
                            {prompt.icon}
                          </div>
                          <p className="text-sm text-gray-300">{prompt.text}</p>
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
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-violet-500 to-pink-500'
                            : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                        }`}>
                          {message.role === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-violet-500/20 text-violet-100'
                              : 'bg-gray-900 text-gray-100'
                          } rounded-2xl px-5 py-3 ${message.role === 'user' ? 'text-left' : ''}`}>
                            {message.streaming ? (
                              <div className="flex items-center gap-2">
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <span className="inline-block w-1 h-4 bg-white animate-pulse" />
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-1">
                            {message.timestamp.toLocaleTimeString()}
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
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="bg-gray-900 rounded-2xl px-5 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area (ChatGPT style) */}
            <div className="border-t border-gray-800 px-6 py-4">
              <div className="max-w-3xl mx-auto">
                <div className="relative bg-gray-900 rounded-2xl border border-gray-700 focus-within:border-violet-500 transition-all">
                  <div className="flex items-end gap-2 px-4 py-3">
                    {/* Attachments */}
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-all text-gray-400 hover:text-white">
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Input */}
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask anything..."
                      className="flex-1 bg-transparent outline-none resize-none text-white placeholder-gray-500 max-h-32"
                      rows={1}
                    />

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className={`p-2 rounded-lg transition-all ${
                        inputValue.trim()
                          ? 'bg-violet-500 hover:bg-violet-600 text-white'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Input Options */}
                  <div className="flex items-center gap-2 px-4 pb-3">
                    <button className="text-xs text-gray-500 hover:text-gray-300 transition-all">
                      <Camera className="w-4 h-4" />
                    </button>
                    <button className="text-xs text-gray-500 hover:text-gray-300 transition-all">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button className="text-xs text-gray-500 hover:text-gray-300 transition-all">
                      <Code2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    <span className="text-xs text-gray-500">⌘K for commands</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Dashboard (Figma/Instagram style) */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="w-96 border-l border-gray-800 bg-gray-950 overflow-y-auto"
          >
            {/* Tab Navigation */}
            <div className="sticky top-0 bg-gray-950 border-b border-gray-800 p-4">
              <div className="flex gap-2">
                {['Dashboard', 'Analytics', 'History'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedChart(tab.toLowerCase() as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      tab === 'Dashboard'
                        ? 'bg-violet-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-4 space-y-4">
              {/* Balance Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-violet-600 to-pink-600 p-4 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Total Balance</span>
                  <TrendingUp className="w-4 h-4 text-white/80" />
                </div>
                <p className="text-3xl font-bold text-white">¥1,234,567</p>
                <p className="text-white/80 text-sm mt-1">+12.5% from last month</p>
              </motion.div>

              {/* Spending Chart */}
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="text-sm font-medium mb-4">Spending by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {spendingData.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-400">{item.name}</span>
                      <span className="text-xs text-white ml-auto">¥{(item.value / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="text-sm font-medium mb-4">6 Month Trend</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Transactions (Instagram feed style) */}
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Recent Activity</h3>
                  <button className="text-xs text-violet-400 hover:text-violet-300">View all</button>
                </div>

                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <motion.div
                      key={tx.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'income'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.type === 'income' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.category}</p>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          tx.type === 'income' ? 'text-green-400' : 'text-white'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}¥{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.date.toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Command Palette (Figma style) */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800">
                <input
                  type="text"
                  placeholder="Search commands..."
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 outline-none text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              <div className="p-2 max-h-96 overflow-y-auto">
                {[
                  { icon: <BarChart3 />, label: 'Show Analytics', shortcut: '⌘A' },
                  { icon: <Download />, label: 'Export Data', shortcut: '⌘E' },
                  { icon: <RefreshCw />, label: 'Refresh Dashboard', shortcut: '⌘R' },
                  { icon: <Settings />, label: 'Settings', shortcut: '⌘,' },
                ].map((cmd, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">{cmd.icon}</div>
                      <span className="text-white">{cmd.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{cmd.shortcut}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}