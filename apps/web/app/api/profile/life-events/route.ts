import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CreateLifeEventRequest } from '../../../../lib/types/userProfile'

export const runtime = 'edge'

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key)
}

// GET /api/profile/life-events - ユーザーのライフイベント一覧取得
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

    // ライフイベント取得（日付順）
    const { data: events, error: eventsError } = await supabase
      .from('user_life_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('event_year', { ascending: false, nullsFirst: false })

    if (eventsError) {
      console.error('[Life Events API] Error fetching events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch life events' },
        { status: 500 }
      )
    }

    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error('[Life Events API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/profile/life-events - ライフイベント作成
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

    const body = await request.json() as CreateLifeEventRequest

    // ライフイベント作成
    const { data: event, error: createError } = await supabase
      .from('user_life_events')
      .insert({
        user_id: user.id,
        ...body
      })
      .select()
      .single()

    if (createError) {
      console.error('[Life Events API] Error creating event:', createError)
      return NextResponse.json(
        { error: 'Failed to create life event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('[Life Events API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
