import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 認証確認（オプション - ログイン不要でも閲覧可能）
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // コンテンツ取得
    const { data: content, error } = await supabase
      .from('library_content')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // 閲覧数を増やす
    await supabase
      .from('library_content')
      .update({ view_count: content.view_count + 1 })
      .eq('id', id)

    // ユーザーがログインしている場合、進捗情報も取得
    let userProgress = null
    if (user) {
      const { data: progress } = await supabase
        .from('user_library_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', id)
        .single()

      userProgress = progress
    }

    return NextResponse.json({
      content: {
        ...content,
        user_progress: userProgress
      }
    })
  } catch (error) {
    console.error('[Library Content API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
