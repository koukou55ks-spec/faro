import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'

// GET: ログイン履歴の取得
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

    // クエリパラメータを取得
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // ログイン履歴を取得
    const { data: history, error, count } = await supabase
      .from('login_history')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('login_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Login History API] Failed to fetch history:', error)
      return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 })
    }

    return NextResponse.json({
      history: history || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Login History API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: ログイン履歴の記録
export async function POST(req: NextRequest) {
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

    // リクエスト情報を取得
    const body = await req.json()
    const {
      ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent = req.headers.get('user-agent'),
      device_type,
      location,
      success = true,
    } = body

    // ログイン履歴を記録
    const { data: record, error } = await supabase
      .from('login_history')
      .insert({
        user_id: user.id,
        ip_address,
        user_agent,
        device_type,
        location,
        success,
      })
      .select()
      .single()

    if (error) {
      console.error('[Login History API] Failed to record history:', error)
      return NextResponse.json({ error: 'Failed to record login history' }, { status: 500 })
    }

    return NextResponse.json({ record })
  } catch (error) {
    console.error('[Login History API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
