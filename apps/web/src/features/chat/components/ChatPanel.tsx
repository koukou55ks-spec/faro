'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import { marked } from 'marked'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  expertMode?: boolean
}

interface ChatPanelProps {
  userId?: string
}

export function ChatPanel({ userId }: ChatPanelProps) {
  const { messages, addMessage, clearMessages, isLoading, setLoading } = useChatStore()
  const [input, setInput] = useState('')
  const [expertMode, setExpertMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      // Use Clean Architecture API
      const response = await fetch('/api/v2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'default', // TODO: Get from context
          userId: userId || 'anonymous',
          message: input,
        }),
      })

      if (!response.ok) throw new Error('API request failed')

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.data.assistantMessage.content,
        timestamp: new Date().toISOString(),
        expertMode: expertMode
      }

      addMessage(assistantMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
        timestamp: new Date().toISOString()
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    if (confirm('チャット履歴を削除しますか？')) {
      clearMessages()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">💬 パーソナルCFO</h2>
          <button
            onClick={handleClearChat}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
          >
            🗑️ 履歴削除
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-2xl font-semibold mb-2">Faroへようこそ</h3>
            <p className="text-muted-foreground">
              あなたのパーソナルCFOとして、税務・財務の最適化をサポートします。
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="text-4xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                💼
              </div>
            )}
            <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`px-5 py-3 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
                />
                {msg.expertMode && (
                  <span className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold">
                    ⚖️ エキスパートモード
                  </span>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="text-4xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                👤
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 mb-6">
            <div className="text-4xl w-12 h-12 flex items-center justify-center flex-shrink-0">
              💼
            </div>
            <div className="flex-1">
              <div className="bg-secondary px-5 py-3 rounded-xl inline-flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2 mb-3 text-sm">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={expertMode}
              onChange={(e) => setExpertMode(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span>⚖️ エキスパートモード</span>
          </label>
          <span className="text-xs text-muted-foreground">（法的根拠・リスク評価含む）</span>
        </div>

        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="税務・財務について質問してください..."
            rows={3}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-border rounded-xl bg-secondary resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  )
}
