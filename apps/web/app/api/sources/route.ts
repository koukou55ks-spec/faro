import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CreateSourceInput, SourceFilters } from '../../../lib/types/sources'

// GET /api/sources - ソース一覧取得（フィルター対応）
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // クエリパラメータからフィルターを取得
    const searchParams = req.nextUrl.searchParams
    const categories = searchParams.get('categories')?.split(',').filter(Boolean)
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const types = searchParams.get('types')?.split(',').filter(Boolean)
    const search = searchParams.get('search')

    // クエリ構築
    let query = supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // フィルター適用
    if (categories && categories.length > 0) {
      query = query.in('category', categories)
    }

    if (types && types.length > 0) {
      query = query.in('type', types)
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content->>text.ilike.%${search}%`)
    }

    const { data: sources, error } = await query

    if (error) {
      console.error('[Sources API] Error fetching sources:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sources }, { status: 200 })
  } catch (error) {
    console.error('[Sources API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/sources - ソース作成
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateSourceInput = await req.json()

    // バリデーション
    if (!body.title || !body.category || !body.type) {
      return NextResponse.json(
        { error: 'title, category, and type are required' },
        { status: 400 }
      )
    }

    // Phase 2: 全タイプサポート
    const validTypes = ['text', 'number', 'document', 'link', 'structured']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // ソース作成
    const { data: source, error } = await supabase
      .from('sources')
      .insert({
        user_id: user.id,
        title: body.title,
        category: body.category,
        type: body.type,
        content: body.content,
        tags: body.tags || [],
        ai_priority: body.ai_priority || 'on_demand'
      })
      .select()
      .single()

    if (error) {
      console.error('[Sources API] Error creating source:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ source }, { status: 201 })
  } catch (error) {
    console.error('[Sources API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
