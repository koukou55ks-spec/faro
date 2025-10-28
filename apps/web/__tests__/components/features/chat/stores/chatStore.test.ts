/**
 * チャットストアのユニットテスト
 */

import { useChatStore, Message } from '../../../../../components/features/chat/stores/chatStore'

describe('useChatStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useChatStore.setState({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
    })
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const state = useChatStore.getState()
      expect(state.conversations).toEqual([])
      expect(state.currentConversationId).toBeNull()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('addMessage', () => {
    it('新しいメッセージを追加できる', () => {
      const message: Message = {
        role: 'user',
        content: 'テストメッセージ',
        timestamp: new Date().toISOString(),
      }

      useChatStore.getState().addMessage(message)
      const state = useChatStore.getState()

      expect(state.conversations).toHaveLength(1)
      expect(state.conversations[0].messages).toContainEqual(message)
    })

    it('既存の会話にメッセージを追加できる', () => {
      const store = useChatStore.getState()

      // 最初のメッセージ
      const message1: Message = {
        role: 'user',
        content: 'メッセージ1',
        timestamp: new Date().toISOString(),
      }
      store.addMessage(message1)

      // 2番目のメッセージ
      const message2: Message = {
        role: 'assistant',
        content: 'メッセージ2',
        timestamp: new Date().toISOString(),
      }
      store.addMessage(message2)

      const state = useChatStore.getState()
      expect(state.conversations[0].messages).toHaveLength(2)
      expect(state.conversations[0].messages[0]).toEqual(message1)
      expect(state.conversations[0].messages[1]).toEqual(message2)
    })
  })

  describe('getCurrentMessages', () => {
    it('現在の会話のメッセージを取得できる', () => {
      const message: Message = {
        role: 'user',
        content: 'テスト',
        timestamp: new Date().toISOString(),
      }

      useChatStore.getState().addMessage(message)
      const messages = useChatStore.getState().getCurrentMessages()

      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(message)
    })

    it('会話が存在しない場合は空配列を返す', () => {
      const messages = useChatStore.getState().getCurrentMessages()
      expect(messages).toEqual([])
    })
  })

  describe('setLoading', () => {
    it('ローディング状態を変更できる', () => {
      useChatStore.getState().setLoading(true)
      expect(useChatStore.getState().isLoading).toBe(true)

      useChatStore.getState().setLoading(false)
      expect(useChatStore.getState().isLoading).toBe(false)
    })
  })

  describe('clearMessages', () => {
    it('現在の会話のメッセージをクリアできる', () => {
      const message: Message = {
        role: 'user',
        content: 'テスト',
        timestamp: new Date().toISOString(),
      }

      useChatStore.getState().addMessage(message)
      expect(useChatStore.getState().getCurrentMessages()).toHaveLength(1)

      useChatStore.getState().clearMessages()
      expect(useChatStore.getState().getCurrentMessages()).toEqual([])
    })
  })

  describe('LocalStorage統合', () => {
    it('会話がストアに保存される', () => {
      const message: Message = {
        role: 'user',
        content: 'テスト',
        timestamp: new Date().toISOString(),
      }

      useChatStore.getState().addMessage(message)

      // 会話が作成され、メッセージが追加されたことを確認
      const state = useChatStore.getState()
      expect(state.conversations).toHaveLength(1)
      expect(state.conversations[0].messages).toContainEqual(message)
      expect(state.currentConversationId).toBeTruthy()
    })
  })
})
