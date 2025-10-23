/**
 * シンプルなチャットAPI（Phase 1）
 * 複雑なリポジトリパターンを削除し、直接的な実装
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SimpleRAG } from '../../../../lib/ai/rag'

export async function POST(request: NextRequest) {
  try {
    // 環境変数の早期チェック（プロセスクラッシュ防止）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Chat API] Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { message, conversationId } = body

    // バリデーション
    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      )
    }

    // Supabaseクライアント初期化
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 認証チェック - Authorizationヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // トークンを使ってユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('[Chat API] 認証エラー:', authError)
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      )
    }

    const userId = user.id

    // サブスクリプション状態を確認
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    // 使用量制限を確認
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    const { data: usage, error: usageError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    // 使用量レコードがなければ作成
    if (!usage) {
      await supabase
        .from('usage_limits')
        .insert({
          user_id: userId,
          month: currentMonth,
          ai_messages_count: 0,
          documents_count: 0
        })
    }

    // プランに応じた制限を確認
    const plan = subscription?.plan || 'free'
    const messageLimit = plan === 'pro' ? 1000 : 30 // Pro: 1000回/月, Free: 30回/月
    const currentUsage = usage?.ai_messages_count || 0

    if (currentUsage >= messageLimit) {
      return NextResponse.json(
        {
          error: '月間の利用制限に達しました',
          limit: messageLimit,
          usage: currentUsage,
          plan
        },
        { status: 429 }
      )
    }

    // RAGシステム初期化
    const rag = new SimpleRAG()

    // 会話IDの処理（新規または既存）
    let effectiveConversationId = conversationId

    if (!effectiveConversationId) {
      // 新しい会話を作成
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + '...' // 最初のメッセージをタイトルに
        })
        .select()
        .single()

      if (createError) {
        console.error('[Chat API] 会話作成エラー:', createError)
        return NextResponse.json(
          { error: '会話の作成に失敗しました' },
          { status: 500 }
        )
      }

      effectiveConversationId = newConversation.id
    }

    // ユーザーメッセージを保存
    await rag.saveAndIndex(message, userId, effectiveConversationId, 'user')

    // RAGを使って回答生成
    const systemPrompt = `
あなたは「Faro」という日本の税金専門AIアシスタントです。
以下の特徴を持って回答してください：
- 親しみやすく、分かりやすい説明
- 具体例を使った解説
- 最新の日本の税制に基づく情報
- ユーザーの状況に応じたパーソナライズされたアドバイス
`

    const response = await rag.generateWithContext(message, userId, systemPrompt)

    // アシスタントの回答を保存
    await rag.saveAndIndex(response, userId, effectiveConversationId, 'assistant')

    // 使用量をインクリメント
    await supabase
      .from('usage_limits')
      .update({
        ai_messages_count: (usage?.ai_messages_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('month', currentMonth)

    // レスポンス返却
    return NextResponse.json({
      success: true,
      conversationId: effectiveConversationId,
      message: response,
      timestamp: new Date().toISOString(),
      usage: {
        current: currentUsage + 1,
        limit: messageLimit,
        plan
      }
    })

  } catch (error) {
    console.error('[Chat API] エラー:', error)
    return NextResponse.json(
      {
        error: 'チャット処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}

// 会話履歴取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: '会話IDが必要です' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      )
    }

    // 会話がユーザーのものか確認
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    // メッセージ履歴を取得
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[Chat API] 履歴取得エラー:', error)
      return NextResponse.json(
        { error: '履歴の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    })

  } catch (error) {
    console.error('[Chat API] エラー:', error)
    return NextResponse.json(
      { error: '履歴取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}