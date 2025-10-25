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

// GET /api/library/rankings - ライブラリランキング取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // 1. 総合ランキング（閲覧数順）
    const { data: overall } = await supabase
      .from('library_content')
      .select('*')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(limit)

    // 2. カテゴリ別ランキング
    const categories = ['所得税', '住民税', '相続税', 'NISA', 'iDeCo', '確定申告']
    const byCategory: Record<string, any[]> = {}

    for (const category of categories) {
      const { data: categoryData } = await supabase
        .from('library_content')
        .select('*')
        .eq('is_published', true)
        .eq('category', category)
        .order('view_count', { ascending: false })
        .limit(5)

      if (categoryData) {
        byCategory[category] = categoryData
      }
    }

    // 3. トレンド（最近1週間で閲覧数が多いもの）
    // 簡易実装: 完了数が多い順
    const { data: trending } = await supabase
      .from('library_content')
      .select('*')
      .eq('is_published', true)
      .order('completion_count', { ascending: false })
      .limit(limit)

    // 4. おすすめ（ユーザー属性ベース - 後で実装）
    // とりあえず平均スコアが高いものを返す
    const { data: recommended } = await supabase
      .from('library_content')
      .select('*')
      .eq('is_published', true)
      .order('average_score', { ascending: false, nullsFirst: false })
      .limit(limit)

    return NextResponse.json({
      overall: overall || [],
      by_category: byCategory,
      trending: trending || [],
      recommended: recommended || []
    }, { status: 200 })
  } catch (error) {
    console.error('[Library Rankings API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
