import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // 開発環境でのみ実行
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Not set',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',

    // Supabase URLが正しい形式かチェック
    supabaseUrlValid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') ? '✅ Valid format' : '❌ Invalid format',

    // Keyの長さチェック（正常なキーは長い文字列）
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    serviceKeyLength: process.env.SUPABASE_SERVICE_KEY?.length || 0,
  }

  return NextResponse.json(envStatus, { status: 200 })
}
