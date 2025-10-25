import { useState, useEffect } from 'react'
import { LibraryContent, LibraryContentWithProgress, LibraryRanking } from '../../types/library'
import { useAuth } from './useAuth'

export function useLibrary() {
  const { token } = useAuth()
  const [contents, setContents] = useState<LibraryContentWithProgress[]>([])
  const [rankings, setRankings] = useState<LibraryRanking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ライブラリコンテンツ取得
  const fetchContents = async (params?: {
    category?: string
    type?: string
    sort?: 'popular' | 'recent' | 'trending' | 'rating'
    limit?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (params?.category) queryParams.set('category', params.category)
      if (params?.type) queryParams.set('type', params.type)
      if (params?.sort) queryParams.set('sort', params.sort)
      if (params?.limit) queryParams.set('limit', params.limit.toString())

      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/library?${queryParams.toString()}`, { headers })

      if (!response.ok) {
        throw new Error('Failed to fetch library contents')
      }

      const data = await response.json()
      setContents(data.contents || [])
    } catch (err) {
      console.error('[useLibrary] Error fetching contents:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // ランキング取得
  const fetchRankings = async (limit: number = 10) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/library/rankings?limit=${limit}`)

      if (!response.ok) {
        throw new Error('Failed to fetch rankings')
      }

      const data = await response.json()
      setRankings(data)
    } catch (err) {
      console.error('[useLibrary] Error fetching rankings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 進捗更新
  const updateProgress = async (contentId: string, progressData: {
    status?: 'not_started' | 'in_progress' | 'completed'
    progress_percentage?: number
    score?: number
    is_bookmarked?: boolean
    user_rating?: number
  }) => {
    if (!token) {
      throw new Error('Authentication required')
    }

    try {
      const response = await fetch(`/api/library/${contentId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(progressData)
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }

      // ローカル状態を更新
      setContents(prev => prev.map(content => {
        if (content.id === contentId && content.user_progress) {
          return {
            ...content,
            user_progress: {
              ...content.user_progress,
              ...progressData
            }
          }
        }
        return content
      }))
    } catch (err) {
      console.error('[useLibrary] Error updating progress:', err)
      throw err
    }
  }

  return {
    contents,
    rankings,
    loading,
    error,
    fetchContents,
    fetchRankings,
    updateProgress
  }
}
