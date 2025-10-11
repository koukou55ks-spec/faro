import { Redis } from '@upstash/redis'

export interface ICacheService {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, expirationSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
}

export class RedisCache implements ICacheService {
  private redis: Redis

  constructor(url: string, token: string) {
    this.redis = new Redis({
      url,
      token,
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value as T | null
    } catch (error) {
      console.error(`[Redis] Error getting key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, expirationSeconds?: number): Promise<void> {
    try {
      if (expirationSeconds) {
        await this.redis.setex(key, expirationSeconds, JSON.stringify(value))
      } else {
        await this.redis.set(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`[Redis] Error setting key ${key}:`, error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error(`[Redis] Error deleting key ${key}:`, error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`[Redis] Error checking existence of key ${key}:`, error)
      return false
    }
  }
}
