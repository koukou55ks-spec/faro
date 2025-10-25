/**
 * AI エージェントシステム
 * タスク特化型のAIエージェント
 */

import { getGeminiClient } from './gemini'
import { SimpleRAG } from './rag'

export interface AgentContext {
  userId: string
  conversationId?: string
  history?: Array<{ role: string; content: string }>
}

export interface AgentResponse {
  content: string
  sources?: Array<{
    type: string
    title: string
    snippet: string
  }>
}

/**
 * 税務相談エージェント
 */
export class TaxAdvisorAgent {
  private gemini = getGeminiClient()
  private rag: SimpleRAG | null = null

  async initialize() {
    try {
      this.rag = new SimpleRAG()
    } catch (error) {
      console.warn('[TaxAdvisorAgent] RAG initialization failed:', error)
    }
  }

  async chat(message: string, context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `あなたは日本の税務に精通した税理士アシスタントです。
ユーザーの質問に対して、正確で分かりやすい回答を提供してください。

以下の点に注意してください:
- 最新の税法に基づいた情報を提供する
- 専門用語は分かりやすく説明する
- 具体例を交えて説明する
- 不確かな情報は明示する
- 必要に応じて税理士への相談を推奨する`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context.history || []),
      { role: 'user', content: message },
    ]

    // RAGで関連情報を検索
    let sources: AgentResponse['sources'] = []
    if (this.rag && context.userId) {
      try {
        const searchResults = await this.rag.search(message, context.userId, 3)
        sources = searchResults.map((result) => ({
          type: result.type || 'document',
          title: result.title || 'Unknown',
          snippet: result.content?.substring(0, 200) || '',
        }))

        // RAG結果をコンテキストに追加
        if (sources.length > 0) {
          const contextInfo = sources
            .map((s) => `[${s.type}] ${s.title}: ${s.snippet}`)
            .join('\n\n')
          messages.splice(messages.length - 1, 0, {
            role: 'system',
            content: `参考情報:\n${contextInfo}`,
          })
        }
      } catch (error) {
        console.error('[TaxAdvisorAgent] RAG search error:', error)
      }
    }

    const content = await this.gemini.chat(messages, {
      temperature: 0.7,
      maxTokens: 2048,
    })

    return { content, sources }
  }
}

/**
 * 家計簿分析エージェント
 */
export class BudgetAnalystAgent {
  private gemini = getGeminiClient()

  async analyze(
    transactions: Array<{
      date: string
      category: string
      amount: number
      description: string
    }>
  ): Promise<AgentResponse> {
    const systemPrompt = `あなたは家計管理の専門家です。
ユーザーの家計簿データを分析し、改善提案を提供してください。

以下の点に注目してください:
- 支出の傾向とパターン
- 節約できる可能性のある項目
- カテゴリ別の割合
- 異常な支出の検出`

    const transactionSummary = transactions
      .slice(0, 100) // 最新100件
      .map((t) => `${t.date}: ${t.category} - ¥${t.amount} (${t.description})`)
      .join('\n')

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `以下の家計簿データを分析してください:\n\n${transactionSummary}`,
      },
    ]

    const content = await this.gemini.chat(messages, {
      temperature: 0.5,
      maxTokens: 1500,
    })

    return { content }
  }
}

/**
 * ドキュメント要約エージェント
 */
export class DocumentSummarizerAgent {
  private gemini = getGeminiClient()

  async summarize(
    document: string,
    options?: {
      maxLength?: number
      focus?: string
    }
  ): Promise<AgentResponse> {
    const systemPrompt = `あなたはドキュメント要約の専門家です。
以下の文書を簡潔に要約してください。

要件:
- 重要なポイントを漏らさない
- 簡潔で分かりやすい文章
- 箇条書きで構造化${options?.focus ? `\n- 特に「${options.focus}」に関する情報を重視` : ''}`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `以下の文書を要約してください:\n\n${document}` },
    ]

    const content = await this.gemini.chat(messages, {
      temperature: 0.3,
      maxTokens: options?.maxLength || 1000,
    })

    return { content }
  }
}

/**
 * パーソナライズドアドバイザーエージェント
 * ユーザープロフィールに基づいて提案を生成
 */
