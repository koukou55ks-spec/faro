'use client'

import { useState, useEffect, useRef } from 'react'
import { sendMessage } from '@/lib/api/chat'
import { marked } from 'marked'

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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expertMode, setExpertMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatHistory')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  useEffect(() => {
    // Save to localStorage
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

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

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessage(input, undefined, userId, expertMode)

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        expertMode: response.expert_mode
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    if (confirm('チャット履歴を削除しますか？')) {
      setMessages([])
      localStorage.removeItem('chatHistory')
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="header-content">
          <h2>💬 パーソナルCFO</h2>
          <button onClick={clearChat} className="clear-button">
            <i className="fas fa-trash"></i> 履歴削除
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>Faroへようこそ</h3>
            <p>あなたのパーソナルCFOとして、税務・財務の最適化をサポートします。</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '💼'}
            </div>
            <div className="message-content">
              <div
                className="message-text"
                dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
              />
              {msg.expertMode && (
                <span className="expert-badge">⚖️ エキスパートモード</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">💼</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="expert-mode-toggle">
          <label>
            <input
              type="checkbox"
              checked={expertMode}
              onChange={(e) => setExpertMode(e.target.checked)}
            />
            <span>⚖️ エキスパートモード</span>
          </label>
          <span className="toggle-hint">（法的根拠・リスク評価含む）</span>
        </div>

        <div className="input-box">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="税務・財務について質問してください..."
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="send-button"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
        }

        .chat-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-primary);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .clear-button {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition);
        }

        .clear-button:hover {
          background: var(--bg-hover);
          color: var(--accent-danger);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .message {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .message-avatar {
          font-size: 2rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-text {
          background: var(--bg-secondary);
          padding: 1rem 1.25rem;
          border-radius: 12px;
          color: var(--text-primary);
          line-height: 1.6;
        }

        .message.user .message-text {
          background: var(--accent-primary);
          color: white;
        }

        .expert-badge {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: var(--accent-secondary);
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .typing-indicator {
          display: flex;
          gap: 0.25rem;
          padding: 1rem;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .input-container {
          border-top: 1px solid var(--border);
          background: var(--bg-primary);
          padding: 1rem 1.5rem;
        }

        .expert-mode-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .expert-mode-toggle label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-primary);
        }

        .expert-mode-toggle input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--accent-primary);
        }

        .toggle-hint {
          color: var(--text-tertiary);
          font-size: 0.75rem;
        }

        .input-box {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .input-box textarea {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.95rem;
          resize: none;
          transition: all var(--transition);
        }

        .input-box textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .send-button {
          padding: 0.875rem 1.5rem;
          background: var(--accent-primary);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all var(--transition);
        }

        .send-button:hover:not(:disabled) {
          background: var(--accent-secondary);
          transform: translateY(-1px);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
