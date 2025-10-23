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

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