export class PersonalizedAdvisorAgent {
  private gemini = getGeminiClient()

  async generateSuggestions(userProfile: any, lifeEvents: any[]): Promise<Array<{
    type: string
    title: string
    message: string
    action_url: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    confidence_score: number
    reasoning: string
    metadata?: any
  }>> {
    const systemPrompt = `あなたは日本の税務・資産運用のパーソナライズドアドバイザーです。
ユーザーのプロフィール情報を分析し、最適な節税・資産運用の提案を生成してください。

提案の形式:
- type: 提案タイプ（tax_deadline, deduction_opportunity, investment_advice, life_event_reminder等）
- title: 簡潔なタイトル（20文字以内）
- message: 詳細なメッセージ（100文字程度）
- action_url: 関連ページのURL
- priority: 優先度（low, medium, high, urgent）
- confidence_score: 確信度（0.0-1.0）
- reasoning: 提案理由

重要な観点:
- 年収・家族構成に基づく控除機会
- 今月・今期の税務期限
- ライフイベントに関連する税制優遇
- NISA・iDeCoなどの投資機会
- 具体的な金額を含める`

    const profileSummary = `
【基本情報】
- 年齢: ${userProfile?.age || '未設定'}歳
- 職業: ${userProfile?.occupation || '未設定'}
- 雇用形態: ${userProfile?.employment_type || '未設定'}
- 年収: ${userProfile?.annual_income ? `${userProfile.annual_income.toLocaleString()}円` : '未設定'}
- 世帯年収: ${userProfile?.household_income ? `${userProfile.household_income.toLocaleString()}円` : '未設定'}

【家族構成】
- 婚姻状況: ${userProfile?.marital_status || '未設定'}
- 子供: ${userProfile?.num_children || 0}人
- 扶養家族: ${userProfile?.num_dependents || 0}人

【金融状況】
- 住宅ローン: ${userProfile?.has_mortgage ? 'あり' : 'なし'}
- 貯蓄: ${userProfile?.has_savings ? 'あり' : 'なし'}
- 投資: ${userProfile?.has_investments ? 'あり' : 'なし'}

【関心事】
${userProfile?.interests?.join(', ') || 'なし'}

【今後のライフイベント】
${lifeEvents.map(e => `- ${e.event_type} (${e.event_date || e.event_year})`).join('\n') || 'なし'}
`

    const now = new Date()
    const month = now.getMonth() + 1

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `現在: ${now.getFullYear()}年${month}月\n\n${profileSummary}\n\n上記のユーザーに対して、最も重要な提案を3-5個生成してください。JSON配列形式で返してください。` },
    ]

    const response = await this.gemini.chat(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    })

    // JSONをパース
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0])
        return suggestions
      }
    } catch (error) {
      console.error('[PersonalizedAdvisorAgent] JSON parse error:', error)
    }

    return []
  }
}

// エージェントファクトリー
export class AgentFactory {
  private static taxAdvisor: TaxAdvisorAgent | null = null
  private static budgetAnalyst: BudgetAnalystAgent | null = null
  private static documentSummarizer: DocumentSummarizerAgent | null = null
  private static personalizedAdvisor: PersonalizedAdvisorAgent | null = null

  static async getTaxAdvisor(): Promise<TaxAdvisorAgent> {
    if (!this.taxAdvisor) {
      this.taxAdvisor = new TaxAdvisorAgent()
      await this.taxAdvisor.initialize()
    }
    return this.taxAdvisor
  }

  static getBudgetAnalyst(): BudgetAnalystAgent {
    if (!this.budgetAnalyst) {
      this.budgetAnalyst = new BudgetAnalystAgent()
    }
    return this.budgetAnalyst
  }

  static getDocumentSummarizer(): DocumentSummarizerAgent {
    if (!this.documentSummarizer) {
      this.documentSummarizer = new DocumentSummarizerAgent()
    }
    return this.documentSummarizer
  }

  static getPersonalizedAdvisor(): PersonalizedAdvisorAgent {
    if (!this.personalizedAdvisor) {
      this.personalizedAdvisor = new PersonalizedAdvisorAgent()
    }
    return this.personalizedAdvisor
  }
}
