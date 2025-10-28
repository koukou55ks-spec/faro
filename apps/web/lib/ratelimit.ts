/**
 * レート制限システム
 * - 開発環境: メモリベース（簡易）
 * - 本番環境: Redis/Upstash（永続化・分散対応）
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// メモリベースのレート制限（開発環境用）
class MemoryRatelimit {
  private usage = new Map<string, { count: number; resetAt: number }>()

  async limit(identifier: string, limit: number, window: number): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const key = identifier
    const data = this.usage.get(key)

    if (!data || now > data.resetAt) {
      // 新しいウィンドウ
      this.usage.set(key, {
        count: 1,
        resetAt: now + window,
      })

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + window,
      }
    }

    // 既存のウィンドウ
    if (data.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: data.resetAt,
      }
    }

    data.count++
    this.usage.set(key, data)

    return {
      success: true,
      limit,
      remaining: limit - data.count,
      reset: data.resetAt,
    }
  }

  // クリーンアップ（メモリリーク防止）
  cleanup() {
    const now = Date.now()
    for (const [key, data] of this.usage.entries()) {
      if (now > data.resetAt) {
        this.usage.delete(key)
      }
    }
  }
}

// グローバルインスタンス
let memoryRatelimit: MemoryRatelimit | null = null
let upstashRatelimit: Ratelimit | null = null

/**
 * レート制限インスタンスを取得
 */
function getRatelimiter() {
  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN

  if (hasUpstash && !upstashRatelimit) {
    // Upstash Redis使用
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '1 d'), // 1日50回
      analytics: true,
      prefix: 'faro:ratelimit',
    })
  }

  if (!hasUpstash && !memoryRatelimit) {
    // メモリベース使用（開発環境）
    memoryRatelimit = new MemoryRatelimit()

    // 10分ごとにクリーンアップ
    setInterval(() => {
      memoryRatelimit?.cleanup()
    }, 10 * 60 * 1000)
  }

  return upstashRatelimit || memoryRatelimit!
}

/**
 * ゲストユーザーのレート制限をチェック
 * @param guestId ゲストID
 * @param limit 制限回数（デフォルト: 50回/日）
 * @param window ウィンドウ期間（ミリ秒、デフォルト: 1日）
 */
export async function checkGuestRatelimit(
  guestId: string,
  limit: number = 50,
  window: number = 24 * 60 * 60 * 1000 // 1日
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const ratelimiter = getRatelimiter()

  if (ratelimiter instanceof Ratelimit) {
    // Upstash使用
    const result = await ratelimiter.limit(`guest:${guestId}`)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } else {
    // メモリベース使用
    return await ratelimiter.limit(`guest:${guestId}`, limit, window)
  }
}

/**
 * 認証ユーザーのレート制限をチェック
 * @param userId ユーザーID
 * @param tier プラン（free, pro等）
 */
export async function checkUserRatelimit(
  userId: string,
  tier: 'free' | 'pro' = 'free'
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const limits = {
    free: 200, // 1日200回
    pro: 10000, // 1日10000回
  }

  const limit = limits[tier]
  const ratelimiter = getRatelimiter()

  if (ratelimiter instanceof Ratelimit) {
    // Upstashの場合は専用のリミッターを作成
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const userRatelimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, '1 d'),
      analytics: true,
      prefix: `faro:ratelimit:${tier}`,
    })

    const result = await userRatelimiter.limit(`user:${userId}`)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } else {
    // メモリベース
    return await ratelimiter.limit(
      `user:${userId}`,
      limit,
      24 * 60 * 60 * 1000
    )
  }
}

/**
 * APIエンドポイントのレート制限
 * @param identifier 識別子（IP、ユーザーID等）
 * @param limit 制限回数
 * @param window ウィンドウ期間（秒）
 */
export async function checkApiRatelimit(
  identifier: string,
  limit: number = 100,
  window: number = 60 // 1分
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const ratelimiter = getRatelimiter()

  if (ratelimiter instanceof Ratelimit) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const apiRatelimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window} s`),
      analytics: true,
      prefix: 'faro:ratelimit:api',
    })

    const result = await apiRatelimiter.limit(`api:${identifier}`)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } else {
    return await ratelimiter.limit(
      `api:${identifier}`,
      limit,
      window * 1000
    )
  }
}
