import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  expertMode?: boolean
}

interface ChatStore {
  messages: Message[]
  isLoading: boolean
  addMessage: (message: Message) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      clearMessages: () => set({ messages: [] }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'chat-storage',
    }
  )
)
