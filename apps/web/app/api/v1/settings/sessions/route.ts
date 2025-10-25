import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'

// GET: アクティブセッションの取得
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // アクティブセッションを取得
    const { data: sessions, error } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .order('last_activity', { ascending: false })

    if (error) {
      console.error('[Sessions API] Failed to fetch sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (error) {
    console.error('[Sessions API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: セッションの削除（ログアウト）
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // 特定のセッションを削除
    if (sessionId === 'all') {
      // 全セッションを削除（全デバイスからログアウト）
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('[Sessions API] Failed to delete all sessions:', error)
        return NextResponse.json({ error: 'Failed to delete sessions' }, { status: 500 })
      }

      return NextResponse.json({ message: 'All sessions deleted' })
    } else {
      // 指定したセッションのみ削除
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id)

      if (error) {
        console.error('[Sessions API] Failed to delete session:', error)
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Session deleted' })
    }
  } catch (error) {
    console.error('[Sessions API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
