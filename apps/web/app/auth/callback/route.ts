import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const cookieStore = await cookies()

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[Auth Callback] Supabase環境変数が設定されていません')
        return NextResponse.redirect(`${requestUrl.origin}/?error=config_error`)
      }

      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            },
          },
        }
      )

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Auth Callback] Error exchanging code for session:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`)
      }

      console.log('[Auth Callback] Successfully exchanged code for session, user:', data.user?.email)
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
    }
  }

  // Redirect to home page
  return NextResponse.redirect(requestUrl.origin)
}
