import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  expertMode?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface ChatStore {
  // Current conversation state
  currentConversationId: string | null
  conversations: Conversation[]
  isLoading: boolean

  // Conversation management
  createConversation: () => string
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void

  // Message management
  addMessage: (message: Message) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void

  // Getters
  getCurrentConversation: () => Conversation | null
  getCurrentMessages: () => Message[]
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentConversationId: null,
      conversations: [],
      isLoading: false,

      createConversation: () => {
        const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newConversation: Conversation = {
          id,
          title: '新しいチャット',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }))
        return id
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id)
          const newCurrentId = state.currentConversationId === id
            ? newConversations[0]?.id || null
            : state.currentConversationId
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          }
        })
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      addMessage: (message) => {
        const state = get()
        let currentId = state.currentConversationId

        // Create new conversation if none exists
        if (!currentId) {
          currentId = get().createConversation()
        }

        set((state) => {
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === currentId) {
              const newMessages = [...conv.messages, message]
              // Auto-generate title from first user message
              const title =
                conv.messages.length === 0 && message.role === 'user'
                  ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                  : conv.title
              return {
                ...conv,
                messages: newMessages,
                title,
                updatedAt: new Date().toISOString(),
              }
            }
            return conv
          })
          return { conversations: updatedConversations }
        })
      },

      clearMessages: () => {
        const state = get()
        if (state.currentConversationId) {
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === state.currentConversationId
                ? { ...conv, messages: [], updatedAt: new Date().toISOString() }
                : conv
            ),
          }))
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      getCurrentConversation: () => {
        const state = get()
        return state.conversations.find((c) => c.id === state.currentConversationId) || null
      },

      getCurrentMessages: () => {
        const conv = get().getCurrentConversation()
        return conv?.messages || []
      },
    }),
    {
      name: 'faro-chat-storage',
    }
  )
)
