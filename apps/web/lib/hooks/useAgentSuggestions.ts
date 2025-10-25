import { useState, useEffect } from 'react'
import { AgentSuggestion } from '../../types/agent'
import { useAuth } from './useAuth'

export function useAgentSuggestions() {
  const { token } = useAuth()
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 提案一覧取得
  const fetchSuggestions = async (params?: {
    status?: 'pending' | 'viewed' | 'acted' | 'dismissed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  }) => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.set('status', params.status)
      if (params?.priority) queryParams.set('priority', params.priority)

      const response = await fetch(`/api/agent/suggestions?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      console.error('[useAgentSuggestions] Error fetching suggestions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 提案生成（AI実行）
  const generateSuggestions = async () => {
    if (!token) {
      throw new Error('Authentication required')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/agent/suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()

      // 新しい提案があれば既存リストに追加
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(prev => [...data.suggestions, ...prev])
      }

      return data
    } catch (err) {
      console.error('[useAgentSuggestions] Error generating suggestions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 提案ステータス更新
  const updateSuggestionStatus = async (
    suggestionId: string,
    status: 'viewed' | 'acted' | 'dismissed'
  ) => {
    if (!token) {
      throw new Error('Authentication required')
    }

    try {
      const response = await fetch(`/api/agent/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update suggestion status')
      }

      // ローカル状態を更新
      setSuggestions(prev => prev.map(s =>
        s.id === suggestionId ? { ...s, status } : s
      ))
    } catch (err) {
      console.error('[useAgentSuggestions] Error updating suggestion:', err)
      throw err
    }
  }

  // 未読の提案数
  const pendingCount = suggestions.filter(s => s.status === 'pending').length

  // 初回ロード
  useEffect(() => {
    if (token) {
      fetchSuggestions({ status: 'pending' })
    }
  }, [token])

  return {
    suggestions,
    pendingCount,
    loading,
    error,
    fetchSuggestions,
    generateSuggestions,
    updateSuggestionStatus
  }
}
