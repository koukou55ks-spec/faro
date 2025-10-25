import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CustomTabCreateRequest } from '../../../types/custom-tabs'

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    console.error('[Custom Tabs API] Missing environment variables:', {
      hasUrl: !!url,
      hasKey: !!key
    })
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

// GET /api/custom-tabs - カスタムタブ一覧取得
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

    // カスタムタブ取得（表示順序でソート）
    const { data: tabs, error: tabsError } = await supabase
      .from('user_custom_tabs')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true })

    if (tabsError) {
      console.error('[Custom Tabs API] Error fetching tabs:', tabsError)
      return NextResponse.json(
        { error: 'Failed to fetch tabs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tabs: tabs || [] }, { status: 200 })
  } catch (error) {
    console.error('[Custom Tabs API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/custom-tabs - カスタムタブ作成
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

    const body = await request.json() as CustomTabCreateRequest

    // 表示順序が指定されていない場合、最後尾に追加
    let displayOrder = body.display_order
    if (displayOrder === undefined) {
      const { count } = await supabase
        .from('user_custom_tabs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      displayOrder = (count || 0)
    }

    // カスタムタブ作成
    const { data: tab, error: createError } = await supabase
      .from('user_custom_tabs')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description,
        icon: body.icon || 'Folder',
        color: body.color || 'blue',
        display_order: displayOrder
      })
      .select()
      .single()

    if (createError) {
      console.error('[Custom Tabs API] Error creating tab:', createError)

      // 同じ名前のタブが存在する場合
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Tab with this name already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create tab' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tab }, { status: 201 })
  } catch (error) {
    console.error('[Custom Tabs API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
