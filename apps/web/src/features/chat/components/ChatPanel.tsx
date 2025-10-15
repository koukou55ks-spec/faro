'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore, Message } from '../stores/chatStore'
import { useGuestNotesStore } from '../../notes/stores/guestNotesStore'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Send, Sparkles, ArrowUp, StopCircle } from 'lucide-react'
import { ChatMessageSkeleton } from '../../../../components/LoadingSkeleton'

interface ChatPanelProps {
  userId?: string
}

// サジェスチョン（金融相談のよくある例）
const SUGGESTIONS = [
  { text: '103万円の壁について教えて', icon: '💰' },
  { text: '確定申告の準備を手伝って', icon: '📊' },
  { text: 'iDeCoとNISAの違いは？', icon: '💼' },
  { text: '住宅ローン控除について', icon: '🏠' },
]

export function ChatPanel({ userId }: ChatPanelProps) {
  const {
    getCurrentMessages,
    addMessage,
    isLoading,
    setLoading,
  } = useChatStore()

  const { notes: guestNotes } = useGuestNotesStore()
  const [input, setInput] = useState('')
  const [expertMode, setExpertMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messages = getCurrentMessages()
  const isGuest = !userId || userId === 'guest' || userId === 'anonymous'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    addMessage(userMessage)
    const userInput = input
    setInput('')
    setLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const requestBody: any = {
        message: userInput,
        userId: userId || 'anonymous',
        expertMode: expertMode,
        stream: true,
        sourceSelection: {
          documents: [],
          collections: [],
          includeNotes: true,
          includeMessages: true,
        },
      }

      if (isGuest && guestNotes.length > 0) {
        requestBody.guestNotes = guestNotes
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) throw new Error('API request failed')

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ''

        const assistantMessage: Message = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          expertMode: expertMode,
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
                if (data === '[DONE]') break

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    accumulatedContent += parsed.content
                    const currentConv = useChatStore
                      .getState()
                      .conversations.find((c) => c.id === useChatStore.getState().currentConversationId)
                    if (currentConv) {
                      const updatedMessages = currentConv.messages.map((msg, idx) =>
                        idx === currentConv.messages.length - 1
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                      useChatStore.setState({
                        conversations: useChatStore
                          .getState()
                          .conversations.map((conv) =>
                            conv.id === useChatStore.getState().currentConversationId
                              ? { ...conv, messages: updatedMessages }
                              : conv
                          ),
                      })
                    }
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }
      } else {
        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response || data.data?.assistantMessage?.content || 'No response',
          timestamp: new Date().toISOString(),
          expertMode: expertMode,
        }
        addMessage(assistantMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
        timestamp: new Date().toISOString(),
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              {/* Welcome Hero */}
              <div className="text-center mb-8 animate-fadeIn">
                <div className="mb-4 relative inline-block">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  何でも聞いてください
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Faroがあなたの金融相談をサポートします
                </p>
              </div>

              {/* Suggestions */}
              <div className="w-full max-w-2xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="group p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{suggestion.icon}</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                          {suggestion.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className="mb-6 animate-fadeIn">
                  {msg.role === 'user' ? (
                    // User Message - Simple, no avatar
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5">
                        <div className="text-gray-900 dark:text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant Message
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mt-0.5">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                        {msg.expertMode && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">
                            <span>⚖️</span>
                            <span>エキスパートモード</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - ChatGPT Style */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを送信"
              rows={1}
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-[15px] leading-relaxed"
              style={{
                minHeight: '48px',
                maxHeight: '200px',
                overflow: input.split('\n').length > 1 ? 'auto' : 'hidden'
              }}
            />

            {/* Send Button - ChatGPT Style */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2 rounded-full transition-all ${
                input.trim() && !isLoading
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              aria-label="送信"
            >
              {isLoading ? (
                <StopCircle className="w-5 h-5" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Expert Mode Toggle + Info */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={expertMode}
                  onChange={(e) => setExpertMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-3"></div>
              </div>
              <span className="group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                エキスパートモード
              </span>
            </label>
            <span className="hidden sm:inline">
              Shift + Enter で改行
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
