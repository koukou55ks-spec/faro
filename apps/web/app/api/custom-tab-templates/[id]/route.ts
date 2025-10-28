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

// GET /api/custom-tab-templates/[id] - テンプレート詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id: templateId } = await params

    // テンプレート取得
    const { data: template, error } = await supabase
      .from('custom_tab_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template }, { status: 200 })
  } catch (error) {
    console.error('[Custom Tab Templates API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
