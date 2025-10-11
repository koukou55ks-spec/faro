import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  immer((set) => ({
    conversations: [],
    currentConversationId: null,
    isLoading: false,

    setConversations: (conversations) =>
      set((state) => {
        state.conversations = conversations;
      }),

    addConversation: (conversation) =>
      set((state) => {
        state.conversations.unshift(conversation);
      }),

    setCurrentConversation: (id) =>
      set((state) => {
        state.currentConversationId = id;
      }),

    addMessage: (conversationId, message) =>
      set((state) => {
        const conversation = state.conversations.find((c) => c.id === conversationId);
        if (conversation) {
          conversation.messages.push(message);
          conversation.updatedAt = new Date();
        }
      }),

    setIsLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),
  }))
);
