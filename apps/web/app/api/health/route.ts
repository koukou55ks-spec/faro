import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const check = searchParams.get('check')

  const health = {
    status: 'ok' as 'ok' | 'degraded' | 'error',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    version: '2.0.0',
    checks: {} as Record<string, { status: string; latency?: number; message?: string }>
  }

  // Basic health check
  health.checks.app = {
    status: 'ok',
    message: 'Application is running'
  }

  // Database check
  if (check === 'db' || check === 'all') {
    const dbStart = Date.now()
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.from('profiles').select('id').limit(1)

      if (error) throw error

      health.checks.database = {
        status: 'ok',
        latency: Date.now() - dbStart,
        message: 'Database connection successful'
      }
    } catch (error: any) {
      health.status = 'degraded'
      health.checks.database = {
        status: 'error',
        latency: Date.now() - dbStart,
        message: error.message || 'Database connection failed'
      }
    }
  }

  // Gemini API check
  if (check === 'ai' || check === 'all') {
    const aiStart = Date.now()
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured')
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error('Gemini API unavailable')

      health.checks.ai = {
        status: 'ok',
        latency: Date.now() - aiStart,
        message: 'Gemini API accessible'
      }
    } catch (error: any) {
      health.status = 'degraded'
      health.checks.ai = {
        status: 'error',
        latency: Date.now() - aiStart,
        message: error.message || 'Gemini API check failed'
      }
    }
  }

  // Redis check (optional)
  if (check === 'redis' || check === 'all') {
    const redisStart = Date.now()
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Redis not configured')
      }

      const response = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
          }
        }
      )

      if (!response.ok) throw new Error('Redis unavailable')

      health.checks.redis = {
        status: 'ok',
        latency: Date.now() - redisStart,
        message: 'Redis connection successful'
      }
    } catch (error: any) {
      health.checks.redis = {
        status: 'warning',
        latency: Date.now() - redisStart,
        message: error.message || 'Redis check skipped (optional)'
      }
    }
  }

  // Determine overall status
  const hasError = Object.values(health.checks).some(c => c.status === 'error')
  const hasWarning = Object.values(health.checks).some(c => c.status === 'warning')

  if (hasError) {
    health.status = 'error'
  } else if (hasWarning) {
    health.status = 'degraded'
  }

  // Return appropriate status code
  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  })
}
