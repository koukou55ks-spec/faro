/**
 * ゲストユーザー向けチャットAPI
 * - データベース不要
 * - ローカルストレージで履歴管理
 * - 1日50回まで無料利用可能
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  withErrorHandler,
  AppError,
  ErrorCode,
  validateRequired,
  wrapExternalApiError,
} from '../../../../../lib/api/errorHandler'
import { checkGuestRatelimit } from '../../../../../lib/ratelimit'

async function handler(request: NextRequest) {
  // 環境変数チェック
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Gemini API key not configured',
      500
    )
  }

  const body = await request.json()
  const { message, guestId, conversationHistory = [] } = body

  // バリデーション
  validateRequired(body, ['message', 'guestId'])

  // レート制限チェック（1日50回）
  const ratelimitResult = await checkGuestRatelimit(guestId)

  if (!ratelimitResult.success) {
    throw new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      '無料プランでは1日50回までご利用いただけます。続けてご利用いただくには、アカウント登録（無料）をお願いします。',
      429,
      {
        limit: ratelimitResult.limit,
        remaining: ratelimitResult.remaining,
        reset: new Date(ratelimitResult.reset).toISOString(),
      }
    )
  }

  // Gemini APIで回答生成
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

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

  // 回答生成（ストリーミング）
  try {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream(prompt)

          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              // SSE形式でチャンクを送信
              const data = JSON.stringify({ content: text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // メタデータを送信
          const metadata = JSON.stringify({
            usage: {
              current: ratelimitResult.limit - ratelimitResult.remaining,
              limit: ratelimitResult.limit,
              remaining: ratelimitResult.remaining,
              reset: new Date(ratelimitResult.reset).toISOString(),
              plan: 'guest'
            },
            timestamp: new Date().toISOString()
          })
          controller.enqueue(encoder.encode(`data: ${metadata}\n\n`))

          // 完了メッセージ
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('[Guest Chat] Streaming error:', error)
          controller.error(error)
        }
      }
    })

    // ストリーミングレスポンスを返す
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    throw wrapExternalApiError('Gemini API', error)
  }
}

export const POST = withErrorHandler(handler as any)
