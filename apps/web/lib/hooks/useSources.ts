import { useState, useEffect, useCallback } from 'react'
import { Source, CreateSourceInput, UpdateSourceInput, SourceFilters } from '../types/sources'

export function useSources(filters?: SourceFilters) {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ソース一覧取得
  const fetchSources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // クエリパラメータ構築
      const params = new URLSearchParams()
      if (filters?.categories?.length) {
        params.set('categories', filters.categories.join(','))
      }
      if (filters?.tags?.length) {
        params.set('tags', filters.tags.join(','))
      }
      if (filters?.types?.length) {
        params.set('types', filters.types.join(','))
      }
      if (filters?.search) {
        params.set('search', filters.search)
      }

      const url = `/api/sources${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch sources')
      }

      const data = await response.json()
      setSources(data.sources || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // ソース作成
  const createSource = useCallback(async (input: CreateSourceInput) => {
    try {
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create source')
      }

      const data = await response.json()
      await fetchSources() // リフレッシュ
      return data.source
    } catch (err) {
      throw err
    }
  }, [fetchSources])

  // ソース更新
  const updateSource = useCallback(async (id: string, input: UpdateSourceInput) => {
    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update source')
      }

      const data = await response.json()
      await fetchSources() // リフレッシュ
      return data.source
    } catch (err) {
      throw err
    }
  }, [fetchSources])

  // ソース削除
  const deleteSource = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete source')
      }

      await fetchSources() // リフレッシュ
    } catch (err) {
      throw err
    }
  }, [fetchSources])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  return {
    sources,
    loading,
    error,
    createSource,
    updateSource,
    deleteSource,
    refetch: fetchSources
  }
}
