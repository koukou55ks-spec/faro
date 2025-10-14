'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useGuestNotesStore } from '../../notes/stores/guestNotesStore'
import { MarkdownRenderer } from './MarkdownRenderer'

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
  const { notes: guestNotes } = useGuestNotesStore()
  const [input, setInput] = useState('')
  const [expertMode, setExpertMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isGuest = !userId || userId === 'guest' || userId === 'anonymous'

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
    const userInput = input
    setInput('')
    setLoading(true)

    try {
      // Use Chat API with streaming
      const requestBody: any = {
        message: userInput,
        userId: userId || 'anonymous',
        expertMode: expertMode,
        stream: true, // Enable streaming
        sourceSelection: {
          documents: [],
          collections: [],
          includeNotes: true,
          includeMessages: true
        }
      }

      // Add guest notes to request if user is guest
      if (isGuest && guestNotes.length > 0) {
        console.log('[ChatPanel] Adding', guestNotes.length, 'guest notes to request');
        requestBody.guestNotes = guestNotes
      }

      console.log('[ChatPanel] Sending streaming request');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) throw new Error('API request failed')

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ''

        // Create placeholder message
        const assistantMessage: Message = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          expertMode: expertMode
        }
        addMessage(assistantMessage)

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  break
                }
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    accumulatedContent += parsed.content
                    // Update the last message in the store
                    const updatedMessage: Message = {
                      ...assistantMessage,
                      content: accumulatedContent
                    }
                    // Replace last message
                    const currentMessages = useChatStore.getState().messages
                    const newMessages = [...currentMessages.slice(0, -1), updatedMessage]
                    useChatStore.setState({ messages: newMessages })
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }
      } else {
        // Fallback to non-streaming
        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response || data.data?.assistantMessage?.content || 'No response',
          timestamp: new Date().toISOString(),
          expertMode: expertMode
        }
        addMessage(assistantMessage)
      }
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
          <div
            key={idx}
            className={`flex gap-4 mb-8 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="text-2xl">💼</div>
              </div>
            )}
            <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`px-6 py-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <MarkdownRenderer content={msg.content} />
                {msg.expertMode && (
                  <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    ⚖️ エキスパートモード
                  </span>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="text-2xl">👤</div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 mb-8 animate-fadeIn">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
              <div className="text-2xl">💼</div>
            </div>
            <div className="flex-1">
              <div className="bg-secondary px-6 py-4 rounded-2xl inline-flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
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
