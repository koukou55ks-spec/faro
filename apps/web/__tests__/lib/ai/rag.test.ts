/**
 * RAGシステムのユニットテスト
 */

import { SimpleRAG } from '../../../lib/ai/rag'

// Gemini API と Supabase をモック化
jest.mock('@google/generative-ai')
jest.mock('@supabase/supabase-js')

describe('SimpleRAG', () => {
  let rag: SimpleRAG

  beforeAll(() => {
    // 環境変数をセット
    process.env.GEMINI_API_KEY = 'test-gemini-key'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
  })

  beforeEach(() => {
    rag = new SimpleRAG()
  })

  describe('初期化', () => {
    it('環境変数がない場合はエラーをスロー', () => {
      delete process.env.GEMINI_API_KEY
      expect(() => new SimpleRAG()).toThrow('Gemini API key not configured')
      process.env.GEMINI_API_KEY = 'test-gemini-key'
    })

    it('Supabase認証情報がない場合はエラーをスロー', () => {
      delete process.env.SUPABASE_SERVICE_KEY
      expect(() => new SimpleRAG()).toThrow('Supabase credentials not configured')
      process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
    })
  })

  describe('embed', () => {
    it('テキストを正しくベクトル化する', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]

      // モックの実装
      rag['embedModel'] = {
        embedContent: jest.fn().mockResolvedValue({
          embedding: { values: mockEmbedding }
        })
      }

      const result = await rag.embed('テストテキスト')
      expect(result).toEqual(mockEmbedding)
      expect(rag['embedModel'].embedContent).toHaveBeenCalledWith('テストテキスト')
    })

    it('エラーが発生した場合は適切にスロー', async () => {
      rag['embedModel'] = {
        embedContent: jest.fn().mockRejectedValue(new Error('API Error'))
      }

      await expect(rag.embed('テスト')).rejects.toThrow('API Error')
    })
  })

  describe('search', () => {
    it('ベクトル検索を実行する', async () => {
      const mockResults = [
        { content: '検索結果1', similarity: 0.9 },
        { content: '検索結果2', similarity: 0.8 }
      ]

      rag['embedModel'] = {
        embedContent: jest.fn().mockResolvedValue({
          embedding: { values: [0.1, 0.2] }
        })
      }

      rag['supabase'] = {
        rpc: jest.fn().mockResolvedValue({ data: mockResults, error: null })
      }

      const results = await rag.search('検索クエリ', 'user123')
      expect(results).toEqual(mockResults)
    })

    it('検索エラー時は空配列を返す', async () => {
      rag['embedModel'] = {
        embedContent: jest.fn().mockResolvedValue({
          embedding: { values: [0.1, 0.2] }
        })
      }

      rag['supabase'] = {
        rpc: jest.fn().mockResolvedValue({ data: null, error: new Error('DB Error') })
      }

      const results = await rag.search('クエリ', 'user123')
      expect(results).toEqual([])
    })
  })

  describe('getUserContext', () => {
    it('ユーザープロフィール情報を正しく取得する', async () => {
      const mockProfile = {
        user_id: 'user123',
        age: 30,
        occupation: 'エンジニア',
        employment_type: 'full_time',
        annual_income: 6000000,
        marital_status: 'single',
      }

      const mockLifeEvents = []

      // Create chainable mock
      const limitMock = jest.fn().mockResolvedValue({ data: mockLifeEvents, error: null })
      const orderMock = jest.fn().mockReturnValue({ limit: limitMock })
      const singleMock = jest.fn().mockResolvedValue({ data: mockProfile, error: null })
      const eqMock = jest.fn(() => ({
        single: singleMock,
        order: orderMock
      }))
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
      const fromMock = jest.fn().mockReturnValue({ select: selectMock })

      rag['supabase'] = { from: fromMock } as any

      const context = await rag.getUserContext('user123')
      expect(context).toContain('年齢: 30歳')
      expect(context).toContain('職業: エンジニア')
      expect(context).toContain('年収: 6,000,000円')
    })

    it('プロフィールが存在しない場合は空文字を返す', async () => {
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: null })
      const eqMock = jest.fn(() => ({ single: singleMock }))
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
      const fromMock = jest.fn().mockReturnValue({ select: selectMock })

      rag['supabase'] = { from: fromMock } as any

      const context = await rag.getUserContext('user123')
      expect(context).toBe('')
    })
  })

  describe('generateWithContext', () => {
    it('コンテキスト付きで回答を生成する', async () => {
      const mockResponse = 'これはAIの回答です'

      rag['embedModel'] = {
        embedContent: jest.fn().mockResolvedValue({
          embedding: { values: [0.1, 0.2] }
        })
      }

      rag['supabase'] = {
        rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null }),
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: [] })
              })
            })
          })
        })
      }

      rag['chatModel'] = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue(mockResponse)
          }
        })
      }

      const result = await rag.generateWithContext('質問', 'user123')
      expect(result).toBe(mockResponse)
      expect(rag['chatModel'].generateContent).toHaveBeenCalled()
    })
  })
})
