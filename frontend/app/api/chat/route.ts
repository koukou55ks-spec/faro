/**
 * Chat API Route - Direct Gemini API Implementation
 * FastAPIを経由せず、Next.js API Routeから直接Gemini APIを呼び出し
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, question, userId, user_id, expert_mode = false, include_user_notes = false, appContext } = body

    // Support both 'message' and 'question' field names
    const userMessage = message || question

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Message or question is required' },
        { status: 400 }
      )
    }

    // Support both userId and user_id
    const actualUserId = userId || user_id

    // Initialize Gemini AI (must be inside function to access env vars)
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }
    const genAI = new GoogleGenerativeAI(apiKey)

    // Initialize Supabase client
    const supabase = await createClient()

    // Get user notes context if requested
    let userNotesContext = ''
    if (include_user_notes && actualUserId) {
      try {
        const { data: notes } = await supabase
          .from('user_notes')
          .select('title, content')
          .eq('user_id', actualUserId)
          .limit(5)

        if (notes && notes.length > 0) {
          userNotesContext = `\n\n【ユーザーのメモ・ノートから関連情報】\n${notes
            .map((note, idx) => `${idx + 1}. ${note.title}\n${note.content.substring(0, 200)}...`)
            .join('\n\n')}`
        }
      } catch (error) {
        console.log('Note context fetch skipped:', error)
      }
    }

    // Get relevant documents from vector database (skip if function doesn't exist)
    const context = await getRelevantContext(supabase, userMessage)

    // Build prompt based on expert mode
    const systemPrompt = expert_mode
      ? buildExpertPrompt()
      : buildNormalPrompt()

    const fullPrompt = `${systemPrompt}

【検索された関連情報】
${context}
${userNotesContext}

【ユーザーの質問】
${userMessage}

【回答】`

    // Call Gemini API with stable model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const answer = response.text()

    return NextResponse.json({
      response: answer,
      answer,
      expert_mode,
      sources: [],
      confidence: 0.85,
      processing_time: 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getRelevantContext(supabase: any, question: string): Promise<string> {
  try {
    // Vector search using pgvector
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: await getEmbedding(question),
      match_threshold: 0.7,
      match_count: 5,
    })

    if (error) {
      console.error('Vector search error:', error)
      return ''
    }

    if (!data || data.length === 0) {
      return '関連する文書が見つかりませんでした。一般的な知識から回答します。'
    }

    return data.map((doc: any) => doc.content).join('\n\n')
  } catch (error) {
    console.error('Error getting context:', error)
    return ''
  }
}

async function getEmbedding(text: string): Promise<number[]> {
  // TODO: Implement embedding generation using Google's embedding model
  // For now, return empty array (will be replaced with actual embedding in Week 4)
  return []
}

function buildNormalPrompt(): string {
  return `あなたは親しみやすいパーソナルCFO（最高財務責任者）です。

【役割】
- ユーザーの税務・財務の最適化をサポート
- Pi風の自然な会話スタイル
- Kasisto風の金融分析力
- Brex風のビジネス洞察

【回答スタイル】
- 優しく、わかりやすい説明
- 具体例を交えて説明
- 次のアクションを提案
- 質問を通じてユーザーの思考を広げる（ソクラテス式対話）

【重要】
- 法的助言ではなく、一般的な情報提供であることを明記
- 不確実な情報は推測せず、専門家への相談を推奨
- ユーザーの状況に合わせてパーソナライズ`
}

function buildExpertPrompt(): string {
  return `あなたは法律順守を最優先する税理士・ファイナンシャルプランナーです。

【エキスパートモード要件】
1. 法的根拠を必ず明記（法律名、条文番号、施行日）
2. リスクと警告を明確に記載（税務調査リスク、罰則、延滞税）
3. 数値計算を正確に実行（税率、控除額、納税額）
4. 手続きの期限を明示（申告期限、納税期限、届出期限）
5. 代替案を複数提示（オプションA/B/Cと各リスク・リターン）

【出力フォーマット】
## 結論
[端的な回答]

## 法的根拠
- 法律名: 〇〇法 第〇条
- 施行日: 20XX年X月X日
- 参照URL: [e-Gov法令検索]

## リスク評価
⚠️ 注意事項:
- リスク1: [説明]
- リスク2: [説明]

## 具体的な計算・手続き
[ステップバイステップで詳細に]

## 代替案
### オプションA: [名称]
- メリット: [...]
- デメリット: [...]
- 推奨度: ★★★☆☆

### オプションB: [名称]
...

## 次のステップ
1. [アクション1]（期限: 20XX/XX/XX）
2. [アクション2]

【重要】
本情報は一般的な参考情報であり、個別の法的助言ではありません。
実際の判断は税理士・弁護士等の専門家にご相談ください。`
}
