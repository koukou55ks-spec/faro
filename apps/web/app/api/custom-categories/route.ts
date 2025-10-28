import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CreateCustomCategoryInput } from '../../../lib/types/sources'

// GET /api/custom-categories - カスタムカテゴリ一覧取得
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // カスタムカテゴリ取得（RLSで自動的にuser_id制限）
    const { data: categories, error } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Custom Categories API] Error fetching categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    console.error('[Custom Categories API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/custom-categories - カスタムカテゴリ作成
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateCustomCategoryInput = await req.json()

    // バリデーション
    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    // カスタムカテゴリ作成
    const { data: category, error } = await supabase
      .from('custom_categories')
      .insert({
        user_id: user.id,
        name: body.name,
        color: body.color || '#6366f1',
        icon: body.icon || '📁'
      })
      .select()
      .single()

    if (error) {
      console.error('[Custom Categories API] Error creating category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('[Custom Categories API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
