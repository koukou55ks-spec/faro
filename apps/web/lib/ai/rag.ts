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
   * ユーザープロフィール情報を取得してコンテキストに追加
   */
  async getUserContext(userId: string): Promise<string> {
    try {
      // プロフィール情報取得
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!profile) return ''

      // カスタムタブ情報取得（最新5件）
      const { data: tabs } = await this.supabase
        .from('user_custom_tabs')
        .select('id, name, description')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5)

      // ライフイベント取得（直近・今後のイベント）
      const { data: lifeEvents } = await this.supabase
        .from('user_life_events')
        .select('event_type, event_date, description')
        .eq('user_id', userId)
        .order('event_date', { ascending: true })
        .limit(3)

      // コンテキストを整形
      let context = '\n\n### ユーザー情報\n'

      // 基本情報
      if (profile.age) context += `- 年齢: ${profile.age}歳\n`
      if (profile.occupation) context += `- 職業: ${profile.occupation}\n`
      if (profile.employment_type) {
        const empTypeMap: Record<string, string> = {
          'full_time': '正社員',
          'part_time': 'パート・アルバイト',
          'freelance': 'フリーランス',
          'self_employed': '自営業',
          'student': '学生',
          'retired': '退職'
        }
        context += `- 雇用形態: ${empTypeMap[profile.employment_type] || profile.employment_type}\n`
      }

      // 経済情報
      if (profile.annual_income) {
        context += `- 年収: ${profile.annual_income.toLocaleString()}円\n`
      }

      // 家族構成
      if (profile.marital_status) {
        const maritalMap: Record<string, string> = {
          'single': '独身',
          'married': '既婚',
          'divorced': '離婚',
          'widowed': '死別'
        }
        context += `- 婚姻状況: ${maritalMap[profile.marital_status]}\n`
      }
      if (profile.num_children) {
        context += `- 子供: ${profile.num_children}人\n`
      }

      // 関心事
      if (profile.interests && profile.interests.length > 0) {
        context += `- 関心事: ${profile.interests.join(', ')}\n`
      }

      // 金融状況
      const financialStatus = []
      if (profile.has_mortgage) financialStatus.push('住宅ローンあり')
      if (profile.has_savings) financialStatus.push('貯蓄あり')
      if (profile.has_investments) financialStatus.push('投資運用中')
      if (financialStatus.length > 0) {
        context += `- 金融状況: ${financialStatus.join(', ')}\n`
      }

      // カスタムタブ情報
      if (tabs && tabs.length > 0) {
        context += '\n### ユーザーが管理している情報\n'
        tabs.forEach((tab: any) => {
          context += `- ${tab.name}`
          if (tab.description) context += `: ${tab.description}`
          context += '\n'
        })
      }

      // ライフイベント
      if (lifeEvents && lifeEvents.length > 0) {
        context += '\n### 今後のライフイベント\n'
        lifeEvents.forEach((event: any) => {
          const eventTypeMap: Record<string, string> = {
            'marriage': '結婚',
            'child_birth': '出産',
            'house_purchase': '住宅購入',
            'retirement': '退職',
            'job_change': '転職'
          }
          context += `- ${eventTypeMap[event.event_type] || event.event_type}`
          if (event.event_date) {
            const date = new Date(event.event_date)
            context += ` (${date.getFullYear()}年)`
          }
          if (event.description) context += `: ${event.description}`
          context += '\n'
        })
      }

      return context
    } catch (error) {
      console.error('[RAG] Error fetching user context:', error)
      return ''
    }
  }

  /**
   * RAG付き回答生成（マイページ情報統合版）
   */
  async generateWithContext(
    query: string,
    userId: string,
    systemPrompt?: string
  ): Promise<string> {
    try {
      // 関連コンテキストを検索
      const contexts = await this.search(query, userId)

      // ユーザープロフィール情報を取得
      const userContext = await this.getUserContext(userId)

      // コンテキストを整形
      const contextText = contexts.length > 0
        ? `\n\n### 関連する過去の会話\n${contexts.map(c => c.content).join('\n\n')}`
        : ''

      // プロンプト構築
      const prompt = `
${systemPrompt || 'あなたは日本の税金に関する専門的なアドバイザーです。'}

${userContext}

${contextText}

ユーザーの質問: ${query}

回答のポイント:
- ユーザーの状況（年収、家族構成、職業など）を考慮したパーソナライズされたアドバイスを提供してください
- 具体的な金額や例を示す際は、ユーザー情報に基づいて計算してください
- ユーザーが管理している情報や今後のライフイベントがあれば、それを踏まえた提案をしてください

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