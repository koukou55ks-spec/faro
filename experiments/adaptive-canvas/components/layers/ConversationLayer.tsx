'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdaptiveCanvasStore } from '@/lib/stores/adaptive-canvas-store'
import { Send, Sparkles, Brain, Eye, Zap } from 'lucide-react'
import { MorphingMessage } from '../MorphingMessage'

export function ConversationLayer() {
  const { context, personas, addPersonaMessage, recordInteraction } = useAdaptiveCanvasStore()
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activePersonas = context.activePersonas.map(id => personas.get(id)).filter(Boolean)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: `user_${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    recordInteraction({
      type: 'chat',
      action: 'message_sent',
      metadata: { content: input, activePersonas: context.activePersonas }
    })

    // Call real API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          expert_mode: false,
          userId: '00000000-0000-0000-0000-000000000000'
        })
      })

      if (!response.ok) throw new Error('API call failed')

      const data = await response.json()
      const aiContent = data.data?.assistantMessage?.content || data.answer || data.response || 'エラーが発生しました'

      const aiMessage = {
        id: `ai_${Date.now()}`,
        content: aiContent,
        sender: 'ai',
        personaName: activePersonas[0]?.name || 'Faro',
        avatar: activePersonas[0]?.avatar || '🤖',
        timestamp: Date.now(),
        morphable: true
      }

      setMessages(prev => [...prev, aiMessage])
      setIsThinking(false)

      // Add to persona messages
      if (activePersonas.length > 0) {
        addPersonaMessage(activePersonas[0]!.id, {
          personaId: activePersonas[0]!.id,
          content: aiContent,
          type: 'text'
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: `error_${Date.now()}`,
        content: 'エラーが発生しました。もう一度お試しください。',
        sender: 'ai',
        personaName: 'System',
        avatar: '⚠️',
        timestamp: Date.now(),
        morphable: false
      }
      setMessages(prev => [...prev, errorMessage])
      setIsThinking(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-black/20 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
      {/* Header with active personas */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="text-purple-400" size={20} />
              <span className="text-white font-medium">Faro Intelligence</span>
            </div>
            {activePersonas.length > 0 && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Active:</span>
                <div className="flex gap-1">
                  {activePersonas.map(persona => (
                    <motion.div
                      key={persona?.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-1 bg-purple-500/20 rounded-lg text-purple-300 text-xs flex items-center gap-1"
                    >
                      <span>{persona?.avatar}</span>
                      <span>{persona?.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Eye size={16} />
            <span className="text-xs">{context.currentMood}</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'user' ? (
                <div className="max-w-md">
                  <div className="bg-purple-500/20 rounded-2xl px-4 py-2 border border-purple-500/30">
                    <p className="text-white">{message.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">You</div>
                </div>
              ) : (
                <div className="max-w-md">
                  <div className="flex items-start gap-3">
                    {message.avatar && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
                        {message.avatar}
                      </div>
                    )}
                    <div className="flex-1">
                      {message.morphable ? (
                        <MorphingMessage
                          content={message.content}
                          context={context}
                          personaName={message.personaName}
                        />
                      ) : (
                        <div className="bg-white/5 rounded-2xl px-4 py-2 border border-white/10">
                          <p className="text-gray-100">{message.content}</p>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {message.personaName || 'Faro'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400"
          >
            <div className="flex gap-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-purple-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                className="w-2 h-2 bg-purple-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-purple-500 rounded-full"
              />
            </div>
            <span className="text-sm">Faroが考えています...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder(context)}
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              disabled={isThinking}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Sparkles className="text-purple-400" size={16} />
              {context.activePersonas.length > 0 && (
                <Zap className="text-yellow-400" size={16} />
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isThinking}
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Send size={20} />
          </motion.button>
        </form>
      </div>
    </div>
  )
}

function getPlaceholder(context: any): string {
  if (context.timeFrame === 'past') {
    return '過去のデータについて質問してください...'
  }
  if (context.timeFrame === 'future') {
    return '将来の計画について相談してください...'
  }
  if (context.focusArea) {
    const areaMessages = {
      income: '収入について質問してください...',
      expense: '支出について質問してください...',
      investment: '投資について相談してください...',
      tax: '税金について質問してください...',
      budget: '予算について相談してください...',
      goals: '目標について話しましょう...'
    }
    return areaMessages[context.focusArea as keyof typeof areaMessages] || '質問を入力してください...'
  }
  return '金融について何でも聞いてください...'
}

function generatePersonaResponse(persona: any, input: string, context: any): string {
  // Simulate different persona responses based on their role
  const responses = {
    tax_advisor: [
      `税務の観点から、${input}について説明します。現在の税制では...`,
      `確定申告に関連して、${input}は重要なポイントです。`,
      `節税対策として、以下の方法をご提案します...`
    ],
    investment_strategist: [
      `投資戦略の観点から、${input}は興味深い質問です。`,
      `ポートフォリオを考慮すると、${input}への回答は...`,
      `リスクとリターンのバランスを考えると...`
    ],
    budget_coach: [
      `家計管理の面から、${input}についてアドバイスします。`,
      `支出を最適化するために、${input}に対する私の提案は...`,
      `予算計画において、${input}は重要な要素です。`
    ]
  }

  const roleResponses = responses[persona.role as keyof typeof responses] || ['ご質問ありがとうございます。']
  return roleResponses[Math.floor(Math.random() * roleResponses.length)]
}