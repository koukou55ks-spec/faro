/**
 * レコメンドシステム
 * ユーザーの行動と履歴に基づいてコンテンツを推薦
 */

import { createClient } from '@supabase/supabase-js'

export interface RecommendationContext {
  userId: string
  currentPage?: string
  recentViews?: string[]
  preferences?: Record<string, any>
}

export interface RecommendedItem {
  id: string
  type: 'article' | 'video' | 'tool' | 'course'
  title: string
  description: string
  score: number
  reason: string
}

export class RecommendationEngine {
  private supabase

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('[Recommendations] Supabase credentials not configured')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * ユーザーにパーソナライズされた推薦を生成
   */
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<RecommendedItem[]> {
    try {
      const recommendations: RecommendedItem[] = []

      // 1. ユーザーの最近の活動を取得
      const { data: recentActivity } = await this.supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', context.userId)
        .order('created_at', { ascending: false })
        .limit(50)

      // 2. 類似ユーザーの行動を取得（協調フィルタリング）
      const collaborativeRecs = await this.getCollaborativeRecommendations(
        context.userId,
        Math.ceil(limit / 2)
      )
      recommendations.push(...collaborativeRecs)

      // 3. コンテンツベースの推薦
      const contentRecs = await this.getContentBasedRecommendations(
        context,
        Math.ceil(limit / 2)
      )
      recommendations.push(...contentRecs)

      // 4. スコアでソートして重複を削除
      const uniqueRecs = this.deduplicateAndSort(recommendations)

      return uniqueRecs.slice(0, limit)
    } catch (error) {
      console.error('[Recommendations] Error generating recommendations:', error)
      return []
    }
  }

  /**
   * 協調フィルタリングによる推薦
   */
  private async getCollaborativeRecommendations(
    userId: string,
    limit: number
  ): Promise<RecommendedItem[]> {
    try {
      // ユーザーの閲覧履歴を取得
      const { data: userHistory } = await this.supabase
        .from('content_views')
        .select('content_id')
        .eq('user_id', userId)
        .limit(20)

      if (!userHistory || userHistory.length === 0) {
        return []
      }

      const viewedContentIds = userHistory.map((h) => h.content_id)

      // 類似した閲覧パターンを持つユーザーを見つける
      const { data: similarUsers } = await this.supabase
        .from('content_views')
        .select('user_id')
        .in('content_id', viewedContentIds)
        .neq('user_id', userId)
        .limit(100)

      if (!similarUsers || similarUsers.length === 0) {
        return []
      }

      const similarUserIds = [...new Set(similarUsers.map((u) => u.user_id))]

      // 類似ユーザーが閲覧したコンテンツを取得
      const { data: recommendations } = await this.supabase
        .from('content_views')
        .select('content_id, contents(*)')
        .in('user_id', similarUserIds)
        .not('content_id', 'in', `(${viewedContentIds.join(',')})`)
        .limit(limit * 2)

      if (!recommendations) {
        return []
      }

      // スコアリング
      const scoredRecs: Map<string, { content: any; count: number }> = new Map()

      recommendations.forEach((rec) => {
        const existing = scoredRecs.get(rec.content_id)
        if (existing) {
          existing.count++
        } else {
          scoredRecs.set(rec.content_id, { content: rec.contents, count: 1 })
        }
      })

      return Array.from(scoredRecs.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map((item) => ({
          id: item.content.id,
          type: item.content.type,
          title: item.content.title,
          description: item.content.description,
          score: item.count / similarUserIds.length,
          reason: '類似ユーザーも閲覧',
        }))
    } catch (error) {
      console.error('[Recommendations] Collaborative filtering error:', error)
      return []
    }
  }

  /**
   * コンテンツベースの推薦
   */
  private async getContentBasedRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendedItem[]> {
    try {
      // ユーザーの最近の閲覧を取得
      const { data: recentViews } = await this.supabase
        .from('content_views')
        .select('contents(*)')
        .eq('user_id', context.userId)
        .order('viewed_at', { ascending: false })
        .limit(5)

      if (!recentViews || recentViews.length === 0) {
        // 新規ユーザー向けに人気コンテンツを返す
        return this.getPopularRecommendations(limit)
      }

      // カテゴリとタグを抽出
      const categories = new Set<string>()
      const tags = new Set<string>()

      recentViews.forEach((view: any) => {
        const content = view.contents
        if (content && content.category) categories.add(content.category)
        if (content && content.tags && Array.isArray(content.tags)) {
          content.tags.forEach((tag: string) => tags.add(tag))
        }
      })

      // 類似コンテンツを検索
      const { data: similar } = await this.supabase
        .from('contents')
        .select('*')
        .or(
          `category.in.(${Array.from(categories).join(',')}),tags.cs.{${Array.from(tags).join(',')}}`
        )
        .limit(limit)

      if (!similar) {
        return []
      }

      return similar.map((content) => ({
        id: content.id,
        type: content.type,
        title: content.title,
        description: content.description,
        score: 0.7,
        reason: '類似のコンテンツ',
      }))
    } catch (error) {
      console.error('[Recommendations] Content-based filtering error:', error)
      return []
    }
  }

  /**
   * 人気コンテンツの推薦（新規ユーザー向け）
   */
  private async getPopularRecommendations(limit: number): Promise<RecommendedItem[]> {
    try {
      const { data: popular } = await this.supabase
        .from('contents')
        .select('*, view_count')
        .order('view_count', { ascending: false })
        .limit(limit)

      if (!popular) {
        return []
      }

      return popular.map((content) => ({
        id: content.id,
        type: content.type,
        title: content.title,
        description: content.description,
        score: 0.5,
        reason: '人気のコンテンツ',
      }))
    } catch (error) {
      console.error('[Recommendations] Popular content error:', error)
      return []
    }
  }

  /**
   * 重複削除とスコアソート
   */
  private deduplicateAndSort(recommendations: RecommendedItem[]): RecommendedItem[] {
    const unique = new Map<string, RecommendedItem>()

    recommendations.forEach((rec) => {
      const existing = unique.get(rec.id)
      if (!existing || existing.score < rec.score) {
        unique.set(rec.id, rec)
      }
    })

    return Array.from(unique.values()).sort((a, b) => b.score - a.score)
  }

  /**
   * ユーザーの行動を記録
   */
  async trackView(userId: string, contentId: string): Promise<void> {
    try {
      await this.supabase.from('content_views').insert({
        user_id: userId,
        content_id: contentId,
        viewed_at: new Date().toISOString(),
      })

      // ビューカウントを更新
      await this.supabase.rpc('increment_view_count', { content_id: contentId })
    } catch (error) {
      console.error('[Recommendations] Track view error:', error)
    }
  }
}

// シングルトンインスタンス
let recommendationEngine: RecommendationEngine | null = null

export function getRecommendationEngine(): RecommendationEngine {
  if (!recommendationEngine) {
    recommendationEngine = new RecommendationEngine()
  }
  return recommendationEngine
}
