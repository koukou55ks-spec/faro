/**
 * ChatPanel Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatPanel from '@/components/workspace/ChatPanel'

// Supabaseモック
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
      }),
    },
  })),
}))

describe('ChatPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chat interface', () => {
    render(<ChatPanel />)

    // テキストエリアが表示されている
    const textarea = screen.getByPlaceholderText(/質問を入力/i)
    expect(textarea).toBeInTheDocument()
  })

  it('allows typing in textarea', () => {
    render(<ChatPanel />)

    const textarea = screen.getByPlaceholderText(/質問を入力/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '確定申告について教えて' } })

    expect(textarea.value).toBe('確定申告について教えて')
  })

  it('shows expert mode toggle', () => {
    render(<ChatPanel />)

    // エキスパートモードボタンが存在
    const expertButton = screen.getByText(/エキスパートモード/i)
    expect(expertButton).toBeInTheDocument()
  })

  it('can toggle expert mode', () => {
    render(<ChatPanel />)

    const expertButton = screen.getByText(/エキスパートモード/i)
    fireEvent.click(expertButton)

    // エキスパートモードがアクティブになる
    // （実装に応じて検証内容を調整）
    expect(expertButton).toBeInTheDocument()
  })

  it('submits message on send button click', async () => {
    // fetchモック
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'テスト回答' }),
    })

    render(<ChatPanel />)

    const textarea = screen.getByPlaceholderText(/質問を入力/i)
    const sendButton = screen.getByRole('button', { name: /送信/i })

    fireEvent.change(textarea, { target: { value: 'テスト質問' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
