import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CustomTabUpdateRequest } from '../../../../types/custom-tabs'

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

// PATCH /api/custom-tabs/[id] - カスタムタブ更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json() as CustomTabUpdateRequest
    const { id: tabId } = await params

    // カスタムタブ更新
    const { data: tab, error: updateError } = await supabase
      .from('user_custom_tabs')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', tabId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[Custom Tabs API] Error updating tab:', updateError)

      // タブが存在しない場合
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Tab not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update tab' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tab }, { status: 200 })
  } catch (error) {
    console.error('[Custom Tabs API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/custom-tabs/[id] - カスタムタブ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: tabId } = await params

    // カスタムタブ削除（関連アイテムはCASCADEで自動削除）
    const { error: deleteError } = await supabase
      .from('user_custom_tabs')
      .delete()
      .eq('id', tabId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Custom Tabs API] Error deleting tab:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete tab' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Custom Tabs API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
