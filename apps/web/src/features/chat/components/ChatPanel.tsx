'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore, Message } from '../stores/chatStore'
import { useGuestNotesStore } from '../../notes/stores/guestNotesStore'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Menu, ChevronLeft } from 'lucide-react'

interface ChatPanelProps {
  userId?: string
}

export function ChatPanel({ userId }: ChatPanelProps) {
  const {
    conversations,
    currentConversationId,
    getCurrentMessages,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    renameConversation,
    addMessage,
    clearMessages,
    isLoading,
    setLoading,
  } = useChatStore()

  const { notes: guestNotes } = useGuestNotesStore()
  const [input, setInput] = useState('')
  const [expertMode, setExpertMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = getCurrentMessages()
  const isGuest = !userId || userId === 'guest' || userId === 'anonymous'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation()
    }
  }, [])

  const handleNewChat = () => {
    createConversation()
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id)
  }

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('この会話を削除しますか？')) {
      deleteConversation(id)
    }
  }

  const handleStartEdit = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingTitle(title)
  }

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      renameConversation(id, editingTitle.trim())
    }
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
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
                      .conversations.find((c) => c.id === currentConversationId)
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
                            conv.id === currentConversationId
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar - ChatGPT/Gemini Style */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } border-r border-border bg-secondary/30 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-border flex-shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-4 h-4" />
            新しいチャット
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-sm text-muted-foreground">
              新しいチャットを開始
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    conv.id === currentConversationId
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(conv.id)
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(conv.id)}
                        className="p-1 hover:bg-background rounded"
                      >
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </button>
                      <button onClick={handleCancelEdit} className="p-1 hover:bg-background rounded">
                        <X className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 pr-8">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">{conv.title}</span>
                      </div>
                      <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                        <button
                          onClick={(e) => handleStartEdit(conv.id, conv.title, e)}
                          className="p-1 hover:bg-background rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 hover:bg-background rounded transition-colors text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-xl font-bold text-foreground">💬 Faro</h2>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm('このチャットをクリアしますか？')) {
                  clearMessages()
                }
              }}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              クリア
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
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
              <div key={idx} className="mb-6 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full bg-secondary">
                    {msg.role === 'user' ? '👤' : '💼'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold mb-1 text-sm">
                      {msg.role === 'user' ? 'You' : 'Faro'}
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                    {msg.expertMode && (
                      <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        ⚖️ エキスパートモード
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-6 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full bg-secondary">
                    💼
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1 text-sm">Faro</div>
                    <div className="flex gap-1.5">
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0s' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-background">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expertMode}
                  onChange={(e) => setExpertMode(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span className="font-medium">⚖️ エキスパートモード</span>
              </label>
              <span className="text-xs text-muted-foreground">（法的根拠・リスク評価含む）</span>
            </div>

            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                rows={3}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-border rounded-xl bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
