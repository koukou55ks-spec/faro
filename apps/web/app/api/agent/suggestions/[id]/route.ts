import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// PATCH /api/agent/suggestions/[id] - エージェント提案のステータス更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json()
    const { id: suggestionId } = await params

    // ステータス更新
    const updateData: any = {
      status: body.status
    }

    // タイムスタンプの設定
    if (body.status === 'acted') {
      updateData.acted_at = new Date().toISOString()
    } else if (body.status === 'dismissed') {
      updateData.dismissed_at = new Date().toISOString()
    }

    const { data: suggestion, error: updateError } = await supabase
      .from('agent_suggestions')
      .update(updateData)
      .eq('id', suggestionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[Agent Suggestions API] Error updating suggestion:', updateError)

      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Suggestion not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({ suggestion }, { status: 200 })
  } catch (error) {
    console.error('[Agent Suggestions API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
