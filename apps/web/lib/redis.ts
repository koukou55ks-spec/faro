import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate limiter configuration
export const ratelimit = {
  // API rate limit: 100 requests per 10 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '10 s'),
    analytics: true,
    prefix: '@faro/api',
  }),

  // AI chat rate limit: 20 messages per minute
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: '@faro/chat',
  }),

  // Auth rate limit: 5 attempts per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@faro/auth',
  }),
}
