/**
 * カスタムタブテンプレートAPI
 *
 * GET /api/custom-tab-templates - テンプレート一覧取得
 */

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
      autoRefreshToken: false,
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // テンプレート取得（システム提供テンプレートのみ）
    const { data: templates, error: fetchError } = await supabase
      .from('custom_tab_templates')
      .select('*')
      .eq('is_system', true)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('[CustomTabTemplates API] Fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    return NextResponse.json({ templates }, { status: 200 })
  } catch (error: any) {
    console.error('[CustomTabTemplates API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
