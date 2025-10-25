import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Check if Redis is configured
const REDIS_ENABLED =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

let ratelimit: any = null
if (REDIS_ENABLED) {
  try {
    ratelimit = require('./lib/redis').ratelimit
  } catch (error) {
    console.warn('[Middleware] Redis not configured, rate limiting disabled')
  }
}

/**
 * Security Headers (CSP, HSTS, etc.)
 */
function getSecurityHeaders() {
  const headers = new Headers()

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  headers.set('Content-Security-Policy', cspDirectives)

  // Strict Transport Security (HSTS)
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')

  // XSS Protection (legacy, but still useful)
  headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return headers
}

/**
 * Rate Limiting Middleware
 */
async function handleRateLimit(request: NextRequest) {
  // Skip rate limiting if Redis is not configured
  if (!REDIS_ENABLED || !ratelimit) {
    return null
  }

  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
  const pathname = request.nextUrl.pathname

  // Different rate limits for different routes
  let limiter = ratelimit.api

  if (pathname.startsWith('/api/chat')) {
    limiter = ratelimit.chat
  } else if (pathname.startsWith('/api/auth')) {
    limiter = ratelimit.auth
  }

  const { success, limit, reset, remaining } = await limiter.limit(ip)

  if (!success) {
    return new NextResponse('Rate limit exceeded. Please try again later.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    })
  }

  return null // Continue to next middleware
}

/**
 * Main Middleware
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ソースマップリクエストを静かに404で返す（ログを汚染しない）
  const isSourceMapRequest =
    pathname.includes('/src/') ||
    pathname.includes('/_next/src/') ||
    pathname.endsWith('.ts') ||
    pathname.endsWith('.js.map')

  if (isSourceMapRequest) {
    // 静かに404を返す（Next.jsのログに表示されない）
    return new NextResponse(null, { status: 404 })
  }

  // 公開ページ（認証不要）のリスト
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/api/debug-env',
    '/search',
    '/agents',
    '/connect',
  ]

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Supabase authentication - refresh session
  const response = NextResponse.next()

  // 環境変数の確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Supabase環境変数が設定されていません')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定')
    // 環境変数がない場合はセッション更新をスキップして続行
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // 認証チェック: 公開ページ以外は認証必須
  if (!isPublicPath && !session) {
    console.log('[Middleware] Unauthorized access to:', pathname, '- redirecting to /login')
    // 元のURLを保存して、ログイン後に戻れるようにする
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ログイン済みユーザーが認証ページにアクセスした場合はホームにリダイレクト
  if (session && (pathname === '/login' || pathname === '/signup')) {
    console.log('[Middleware] Authenticated user accessing auth page - redirecting to /')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Apply security headers
  const securityHeaders = getSecurityHeaders()
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value)
  })

  // Apply rate limiting only to API routes
  if (pathname.startsWith('/api')) {
    try {
      const rateLimitResponse = await handleRateLimit(request)
      if (rateLimitResponse) {
        return rateLimitResponse
      }
    } catch (error) {
      console.error('[Middleware] Rate limiting error:', error)
      // Continue even if rate limiting fails
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  // Node.js runtimeを使用してEdge Runtime警告を回避
  runtime: 'nodejs',
}
