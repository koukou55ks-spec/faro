'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { MessageSquare, Sparkles, LayoutGrid, Send, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function FaroMainPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          userId: user?.id,
          appContext: 'main' // メイン画面
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
    <div className="flex flex-col h-screen bg-[#0F0F0F]">
      {/* Header - Minimal & Modern */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[#0F0F0F]/80 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Faro</h1>
            <p className="text-xs text-gray-500">Personal CFO</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/workspace-new')}
          className="text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Workspace
        </Button>
      </header>

      {/* Messages Area - Clean & Spacious */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1A1A1A] text-gray-100 border border-gray-800'
                }`}
              >
                <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
                <div
                  className={`text-[11px] mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-600'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center ml-3 flex-shrink-0">
                  <span className="text-sm text-gray-400">👤</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#1A1A1A] rounded-2xl px-5 py-4 border border-gray-800">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Floating & Modern */}
      <div className="border-t border-gray-800 px-4 py-6 bg-[#0F0F0F]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-3 bg-[#1A1A1A] rounded-2xl border border-gray-800 p-2 focus-within:border-blue-500 transition-all">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message Faro..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 focus:outline-none resize-none text-[15px]"
              rows={1}
              disabled={isLoading}
              style={{
                minHeight: '44px',
                maxHeight: '200px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 h-11 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
