'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    model?: string
    complexity?: number
    sources?: any
  }
  created_at?: string
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {messages.map((message, index) => (
        <Card
          key={message.id || index}
          className={`p-4 ${
            message.role === 'user'
              ? 'bg-blue-50 ml-auto max-w-[80%]'
              : 'bg-white mr-auto max-w-[90%]'
          }`}
        >
          <div className="flex gap-3">
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              {message.role === 'assistant' && message.metadata?.model && (
                <div className="flex gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {message.metadata.model}
                  </Badge>
                  {message.metadata.complexity !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      複雑度: {(message.metadata.complexity * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              {message.metadata?.sources && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  <p className="font-semibold mb-1">参考情報:</p>
                  <ul className="list-disc list-inside">
                    {message.metadata.sources.knowledge_base?.map((source: any, i: number) => (
                      <li key={i}>{source.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
