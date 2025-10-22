'use client'

import { useState, useEffect } from 'react'
import { Send, Sparkles, TrendingUp, Clock, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNavigation } from '../src/components/BottomNavigation'

// 税金質問のサンプル
const sampleQuestions = [
  '副業の確定申告は必要？',
  'これって経費になる？',
  '医療費控除の計算方法',
  'ふるさと納税の限度額',
]

// クイックアクション
const quickActions = [
  { icon: '📸', label: '領収書撮影', action: 'camera' },
  { icon: '🧮', label: '税金計算', action: 'calculator' },
  { icon: '📊', label: '節税診断', action: 'diagnosis' },
  { icon: '📚', label: '知識検索', action: 'search' },
]

export default function HomePage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    {
      role: 'assistant',
      content: 'こんにちは！ZeiGuideです。税金の疑問をなんでもお聞きください。確定申告、経費判定、節税アドバイスなど、AIがすぐにお答えします。'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId: 'guest'
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.answer
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'すみません、エラーが発生しました。もう一度お試しください。'
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ZeiGuide
            </h1>
            <p className="text-xs text-gray-500">AI税務アシスタント</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                オンライン
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ height: 'calc(100vh - 200px)' }}>
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              } rounded-2xl px-4 py-3 shadow-sm`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center space-x-1 mb-1">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">ZeiGuide</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <button
              key={action.action}
              className="flex-shrink-0 flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-1">{action.icon}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sample Questions */}
      <div className="px-4 pb-2">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {sampleQuestions.map((question) => (
            <button
              key={question}
              onClick={() => setMessage(question)}
              className="flex-shrink-0 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="税金の質問を入力..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 bg-blue-500 text-white rounded-full disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}