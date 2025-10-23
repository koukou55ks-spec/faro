import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CreateUserProfileRequest, UpdateUserProfileRequest } from '../../../lib/types/userProfile'

// Edge Runtimeをコメントアウト（OpenTelemetryの互換性問題のため）
// export const runtime = 'edge'

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

// GET /api/profile - ユーザープロフィール取得
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

    // プロフィール取得
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      // プロフィールが存在しない場合は404ではなくnullを返す
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ profile: null }, { status: 200 })
      }

      console.error('[Profile API] Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('[Profile API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/profile - ユーザープロフィール作成
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

    const body = await request.json() as CreateUserProfileRequest

    // プロフィール作成
    const { data: profile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        ...body
      })
      .select()
      .single()

    if (createError) {
      console.error('[Profile API] Error creating profile:', createError)

      // すでに存在する場合
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Profile already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('[Profile API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - ユーザープロフィール更新
export async function PATCH(request: NextRequest) {
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

    const body = await request.json() as UpdateUserProfileRequest

    // プロフィール更新
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[Profile API] Error updating profile:', updateError)

      // プロフィールが存在しない場合
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('[Profile API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
