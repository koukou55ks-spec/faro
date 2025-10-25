/**
 * ゲストユーザー向けチャットAPI
 * - データベース不要
 * - ローカルストレージで履歴管理
 * - 1日5回まで無料利用可能
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// レート制限チェック用（メモリベース、本番ではRedis推奨）
const guestUsage = new Map<string, { count: number; date: string }>()

export async function POST(request: NextRequest) {
  try {
    // 環境変数チェック
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { message, guestId, conversationHistory = [] } = body

    // バリデーション
    if (!message || !guestId) {
      return NextResponse.json(
        { error: 'メッセージとゲストIDが必要です' },
        { status: 400 }
      )
    }

    // レート制限チェック（1日5回）
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const usage = guestUsage.get(guestId)

    if (usage && usage.date === today && usage.count >= 5) {
      return NextResponse.json(
        {
          error: '本日の利用制限に達しました',
          limit: 5,
          usage: usage.count,
          message: '無料プランでは1日5回までご利用いただけます。続けてご利用いただくには、アカウント登録（無料）をお願いします。'
        },
        { status: 429 }
      )
    }

    // 使用量を更新
    if (!usage || usage.date !== today) {
      guestUsage.set(guestId, { count: 1, date: today })
    } else {
      guestUsage.set(guestId, { count: usage.count + 1, date: today })
    }

    // Gemini APIで回答生成
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // システムプロンプト
    const systemPrompt = `
あなたは「Faro」という日本の税金・お金の専門AIアシスタントです。
以下の特徴を持って回答してください：

- 親しみやすく、分かりやすい説明を心がける
- 専門用語は必ず解説を添える
- 具体例を使った実践的なアドバイス
- 最新の日本の税制に基づく情報
- ユーザーの質問に対して、段階的に丁寧に説明

回答は以下の構成を推奨：
1. 要点を簡潔に（2-3行）
2. 詳しい説明
3. 具体例
4. 次のステップや関連情報
`

    // 会話履歴を含めたプロンプト構築
    let conversationContext = ''
    if (conversationHistory.length > 0) {
      conversationContext = '\n\n### 会話履歴\n'
      conversationHistory.slice(-4).forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}\n`
      })
    }

    const prompt = `${systemPrompt}\n${conversationContext}\n\nユーザーの質問: ${message}\n\n回答:`

    // 回答生成
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // 現在の使用状況を取得
    const currentUsage = guestUsage.get(guestId)!

    return NextResponse.json({
      success: true,
      message: response,
      timestamp: new Date().toISOString(),
      usage: {
        current: currentUsage.count,
        limit: 5,
        remaining: 5 - currentUsage.count,
        plan: 'guest'
      }
    })

  } catch (error) {
    console.error('[Guest Chat API] エラー:', error)
    return NextResponse.json(
      {
        error: 'チャット処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}
