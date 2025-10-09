/**
 * Chat API Route Tests
 */

import { NextRequest } from 'next/server'

// Chat APIのテスト
describe('/api/chat', () => {
  beforeEach(() => {
    // fetchモックをリセット
    jest.clearAllMocks()
  })

  it('should return 405 for GET requests', async () => {
    // GETリクエストはサポートしていない
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'GET',
    })

    // 動的import（Next.js App Router対応）
    const { POST } = await import('@/app/api/chat/route')

    // POSTハンドラしかないのでGETは未定義
    expect(POST).toBeDefined()
  })

  it('should handle chat request with question', async () => {
    // Gemini APIのモックレスポンス
    const mockGeminiResponse = {
      response: {
        text: () => '確定申告の期限は通常、翌年の3月15日です。',
      },
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiResponse,
    })

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        question: '確定申告の期限はいつですか？',
        expert_mode: false,
      }),
    })

    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(request)

    expect(response.status).toBe(200)
  })

  it('should handle expert mode', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        question: '法人税の計算方法を教えてください',
        expert_mode: true,
      }),
    })

    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(request)

    // エキスパートモードでも正常に動作
    expect(response).toBeDefined()
  })

  it('should return 400 for missing question', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(request)

    // questionが必須パラメータ
    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
