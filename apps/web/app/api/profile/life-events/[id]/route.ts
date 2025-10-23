import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UpdateLifeEventRequest } from '../../../../../lib/types/userProfile'

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

// PATCH /api/profile/life-events/[id] - ライフイベント更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params

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

    const body = await request.json() as UpdateLifeEventRequest

    // ライフイベント更新（自分のイベントのみ）
    const { data: event, error: updateError } = await supabase
      .from('user_life_events')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)  // セキュリティ: 自分のイベントのみ更新可能
      .select()
      .single()

    if (updateError) {
      console.error('[Life Events API] Error updating event:', updateError)

      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Life event not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update life event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event }, { status: 200 })
  } catch (error) {
    console.error('[Life Events API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile/life-events/[id] - ライフイベント削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params

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

    // ライフイベント削除（自分のイベントのみ）
    const { error: deleteError } = await supabase
      .from('user_life_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)  // セキュリティ: 自分のイベントのみ削除可能

    if (deleteError) {
      console.error('[Life Events API] Error deleting event:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete life event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Life Events API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
