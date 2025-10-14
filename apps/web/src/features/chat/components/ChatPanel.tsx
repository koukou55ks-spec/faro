'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore, Message } from '../stores/chatStore'
import { useGuestNotesStore } from '../../notes/stores/guestNotesStore'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Send, Sparkles, TrendingUp, Lightbulb } from 'lucide-react'
import { ChatMessageSkeleton } from '../../../../components/LoadingSkeleton'

interface ChatPanelProps {
  userId?: string
}

// サジェスチョン（金融相談のよくある例）
const SUGGESTIONS = [
  { icon: '💰', text: '103万円の壁について教えて', category: '税制' },
  { icon: '📊', text: '確定申告の準備を手伝って', category: '確定申告' },
  { icon: '🏠', text: '住宅ローン控除について知りたい', category: '控除' },
  { icon: '💼', text: 'iDeCoとNISAの違いは？', category: '投資' },
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

  const messages = getCurrentMessages()
  const isGuest = !userId || userId === 'guest' || userId === 'anonymous'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              {/* Welcome Hero */}
              <div className="text-center mb-12 animate-fadeIn">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-8 w-16 h-16 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute -bottom-3 -left-6 w-12 h-12 bg-purple-100 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Faroへようこそ
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  あなたのパーソナルCFO
                </p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  税務・財務・投資に関するご相談を、専門家レベルの知識でサポートします
                </p>
              </div>

              {/* Suggestions */}
              <div className="w-full max-w-2xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm font-semibold text-gray-700">よくある相談</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="group p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 mb-1">
                            {suggestion.text}
                          </p>
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            {suggestion.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">リアルタイム分析</p>
                  <p className="text-xs text-gray-500 mt-1">あなたの状況を即座に理解</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">AI専門家</p>
                  <p className="text-xs text-gray-500 mt-1">税理士レベルの知識</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-pink-100 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">完全プライベート</p>
                  <p className="text-xs text-gray-500 mt-1">データは安全に保護</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className="mb-8 animate-fadeIn">
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Avatar */}
                    <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0 rounded-full ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-gray-200 to-gray-300'
                        : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                    }`}>
                      {msg.role === 'user' ? (
                        <span className="text-sm font-semibold text-gray-700">You</span>
                      ) : (
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-gray-900">
                          {msg.role === 'user' ? 'You' : 'Faro CFO'}
                        </span>
                        {msg.expertMode && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            <span>⚖️</span>
                            <span className="hidden md:inline">エキスパート</span>
                          </span>
                        )}
                      </div>
                      <div className={`prose prose-sm md:prose-base max-w-none ${
                        msg.role === 'user' ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && <ChatMessageSkeleton />}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 md:px-6">
          {/* Expert Mode Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={expertMode}
                  onChange={(e) => setExpertMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                ⚖️ エキスパートモード
              </span>
            </label>
            <span className="text-xs text-gray-500 hidden md:inline">（法的根拠・詳細分析）</span>
          </div>

          {/* Input Box */}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Faroに相談してみましょう..."
              rows={1}
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl bg-white resize-none focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-900 placeholder-gray-400"
              style={{ minHeight: '52px', maxHeight: '150px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-600 shadow-md hover:shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
