/**
 * 簡易RAGシステム（Retrieval-Augmented Generation）
 * Phase 1用のシンプルな実装
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export class SimpleRAG {
  private gemini: GoogleGenerativeAI
  private embedModel: any
  private chatModel: any
  private supabase: any

  constructor() {
    // 環境変数の安全な読み込み（プロセスクラッシュ防止）
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[RAG] GEMINI_API_KEY not found in environment variables')
      throw new Error('Gemini API key not configured')
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[RAG] Supabase credentials not found in environment variables')
      throw new Error('Supabase credentials not configured')
    }

    try {
      this.gemini = new GoogleGenerativeAI(apiKey)
      this.embedModel = this.gemini.getGenerativeModel({ model: 'text-embedding-004' })
      this.chatModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })

      this.supabase = createClient(supabaseUrl, supabaseKey)
    } catch (error) {
      console.error('[RAG] Initialization error:', error)
      throw new Error('Failed to initialize RAG system')
    }
  }

  /**
   * テキストをベクトル化
   */
  async embed(text: string): Promise<number[]> {
    try {
      const result = await this.embedModel.embedContent(text)
      return result.embedding.values
    } catch (error) {
      console.error('[RAG] Embedding error:', error)
      throw error
    }
  }

  /**
   * ベクトル検索
   */
  async search(query: string, userId: string, limit: number = 5): Promise<any[]> {
    try {
      const embedding = await this.embed(query)

      // pgvectorで類似検索
      const { data, error } = await this.supabase.rpc('vector_search', {
        query_embedding: embedding,
        filter_user_id: userId,
        match_count: limit,
        match_threshold: 0.7
      })

      if (error) {
        console.error('[RAG] Search error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('[RAG] Search failed:', error)
      return []
    }
  }

  /**
   * RAG付き回答生成
   */
  async generateWithContext(
    query: string,
    userId: string,
    systemPrompt?: string
  ): Promise<string> {
    try {
      // 関連コンテキストを検索
      const contexts = await this.search(query, userId)

      // コンテキストを整形
      const contextText = contexts.length > 0
        ? `\n\n関連情報:\n${contexts.map(c => c.content).join('\n\n')}`
        : ''

      // プロンプト構築
      const prompt = `
${systemPrompt || 'あなたは日本の税金に関する専門的なアドバイザーです。'}

${contextText}

ユーザーの質問: ${query}

回答:
`

      // 回答生成
      const result = await this.chatModel.generateContent(prompt)
      const response = result.response
      return response.text()
    } catch (error) {
      console.error('[RAG] Generation error:', error)
      throw error
    }
  }

  /**
   * メッセージを保存してベクトル化
   */
  async saveAndIndex(
    content: string,
    userId: string,
    conversationId: string,
    role: 'user' | 'assistant'
  ): Promise<void> {
    try {
      const embedding = await this.embed(content)

      const { error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role,
          content,
          embedding
        })

      if (error) {
        console.error('[RAG] Save error:', error)
      }
    } catch (error) {
      console.error('[RAG] Index error:', error)
    }
  }
}