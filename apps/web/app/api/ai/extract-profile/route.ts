import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Edge Runtimeをコメントアウト（OpenTelemetryの互換性問題のため）
// export const runtime = 'edge'

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }
  return new GoogleGenerativeAI(apiKey)
}

// チャット履歴からユーザー情報を抽出
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const gemini = getGeminiClient()

    // Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, conversationId } = body as {
      messages: Array<{ role: string; content: string }>
      conversationId?: string
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // ユーザーメッセージのみを抽出
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n')

    // Gemini APIで情報抽出
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const extractionPrompt = `
あなたはユーザーの会話から重要な情報を抽出するAIアシスタントです。
以下のユーザーの質問・発言から、以下の情報をJSON形式で抽出してください。

【抽出すべき情報】
1. life_events: ライフイベント（結婚、出産、転職、住宅購入など）
   - event_type: "marriage" | "child_birth" | "job_change" | "house_purchase" | "retirement" など
   - event_date: 日付が分かれば（YYYY-MM-DD形式）
   - event_year: 年だけでも
   - description: 説明
   - confidence: 確信度 (0-1)

2. interests: 関心事（["NISA", "iDeCo", "ふるさと納税", "住宅ローン控除", "医療費控除"]など）

3. concerns: 不安・悩み（["税金対策", "年金不安", "医療費", "老後資金", "教育費"]など）

4. profile_updates: プロフィール更新情報
   - age: 年齢
   - occupation: 職業
   - annual_income: 年収（数値）
   - marital_status: "single" | "married" | "divorced" | "widowed"
   - num_children: 子供の数
   - has_mortgage: 住宅ローンの有無
   - has_investments: 投資の有無

5. questions: 質問のカテゴリ分類
   - category: "税金" | "年金" | "健康保険" | "投資" | "住宅" | "教育" | "相続"
   - keywords: キーワード配列

【ユーザーの発言】
${userMessages}

【出力形式】
JSONのみを出力してください（説明文は不要）。情報が見つからない場合はnullまたは空配列にしてください。

{
  "life_events": [...],
  "interests": [...],
  "concerns": [...],
  "profile_updates": {...},
  "questions": [...]
}
`

    const result = await model.generateContent(extractionPrompt)
    const responseText = result.response.text()

    // JSONを抽出（マークダウンのコードブロックを除去）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[AI Extract] Failed to parse JSON from response:', responseText)
      return NextResponse.json({ error: 'Failed to parse extraction result' }, { status: 500 })
    }

    const extracted = JSON.parse(jsonMatch[0])

    // データベースに保存
    const savePromises = []

    // 1. ライフイベントを保存
    if (extracted.life_events && extracted.life_events.length > 0) {
      for (const event of extracted.life_events) {
        savePromises.push(
          supabase
            .from('user_life_events')
            .insert({
              user_id: user.id,
              event_type: event.event_type,
              event_date: event.event_date || null,
              event_year: event.event_year || null,
              description: event.description || null,
              auto_detected: true,
              confidence_score: event.confidence || 0.5,
              metadata: event.metadata || {}
            })
        )
      }
    }

    // 2. プロフィールを更新
    if (extracted.profile_updates && Object.keys(extracted.profile_updates).length > 0) {
      // 既存プロフィールを取得
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        // 更新
        savePromises.push(
          supabase
            .from('user_profiles')
            .update({
              ...extracted.profile_updates,
              interests: extracted.interests && extracted.interests.length > 0
                ? Array.from(new Set([...(existingProfile.interests || []), ...extracted.interests]))
                : existingProfile.interests,
              concerns: extracted.concerns && extracted.concerns.length > 0
                ? Array.from(new Set([...(existingProfile.concerns || []), ...extracted.concerns]))
                : existingProfile.concerns,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
        )
      } else {
        // 新規作成
        savePromises.push(
          supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              ...extracted.profile_updates,
              interests: extracted.interests || [],
              concerns: extracted.concerns || []
            })
        )
      }
    } else if ((extracted.interests && extracted.interests.length > 0) ||
               (extracted.concerns && extracted.concerns.length > 0)) {
      // プロフィール更新情報はないが、関心事や不安がある場合
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        savePromises.push(
          supabase
            .from('user_profiles')
            .update({
              interests: extracted.interests && extracted.interests.length > 0
                ? Array.from(new Set([...(existingProfile.interests || []), ...extracted.interests]))
                : existingProfile.interests,
              concerns: extracted.concerns && extracted.concerns.length > 0
                ? Array.from(new Set([...(existingProfile.concerns || []), ...extracted.concerns]))
                : existingProfile.concerns,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
        )
      } else {
        // プロフィールがない場合は作成
        savePromises.push(
          supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              interests: extracted.interests || [],
              concerns: extracted.concerns || []
            })
        )
      }
    }

    // 3. 質問履歴を保存
    if (extracted.questions && extracted.questions.length > 0) {
      for (const q of extracted.questions) {
        const userMessage = messages.find(m => m.role === 'user')
        if (userMessage) {
          savePromises.push(
            supabase
              .from('user_question_history')
              .insert({
                user_id: user.id,
                question: userMessage.content,
                category: q.category || null,
                keywords: q.keywords || [],
                detected_concerns: extracted.concerns || []
              })
          )
        }
      }
    }

    // すべての保存処理を実行
    await Promise.all(savePromises)

    console.log('[AI Extract] Successfully extracted and saved user information:', {
      user_id: user.id,
      life_events: extracted.life_events?.length || 0,
      interests: extracted.interests?.length || 0,
      concerns: extracted.concerns?.length || 0,
      questions: extracted.questions?.length || 0
    })

    return NextResponse.json({
      success: true,
      extracted,
      saved: {
        life_events: extracted.life_events?.length || 0,
        interests: extracted.interests?.length || 0,
        concerns: extracted.concerns?.length || 0,
        questions: extracted.questions?.length || 0
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[AI Extract] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
