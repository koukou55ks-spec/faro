import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AgentFactory } from '../../../../lib/ai/agents'

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

// GET /api/agent/suggestions - エージェント提案一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Authorization ヘッダーからトークン取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // ユーザー認証
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, viewed, acted, dismissed
    const priority = searchParams.get('priority') // low, medium, high, urgent

    // ベースクエリ
    let query = supabase
      .from('agent_suggestions')
      .select('*')
      .eq('user_id', user.id)

    // 有効期限が切れていないもののみ
    const now = new Date().toISOString()
    query = query.or(`expires_at.is.null,expires_at.gt.${now}`)

    // フィルタリング
    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    // 優先度と作成日時でソート
    query = query.order('priority', { ascending: false })
    query = query.order('created_at', { ascending: false })

    const { data: suggestions, error: suggestionsError } = await query

    if (suggestionsError) {
      console.error('[Agent Suggestions API] Error fetching suggestions:', suggestionsError)
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ suggestions: suggestions || [] }, { status: 200 })
  } catch (error) {
    console.error('[Agent Suggestions API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/agent/suggestions - エージェント提案を生成（AI実行）
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Authorization ヘッダーからトークン取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // ユーザー認証
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // ユーザープロフィール取得
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // ライフイベント取得
    const { data: lifeEvents } = await supabase
      .from('user_life_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })

    // AIエージェントで提案を生成
    let aiSuggestions: Array<{
      type: string
      title: string
      message: string
      action_url: string
      priority: 'low' | 'medium' | 'high' | 'urgent'
      confidence_score: number
      reasoning: string
      metadata?: any
    }> = []
    try {
      const advisor = AgentFactory.getPersonalizedAdvisor()
      aiSuggestions = await advisor.generateSuggestions(profile, lifeEvents || [])
      console.log('[Agent Suggestions API] AI generated', aiSuggestions.length, 'suggestions')
    } catch (error) {
      console.error('[Agent Suggestions API] AI generation error:', error)
      // AIが失敗してもフォールバック処理を続行
    }

    // AI提案を既存チェックして重複を避ける
    const newSuggestions: Array<any> = []
    for (const aiSug of aiSuggestions) {
      // 既に同じタイプの提案がpendingで存在するかチェック
      const { data: existingSuggestion } = await supabase
        .from('agent_suggestions')
        .select('id')
        .eq('user_id', user.id)
        .eq('suggestion_type', aiSug.type)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle()

      if (!existingSuggestion) {
        newSuggestions.push({
          user_id: user.id,
          suggestion_type: aiSug.type,
          title: aiSug.title,
          message: aiSug.message,
          action_url: aiSug.action_url,
          priority: aiSug.priority,
          confidence_score: aiSug.confidence_score,
          reasoning: aiSug.reasoning,
          metadata: aiSug.metadata || {}
        })
      }
    }

    // 提案をDBに保存
    if (newSuggestions.length > 0) {
      const { data: insertedSuggestions, error: insertError } = await supabase
        .from('agent_suggestions')
        .insert(newSuggestions)
        .select()

      if (insertError) {
        console.error('[Agent Suggestions API] Error inserting suggestions:', insertError)
      }

      return NextResponse.json({
        suggestions: insertedSuggestions || [],
        count: insertedSuggestions?.length || 0
      }, { status: 201 })
    }

    return NextResponse.json({
      suggestions: [],
      count: 0,
      message: 'No new suggestions generated'
    }, { status: 200 })
  } catch (error) {
    console.error('[Agent Suggestions API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
