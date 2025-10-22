'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore, Message } from '../stores/chatStore'
import { useGuestNotesStore } from '../../notes/stores/guestNotesStore'
import { useDocumentsStore } from '../../documents/stores/documentsStore'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Send, Sparkles, ArrowUp, StopCircle, Copy, Check, Paperclip, X, ChevronDown, FileText, Folder, Edit2, RefreshCw, Trash2, ArrowDown, Zap, AlertCircle } from 'lucide-react'
import { ChatMessageSkeleton } from '../../../../components/LoadingSkeleton'
import { useAuthStore } from '../../../../lib/store/useAuthStore'

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
  const {
    documents,
    collections,
    selectedDocuments,
    selectedCollections,
    toggleDocumentSelection,
    toggleCollectionSelection,
    clearSelection,
  } = useDocumentsStore()

  const [input, setInput] = useState('')
  const [expertMode, setExpertMode] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeMessages, setIncludeMessages] = useState(true)
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [usageData, setUsageData] = useState<{
    allowed: boolean
    plan: string
    limit: number
    used: number
    remaining: number
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const messages = getCurrentMessages()
  const isGuest = !userId || userId === 'guest' || userId === 'anonymous'
  const token = useAuthStore((state) => state.token)

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  // Fetch usage data for authenticated users
  useEffect(() => {
    async function fetchUsage() {
      if (!token || isGuest) {
        setUsageData(null)
        return
      }

      try {
        const response = await fetch('/api/usage/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'ai_message' }),
        })

        if (response.ok) {
          const data = await response.json()
          setUsageData(data)
        }
      } catch (error) {
        console.error('[ChatPanel] Error fetching usage:', error)
      }
    }

    fetchUsage()
  }, [token, isGuest, messages.length])

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Check usage limit for authenticated users
    if (!isGuest && usageData && !usageData.allowed) {
      setShowUpgradeModal(true)
      return
    }

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
      const requestBody: any = {
        message: userInput,
        userId: userId || 'anonymous',
        expertMode: expertMode,
        stream: true,
        sourceSelection: {
          documents: selectedDocuments,
          collections: selectedCollections,
          includeNotes: includeNotes,
          includeMessages: includeMessages,
        },
      }

      if (isGuest && guestNotes.length > 0) {
        requestBody.guestNotes = guestNotes
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
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

      // Track usage for authenticated users
      if (!isGuest && token) {
        try {
          await fetch('/api/usage/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'ai_message' }),
          })
        } catch (error) {
          console.error('[ChatPanel] Error tracking usage:', error)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[ChatPanel] Request aborted by user')
        // User intentionally stopped, no error message needed
      } else {
        console.error('Error sending message:', error)
        const errorMessage: Message = {
          role: 'assistant',
          content: 'エラーが発生しました。もう一度お試しください。',
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setAttachedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
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
    // Find the last user message before this assistant message
    const userMessageIndex = messages.slice(0, index).findLastIndex(msg => msg.role === 'user')
    if (userMessageIndex === -1) return

    const userMessage = messages[userMessageIndex]

    // Delete the assistant message
    handleDeleteMessage(index)

    // Resend the user message
    setLoading(true)

    try {
      const requestBody: any = {
        message: userMessage.content,
        userId: userId || 'anonymous',
        expertMode: expertMode,
        stream: true,
        sourceSelection: {
          documents: selectedDocuments,
          collections: selectedCollections,
          includeNotes: includeNotes,
          includeMessages: includeMessages,
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

  const selectedSourcesCount = selectedDocuments.length + selectedCollections.length + (includeNotes ? 1 : 0) + (includeMessages ? 1 : 0)

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
                無料プランの上限に達しました
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                今月のAIメッセージ数が上限の{usageData?.limit}回に達しました。<br />
                Proプランにアップグレードして無制限に利用しましょう。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowUpgradeModal(false)
                    // Navigate to pricing page - user can implement this
                    window.location.href = '/app?view=pricing'
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  Proプランにアップグレード
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source Selection Modal */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                参照するソースを選択
              </h3>
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Include Options */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">全般</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">ノートを含める</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={includeMessages}
                      onChange={(e) => setIncludeMessages(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Sparkles className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">過去の会話を含める</span>
                  </label>
                </div>
              </div>

              {/* Collections */}
              {collections.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    コレクション ({collections.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {collections.map((collection) => (
                      <label
                        key={collection.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(collection.id)}
                          onChange={() => toggleCollectionSelection(collection.id)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <Folder className="w-5 h-5 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{collection.name}</p>
                          {collection.description && (
                            <p className="text-xs text-gray-500 truncate">{collection.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{collection.documentCount}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    ドキュメント ({documents.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {documents.map((doc) => (
                      <label
                        key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => toggleDocumentSelection(doc.id)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.file_type.toUpperCase()}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {collections.length === 0 && documents.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ドキュメントがありません
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    ノートからドキュメントをアップロードしてください
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSourcesCount}個のソースを選択中
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearSelection()
                    setIncludeNotes(true)
                    setIncludeMessages(true)
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  リセット
                </button>
                <button
                  onClick={() => setIsSourceModalOpen(false)}
                  className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  適用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Faroがあなたの金融相談を<br className="sm:hidden" />
                  プロフェッショナルにサポートします
                </p>
              </div>

              {/* Suggestions - Gemini style */}
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
                    // User Message - Gemini-style polished bubble
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
                    // Assistant Message - Gemini-level polish
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
                            {msg.expertMode && (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-[11px] font-semibold border border-purple-200 dark:border-purple-700/50">
                                <span className="text-xs">⚖️</span>
                                <span>エキスパート</span>
                              </div>
                            )}
                          </div>
                          {/* Action buttons - Gemini style */}
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

        {/* Scroll to bottom button - Gemini style */}
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

      {/* Input Area - Gemini-inspired Style */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-5 pb-4 sm:pb-6">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 animate-fadeIn">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-sm border border-blue-200 dark:border-blue-700/50"
                >
                  <Paperclip className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px] sm:max-w-[180px] text-xs font-medium">
                    {file.name}
                  </span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full transition-colors flex-shrink-0"
                    aria-label="ファイルを削除"
                  >
                    <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Input Container - Gemini Style with larger, more prominent design */}
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-[0_2px_6px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.15)] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_4px_16px_rgba(99,102,241,0.1)] dark:focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.25),0_4px_16px_rgba(129,140,248,0.15)] transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-end gap-2 sm:gap-3 p-3 sm:p-4">
              {/* Attach Button - Gemini style */}
              <button
                onClick={handleAttachClick}
                disabled={isLoading}
                className="flex-shrink-0 p-2.5 sm:p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/70 active:bg-gray-200 dark:active:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-end group"
                aria-label="ファイルを添付"
                title="ファイルを添付"
              >
                <Paperclip className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors" strokeWidth={2} />
              </button>

              {/* Textarea - Larger and more spacious */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="何でも聞いてください..."
                rows={1}
                disabled={isLoading}
                className="flex-1 px-1 sm:px-2 py-3 sm:py-3.5 bg-transparent resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base sm:text-[16px] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 leading-[1.6] font-normal"
                style={{
                  minHeight: '44px',
                  maxHeight: '240px',
                  overflow: input.split('\n').length > 1 ? 'auto' : 'hidden',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(156, 163, 175, 0.4) transparent'
                }}
              />

              {/* Send Button - Gemini style with gradient */}
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

            {/* Advanced Options - Below input, collapsible */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Expert Mode - Simplified toggle */}
                  <button
                    onClick={() => setExpertMode(!expertMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      expertMode
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${expertMode ? 'animate-pulse' : ''}`} />
                    <span>エキスパート</span>
                  </button>

                  {/* Source Selection Button - Simplified */}
                  <button
                    onClick={() => setIsSourceModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ソース</span>
                    {selectedSourcesCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white rounded-full text-[10px] font-bold min-w-[18px] text-center">
                        {selectedSourcesCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Usage Indicator - Inline */}
                {!isGuest && usageData && usageData.plan === 'free' && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">{usageData.remaining}/{usageData.limit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Helper Text - Minimal */}
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
