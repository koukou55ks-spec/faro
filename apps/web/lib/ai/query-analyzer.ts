/**
 * Query Analyzer - Intelligent query understanding for RAG
 *
 * ユーザーの質問を解析し、必要な情報タイプ・カテゴリ・年度を自動判定する。
 * Claude Codeと同様のアプローチ：キーワードベース + AI判定のハイブリッド。
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { DocumentType } from './knowledge-base'

export interface QueryAnalysis {
  types: DocumentType[]
  category?: string
  year?: number
  intent: QueryIntent
  confidence: number
}

export type QueryIntent =
  | 'tax_calculation'      // 税額計算
  | 'deduction_inquiry'    // 控除に関する質問
  | 'filing_procedure'     // 申告手続き
  | 'general_advice'       // 一般的なアドバイス
  | 'simulation'           // シミュレーション
  | 'document_request'     // 書類に関する質問
  | 'profile_inquiry'      // プロフィール情報確認
  | 'other'                // その他

export class QueryAnalyzer {
  private genAI: GoogleGenerativeAI
  private model: GenerativeModel

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY not found')
    }

    this.genAI = new GoogleGenerativeAI(geminiKey)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-002',
    })
  }

  /**
   * Analyze query to determine required information types
   *
   * @param query - User query
   * @returns Query analysis result
   */
  async analyze(query: string): Promise<QueryAnalysis> {
    try {
      // 1. Fast keyword-based analysis (fallback)
      const keywordAnalysis = this.keywordAnalysis(query)

      // 2. AI-based analysis for complex queries
      if (this.isComplexQuery(query)) {
        const aiAnalysis = await this.aiAnalysis(query)
        return {
          ...aiAnalysis,
          // Merge keyword and AI results
          types: Array.from(new Set([...keywordAnalysis.types, ...aiAnalysis.types])),
        }
      }

      return keywordAnalysis
    } catch (error) {
      console.error('[QueryAnalyzer] Analysis error:', error)
      // Fallback to keyword analysis
      return this.keywordAnalysis(query)
    }
  }

  /**
   * Keyword-based analysis (fast, reliable)
   */
  private keywordAnalysis(query: string): QueryAnalysis {
    const types: DocumentType[] = []
    let category: string | undefined
    let year: number | undefined
    let intent: QueryIntent = 'other'
    let confidence = 0.7

    const lowerQuery = query.toLowerCase()

    // Income-related keywords
    if (/年収|所得|収入|給料|給与|賃金|報酬/.test(query)) {
      types.push('profile')
      category = 'income'
      confidence = 0.9
    }

    // Family-related keywords
    if (/配偶者|夫|妻|家族|扶養|子供|子ども|親|父|母/.test(query)) {
      types.push('profile')
      category = 'family'
      confidence = 0.9
    }

    // Tax document keywords
    if (/確定申告|源泉徴収|医療費|領収書|証明書|申告書/.test(query)) {
      types.push('tax_doc')
      intent = 'document_request'
      confidence = 0.95
    }

    // Deduction keywords
    if (/控除|ふるさと納税|寄付|医療費|社会保険|生命保険|地震保険/.test(query)) {
      types.push('profile', 'tax_doc')
      intent = 'deduction_inquiry'
      confidence = 0.9
    }

    // Simulation keywords
    if (/シミュレーション|計算|試算|見積もり|どのくらい|いくら/.test(query)) {
      types.push('profile', 'simulation')
      intent = 'simulation'
      confidence = 0.85
    }

    // Housing keywords
    if (/住宅|ローン|不動産|マンション|家|持ち家|賃貸/.test(query)) {
      types.push('profile')
      category = 'housing'
      confidence = 0.9
    }

    // Investment keywords
    if (/投資|株|配当|NISA|iDeCo|つみたて|資産運用/.test(query)) {
      types.push('profile')
      category = 'investment'
      confidence = 0.9
    }

    // Insurance keywords
    if (/保険|医療保険|生命保険|地震保険|介護保険/.test(query)) {
      types.push('profile')
      category = 'insurance'
      confidence = 0.9
    }

    // Past conversation keywords
    if (/前|以前|さっき|先ほど|この前|過去|履歴/.test(query)) {
      types.push('qa_history')
      confidence = 0.8
    }

    // Extract year
    const currentYear = new Date().getFullYear()
    const yearMatch = query.match(/(\d{4})年/)
    if (yearMatch) {
      year = parseInt(yearMatch[1])
    } else if (/今年|本年/.test(query)) {
      year = currentYear
    } else if (/来年/.test(query)) {
      year = currentYear + 1
    } else if (/去年|昨年/.test(query)) {
      year = currentYear - 1
    }

    // Determine intent if not set
    if (intent === 'other') {
      if (/計算|税額|いくら/.test(query)) {
        intent = 'tax_calculation'
      } else if (/手続き|方法|やり方|どうやって/.test(query)) {
        intent = 'filing_procedure'
      } else if (/教えて|知りたい|わからない|質問/.test(query)) {
        intent = 'general_advice'
      } else if (/私の|自分の|マイページ/.test(query)) {
        intent = 'profile_inquiry'
      }
    }

    // Default to profile if no types detected
    if (types.length === 0) {
      types.push('profile')
      confidence = 0.5
    }

    return { types, category, year, intent, confidence }
  }

  /**
   * AI-based analysis for complex queries
   */
  private async aiAnalysis(query: string): Promise<QueryAnalysis> {
    const prompt = `
あなたは税務アドバイザーのアシスタントです。
ユーザーの質問を分析し、回答に必要な情報タイプを判定してください。

質問: "${query}"

以下のJSON形式で回答してください:
{
  "types": ["profile", "tax_doc", "qa_history", "simulation", "custom_tab"],
  "category": "income | family | housing | insurance | investment | deduction | other",
  "year": 2024,
  "intent": "tax_calculation | deduction_inquiry | filing_procedure | general_advice | simulation | document_request | profile_inquiry | other",
  "confidence": 0.9
}

types: 必要な情報タイプの配列（複数可）
- profile: ユーザーの基本情報（年収、家族構成など）
- tax_doc: 税務書類（確定申告書、領収書など）
- qa_history: 過去の質問・回答
- simulation: シミュレーション結果
- custom_tab: カスタムタブの情報

category: 情報のカテゴリ（1つ）
year: 対象年度（明示されている場合のみ）
intent: 質問の意図
confidence: 判定の信頼度（0.0-1.0）

JSONのみを返してください。説明は不要です。
`

    try {
      const result = await this.model.generateContent(prompt)
      const text = result.response.text()

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const analysis = JSON.parse(jsonMatch[0])

      return {
        types: analysis.types || ['profile'],
        category: analysis.category,
        year: analysis.year,
        intent: analysis.intent || 'other',
        confidence: analysis.confidence || 0.7,
      }
    } catch (error) {
      console.error('[QueryAnalyzer] AI analysis error:', error)
      throw error
    }
  }

  /**
   * Check if query is complex and requires AI analysis
   */
  private isComplexQuery(query: string): boolean {
    // Complex queries have multiple clauses, negations, or conditional logic
    const complexPatterns = [
      /もし.*なら/,           // Conditional
      /.*と.*の違い/,          // Comparison
      /.*だけど.*したい/,      // Conjunction with intent
      /.*場合.*どう/,          // Scenario-based
      /.*より.*の方が/,        // Preference
      /.*ではなく/,            // Negation
    ]

    return complexPatterns.some((pattern) => pattern.test(query))
  }

  /**
   * Get recommended documents based on intent
   */
  getRecommendedTypes(intent: QueryIntent): DocumentType[] {
    const recommendations: Record<QueryIntent, DocumentType[]> = {
      tax_calculation: ['profile', 'tax_doc', 'simulation'],
      deduction_inquiry: ['profile', 'tax_doc'],
      filing_procedure: ['tax_doc', 'qa_history'],
      general_advice: ['profile', 'qa_history'],
      simulation: ['profile', 'simulation'],
      document_request: ['tax_doc'],
      profile_inquiry: ['profile'],
      other: ['profile', 'qa_history'],
    }

    return recommendations[intent] || ['profile']
  }
}
