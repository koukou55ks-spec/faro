import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis client (uses environment variables)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Rate limit configurations for different endpoints
const rateLimiters = {
  // Default rate limit: 100 requests per minute
  default: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }) : null,

  // Chat API: 30 requests per minute (more expensive)
  chat: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
  }) : null,

  // Auth endpoints: 10 attempts per hour
  auth: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10, '1 h'),
    analytics: true,
  }) : null,

  // File upload: 10 uploads per hour
  upload: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10, '1 h'),
    analytics: true,
  }) : null,
}

export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'default'
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // Skip rate limiting in development or if Redis not configured
  if (process.env.NODE_ENV === 'development' || !redis) {
    return { success: true }
  }

  const limiter = rateLimiters[type]
  if (!limiter) {
    return { success: true }
  }

  // Get identifier (IP address or user ID)
  const identifier = getIdentifier(request)

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    return { success, limit, remaining, reset }
  } catch (error) {
    console.error('[RateLimit] Error:', error)
    // Fail open - allow request if rate limiting fails
    return { success: true }
  }
}

function getIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    try {
      // Extract user ID from JWT token
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.sub) {
        return `user:${payload.sub}`
      }
    } catch {
      // Invalid token, fall through to IP
    }
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'

  return `ip:${ip}`
}

// Middleware helper for API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  type: keyof typeof rateLimiters = 'default'
) {
  return async (req: NextRequest) => {
    const { success, limit, remaining, reset } = await rateLimit(req, type)

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'リクエスト数が制限を超えました。しばらく待ってから再試行してください。',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit?.toString() || '100',
            'X-RateLimit-Remaining': remaining?.toString() || '0',
            'X-RateLimit-Reset': reset?.toString() || '',
            'Retry-After': reset ? Math.max(0, reset - Date.now() / 1000).toString() : '60',
          },
        }
      )
    }

    // Add rate limit headers to successful response
    const response = await handler(req)
    if (limit !== undefined) {
      response.headers.set('X-RateLimit-Limit', limit.toString())
    }
    if (remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
    }
    if (reset !== undefined) {
      response.headers.set('X-RateLimit-Reset', reset.toString())
    }

    return response
  }
}

// DDoS protection with aggressive rate limiting
export async function ddosProtection(request: NextRequest): Promise<boolean> {
  if (!redis) return true

  const ip = getIdentifier(request).replace('user:', 'ip:') // Always use IP for DDoS
  const key = `ddos:${ip}`

  try {
    // Check if IP is blocked
    const blocked = await redis.get(key)
    if (blocked) {
      return false
    }

    // Track request count
    const count = await redis.incr(`req:${ip}`)
    await redis.expire(`req:${ip}`, 10) // 10 second window

    // Block if more than 100 requests in 10 seconds
    if (count > 100) {
      await redis.set(key, 'blocked', { ex: 3600 }) // Block for 1 hour
      return false
    }

    return true
  } catch (error) {
    console.error('[DDoS Protection] Error:', error)
    return true // Fail open
  }
}