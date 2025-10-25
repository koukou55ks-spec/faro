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

// GET /api/library - ライブラリコンテンツ一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const contentType = searchParams.get('type')
    const sort = searchParams.get('sort') || 'popular' // popular, recent, trending
    const limit = parseInt(searchParams.get('limit') || '20')

    // ユーザー認証（オプショナル）
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    // ベースクエリ
    let query = supabase
      .from('library_content')
      .select('*')
      .eq('is_published', true)

    // フィルタリング
    if (category) {
      query = query.eq('category', category)
    }

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    // ソート
    switch (sort) {
      case 'popular':
        query = query.order('view_count', { ascending: false })
        break
      case 'recent':
        query = query.order('published_at', { ascending: false })
        break
      case 'trending':
        // トレンドは最近の閲覧数で判定（ここでは簡易的に実装）
        query = query.order('view_count', { ascending: false })
        break
      case 'rating':
        query = query.order('average_score', { ascending: false, nullsFirst: false })
        break
    }

    query = query.limit(limit)

    const { data: contents, error: contentsError } = await query

    if (contentsError) {
      console.error('[Library API] Error fetching contents:', contentsError)
      return NextResponse.json(
        { error: 'Failed to fetch library contents' },
        { status: 500 }
      )
    }

    // ユーザーがログインしている場合、進捗情報も取得
    let contentsWithProgress = contents

    if (userId && contents && contents.length > 0) {
      const contentIds = contents.map(c => c.id)

      const { data: progressData } = await supabase
        .from('user_library_progress')
        .select('*')
        .eq('user_id', userId)
        .in('content_id', contentIds)

      // 進捗情報をマージ
      contentsWithProgress = contents.map(content => ({
        ...content,
        user_progress: progressData?.find(p => p.content_id === content.id)
      }))
    }

    return NextResponse.json({ contents: contentsWithProgress || [] }, { status: 200 })
  } catch (error) {
    console.error('[Library API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
