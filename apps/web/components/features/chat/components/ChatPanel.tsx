'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore, Message } from '../stores/chatStore'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Send, Sparkles, StopCircle, Copy, Check, Edit2, RefreshCw, Trash2, ArrowDown } from 'lucide-react'
import { useAuthStore } from '../../../../lib/store/useAuthStore'
import { getUserPlan, getMessageLimit } from '../../../../lib/constants/chat'

interface ChatPanelProps {
  userId?: string
  authToken?: string | null
}

// サジェスチョン
const SUGGESTIONS = [
  { text: '103万円の壁について教えて', icon: '💰' },
  { text: '確定申告の準備を手伝って', icon: '📊' },
  { text: 'iDeCoとNISAの違いは？', icon: '💼' },
  { text: '住宅ローン控除について', icon: '🏠' },
]

export function ChatPanel({ userId, authToken }: ChatPanelProps) {
  const {
    getCurrentMessages,
    addMessage,
    isLoading,
    setLoading,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isComposing, setIsComposing] = useState(false) // IME入力中かどうか
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const messages = getCurrentMessages()
  const isGuest = !userId || userId === 'guest' || userId === 'anonymous'
  const token = useAuthStore((state) => state.token)

  // サブスクリプション情報を取得（プラン判定用）
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null)

  useEffect(() => {
    // サブスクリプション情報を取得
    const fetchSubscription = async () => {
      if (isGuest) return

      try {
        const response = await fetch('/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setSubscriptionPlan(data.plan || 'free')
        }
      } catch (error) {
        console.error('[ChatPanel] Failed to fetch subscription:', error)
        setSubscriptionPlan('free')
      }
    }

    fetchSubscription()
  }, [isGuest, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Scroll button visibility handler
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100
      setShowScrollButton(isScrolledUp)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Cleanup on unmount - メモリリーク防止
  useEffect(() => {
    return () => {
      // AbortController のクリーンアップ
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      // タイマーのクリーンアップ（copiedMessageId）
      setCopiedMessageId(null)
      // ローディング状態のリセット
      setLoading(false)
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }

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

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      // ゲストモードの場合は専用APIを使用
      const apiEndpoint = isGuest ? '/api/v1/chat/guest' : '/api/v1/chat'

      // プラン判定
      const userPlan = getUserPlan(isGuest, subscriptionPlan)
      const maxMessages = getMessageLimit(userPlan)

      // プランに応じた会話履歴の制限
      const limitedHistory = messages.length > maxMessages
        ? messages.slice(-maxMessages)
        : messages

      const requestBody: any = {
        message: userInput,
        // プラン別の会話履歴制限
        // ゲスト: 10往復（20メッセージ）
        // Free: 20往復（40メッセージ）
        // Pro: 100往復（200メッセージ）
        conversationHistory: limitedHistory.map(m => ({
          role: m.role,
          content: m.content
        }))
      }

      // ゲストモードの場合はguestIdを追加
      if (isGuest) {
        // ゲストIDをlocalStorageから取得または生成
        let guestId = localStorage.getItem('guestId')
        if (!guestId) {
          guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem('guestId', guestId)
        }
        requestBody.guestId = guestId
      }

      const headers: any = { 'Content-Type': 'application/json' }
      if (!isGuest && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // レート制限エラーの場合
        if (response.status === 429) {
          throw new Error(errorData.message || '利用制限に達しました。アカウント登録すると無制限にご利用いただけます。')
        }

        throw new Error(errorData.error || 'API request failed')
      }

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ''

        const assistantMessage: Message = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
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
          content: data.message || data.response || data.data?.assistantMessage?.content || 'No response',
          timestamp: new Date().toISOString(),
        }
        addMessage(assistantMessage)

        // Update conversation ID if returned
        if (data.conversationId && data.conversationId !== useChatStore.getState().currentConversationId) {
          // Update the current conversation ID if a new one was created
          useChatStore.getState().setCurrentConversation(data.conversationId)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[ChatPanel] Request aborted by user')
      } else {
        console.error('Error sending message:', error)
        let errorContent = 'エラーが発生しました。もう一度お試しください。'

        // より詳細なエラーメッセージ
        if (error instanceof Error) {
          if (error.message.includes('利用制限')) {
            errorContent = error.message
          } else if (error.message.includes('認証')) {
            errorContent = '認証エラーが発生しました。ログインし直してください。'
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorContent = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
          }
        }

        const errorMessage: Message = {
          role: 'assistant',
          content: `⚠️ ${errorContent}`,
          timestamp: new Date().toISOString(),
        }
        addMessage(errorMessage)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText)
    textareaRef.current?.focus()
  }

  // IME入力開始
  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  // IME入力終了
  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME入力中、またはShiftキーが押されている場合は送信しない
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopyMessage = async (content: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageIndex)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('[ChatPanel] Failed to copy message:', error)
    }
  }

  const handleEditMessage = (index: number, content: string) => {
    setEditingMessageIndex(index)
    setEditingContent(content)
  }

  const handleSaveEdit = () => {
    if (editingMessageIndex === null) return

    const currentConv = useChatStore
      .getState()
      .conversations.find((c) => c.id === useChatStore.getState().currentConversationId)

    if (currentConv) {
      const updatedMessages = currentConv.messages.map((msg, idx) =>
        idx === editingMessageIndex ? { ...msg, content: editingContent } : msg
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

    setEditingMessageIndex(null)
    setEditingContent('')
  }

  const handleCancelEdit = () => {
    setEditingMessageIndex(null)
    setEditingContent('')
  }

  const handleDeleteMessage = (index: number) => {
    const currentConv = useChatStore
      .getState()
      .conversations.find((c) => c.id === useChatStore.getState().currentConversationId)

    if (currentConv) {
      const updatedMessages = currentConv.messages.filter((_, idx) => idx !== index)
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

  const handleRegenerateResponse = async (index: number) => {
    const userMessageIndex = messages.slice(0, index).findLastIndex(msg => msg.role === 'user')
    if (userMessageIndex === -1) return

    const userMessage = messages[userMessageIndex]
    handleDeleteMessage(index)
    setLoading(true)

    try {
      const requestBody: any = {
        message: userMessage.content,
        userId: userId || 'anonymous',
        stream: true,
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
      }
    } catch (error) {
      console.error('Error regenerating response:', error)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto relative">
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
                  Faroがあなたの税金・金融の疑問に<br className="sm:hidden" />
                  わかりやすく答えます
                </p>
              </div>

              {/* Suggestions */}
              <div className="w-full max-w-2xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="group relative p-3.5 sm:p-4 rounded-[20px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="relative flex items-center gap-3">
                        <div className="text-xl sm:text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-200">
                          {suggestion.icon}
                        </div>
                        <p className="text-[13px] sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors leading-snug">
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
                    // User Message
                    <div className="group flex justify-end">
                      <div className="max-w-[80%] sm:max-w-[70%]">
                        {editingMessageIndex === idx ? (
                          // Edit mode
                          <div className="bg-white dark:bg-gray-800 rounded-[20px] p-4 shadow-lg border border-purple-200 dark:border-purple-700">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-purple-500 text-gray-900 dark:text-gray-100 text-[15px] leading-[1.6] resize-none"
                              rows={4}
                              autoFocus
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95"
                              >
                                保存
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all active:scale-95"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-white rounded-[24px] rounded-br-md px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-[15px] sm:text-base leading-[1.6] whitespace-pre-wrap break-words font-normal">
                                {msg.content}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 px-2 gap-2">
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => handleEditMessage(idx, msg.content)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all"
                                  aria-label="メッセージを編集"
                                  title="編集"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(idx)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-all"
                                  aria-label="メッセージを削除"
                                  title="削除"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2} />
                                </button>
                              </div>
                              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                                {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Assistant Message
                    <div className="group flex items-start gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-[24px] rounded-tl-sm px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm hover:shadow transition-shadow border border-gray-100/50 dark:border-gray-700/30">
                          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-[1.6] prose-headings:mb-2.5 prose-headings:mt-4 prose-pre:my-3 prose-code:text-sm prose-li:my-1">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 px-2 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                              {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {/* Action buttons */}
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleCopyMessage(msg.content, idx)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all"
                              aria-label="メッセージをコピー"
                              title="コピー"
                            >
                              {copiedMessageId === idx ? (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                              )}
                            </button>
                            <button
                              onClick={() => handleRegenerateResponse(idx)}
                              disabled={isLoading}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="回答を再生成"
                              title="再生成"
                            >
                              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(idx)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-all"
                              aria-label="メッセージを削除"
                              title="削除"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="mb-6 animate-fadeIn">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white animate-pulse" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-[24px] rounded-tl-sm px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm border border-gray-100/50 dark:border-gray-700/30">
                        <div className="flex gap-2">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 px-2 font-medium">
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

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-36 sm:bottom-32 right-4 sm:right-8 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200/80 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 z-10 animate-fadeIn backdrop-blur-sm"
            aria-label="最下部にスクロール"
          >
            <ArrowDown className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-5 pb-4 sm:pb-6">
          {/* Input Container */}
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-[0_2px_6px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.15)] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_4px_16px_rgba(99,102,241,0.1)] dark:focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.25),0_4px_16px_rgba(129,140,248,0.15)] transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-end gap-2 sm:gap-3 p-3 sm:p-4">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder="何でも聞いてください..."
                rows={1}
                disabled={isLoading}
                className="flex-1 px-1 sm:px-2 py-3 sm:py-3.5 bg-transparent resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base sm:text-[16px] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 leading-[1.6] font-normal"
                style={{
                  minHeight: '44px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(156, 163, 175, 0.4) transparent',
                  // IME入力時の下線やハイライトが見やすくなるように微調整
                  WebkitTextFillColor: 'currentColor',
                  caretColor: 'auto'
                }}
              />

              {/* Send Button */}
              <button
                onClick={isLoading ? handleStop : handleSend}
                disabled={!isLoading && !input.trim()}
                className={`flex-shrink-0 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 self-end shadow-sm ${
                  isLoading
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200 dark:shadow-red-900/30 hover:shadow-md active:scale-95'
                    : input.trim()
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-purple-200 dark:shadow-purple-900/30 hover:shadow-lg hover:scale-105 active:scale-100'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                aria-label={isLoading ? '停止' : '送信'}
              >
                {isLoading ? (
                  <StopCircle className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                ) : (
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-2 sm:mt-3 text-center">
            <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
              Faroは間違うこともあります。重要な情報は確認してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
