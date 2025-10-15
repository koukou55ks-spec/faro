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
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              {/* Welcome Hero */}
              <div className="text-center mb-10 animate-fadeIn">
                <div className="mb-6 relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                  何でも聞いてください
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Faroがあなたの金融相談を<br className="sm:hidden" />
                  プロフェッショナルにサポートします
                </p>
              </div>

              {/* Suggestions */}
              <div className="w-full max-w-2xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="group relative p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <div className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                          {suggestion.icon}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
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
                <div key={idx} className="mb-8 animate-fadeIn">
                  {msg.role === 'user' ? (
                    // User Message - Clean bubble design
                    <div className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-[75%]">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-3xl rounded-tr-md px-5 py-3 shadow-md">
                          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-right px-1">
                          {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant Message - Professional card style
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl rounded-tl-md px-5 py-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-3">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 px-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.expertMode && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                              <span>⚖️</span>
                              <span>エキスパート</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="mb-8 animate-fadeIn">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl rounded-tl-md px-5 py-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
                        <div className="flex gap-1.5">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 px-1">
                        考え中...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Modern ChatGPT/Claude Style */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-3xl mx-auto px-4 py-5">
          {/* Expert Mode Toggle - Moved to top */}
          <div className="mb-3 flex items-center gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer group px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={expertMode}
                  onChange={(e) => setExpertMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4 shadow-md"></div>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors flex items-center gap-1">
                <span>⚖️</span>
                <span>エキスパートモード</span>
              </span>
            </label>
            {expertMode && (
              <span className="text-xs text-purple-600 dark:text-purple-400 animate-fadeIn">
                専門的な金融アドバイスを提供します
              </span>
            )}
          </div>

          {/* Input Container */}
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Faroに質問してください..."
              rows={1}
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-4 bg-transparent resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-[15px] leading-relaxed"
              style={{
                minHeight: '56px',
                maxHeight: '200px',
                overflow: input.split('\n').length > 1 ? 'auto' : 'hidden'
              }}
            />

            {/* Send Button - Modern Floating Style */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {input.trim() && (
                <span className="text-xs text-gray-400 dark:text-gray-500 animate-fadeIn hidden sm:inline">
                  Enter で送信
                </span>
              )}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                aria-label={isLoading ? '停止' : '送信'}
              >
                {isLoading ? (
                  <StopCircle className="w-5 h-5 animate-pulse" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI搭載の金融パートナー</span>
            </span>
            <span className="hidden sm:inline">
              Shift + Enter で改行
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
