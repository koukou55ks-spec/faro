/**
 * Gemini AI統合
 * Primary: Gemini 1.5 Flash（コスト最優先）
 * Embedding: text-embedding-004
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

export class GeminiClient {
  private client: GoogleGenerativeAI
  private chatModel: GenerativeModel
  private embedModel: GenerativeModel

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY
    if (!key) {
      throw new Error('[Gemini] API key not configured')
    }

    this.client = new GoogleGenerativeAI(key)
    this.chatModel = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    this.embedModel = this.client.getGenerativeModel({ model: 'text-embedding-004' })
  }

  /**
   * チャット生成（ストリーミング）
   */
  async *chatStream(
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): AsyncGenerator<string, void, unknown> {
    try {
      // メッセージを Gemini形式に変換
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

      const lastMessage = messages[messages.length - 1].content

      const chat = this.chatModel.startChat({
        history,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      })

      const result = await chat.sendMessageStream(lastMessage)

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          yield text
        }
      }
    } catch (error) {
      console.error('[Gemini] Chat stream error:', error)
      throw error
    }
  }

  /**
   * チャット生成（一括）
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<string> {
    try {
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

      const lastMessage = messages[messages.length - 1].content

      const chat = this.chatModel.startChat({
        history,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      })

      const result = await chat.sendMessage(lastMessage)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('[Gemini] Chat error:', error)
      throw error
    }
  }

  /**
   * テキストの埋め込みベクトルを生成
   */
  async embed(text: string): Promise<number[]> {
    try {
      const result = await this.embedModel.embedContent(text)
      return result.embedding.values
    } catch (error) {
      console.error('[Gemini] Embedding error:', error)
      throw error
    }
  }

  /**
   * 複数のテキストを一括で埋め込み
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await Promise.all(texts.map((text) => this.embed(text)))
      return embeddings
    } catch (error) {
      console.error('[Gemini] Batch embedding error:', error)
      throw error
    }
  }
}

// シングルトンインスタンス
let geminiInstance: GeminiClient | null = null

export function getGeminiClient(): GeminiClient {
  if (!geminiInstance) {
    geminiInstance = new GeminiClient()
  }
  return geminiInstance
}
