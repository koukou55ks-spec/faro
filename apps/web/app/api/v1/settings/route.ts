import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import type { UserSettings, UserSettingsUpdate } from '../../../../types/settings'

// GET: ユーザー設定の取得
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

    // 設定を取得
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // 設定が存在しない場合はデフォルト値を作成
      if (error.code === 'PGRST116') {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (insertError) {
          console.error('[Settings API] Failed to create default settings:', insertError)
          return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 })
        }

        return NextResponse.json({ settings: newSettings })
      }

      console.error('[Settings API] Failed to fetch settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[Settings API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: ユーザー設定の更新
export async function PUT(req: NextRequest) {
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

    // リクエストボディを取得
    const updates: UserSettingsUpdate = await req.json()

    // 更新を実行
    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[Settings API] Failed to update settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[Settings API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: 個別設定項目の更新
export async function PATCH(req: NextRequest) {
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

    // リクエストボディを取得
    const { key, value } = await req.json()

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // 更新を実行
    const { data: settings, error } = await supabase
      .from('user_settings')
      .update({ [key]: value })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[Settings API] Failed to update setting:', error)
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[Settings API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: ユーザー設定のリセット（デフォルトに戻す）
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

    // 既存の設定を削除
    const { error: deleteError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Settings API] Failed to delete settings:', deleteError)
      return NextResponse.json({ error: 'Failed to delete settings' }, { status: 500 })
    }

    // デフォルト設定を作成
    const { data: newSettings, error: insertError } = await supabase
      .from('user_settings')
      .insert({ user_id: user.id })
      .select()
      .single()

    if (insertError) {
      console.error('[Settings API] Failed to create default settings:', insertError)
      return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 })
    }

    return NextResponse.json({ settings: newSettings })
  } catch (error) {
    console.error('[Settings API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
