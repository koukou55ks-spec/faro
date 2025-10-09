'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { MessageList } from './MessageList'
import { useConversationStore } from '@/lib/stores/conversation'
import { sendMessage } from '@/lib/api/chat'

interface ChatInterfaceProps {
  conversationId?: string
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expertMode, setExpertMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, addMessage } = useConversationStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // ユーザーメッセージを追加
    addMessage({
      role: 'user',
      content: userMessage,
    })

    try {
      // バックエンドにリクエスト
      const response = await sendMessage(userMessage, conversationId, undefined, expertMode)

      // AIの回答を追加
      addMessage({
        role: 'assistant',
        content: response.answer,
        metadata: {
          model: response.model,
          complexity: response.complexity,
          sources: response.sources,
          expertMode: response.expertMode,
        },
      })
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Expert Mode Toggle */}
          <div className="mb-3 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={expertMode}
                onChange={(e) => setExpertMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                エキスパートモード
              </span>
            </label>
            <span className="text-xs text-gray-500">
              （法的根拠・リスク評価を含む詳細な回答）
            </span>
          </div>

          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力してください..."
              className="resize-none"
              rows={3}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
