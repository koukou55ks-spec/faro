import { useState, useEffect } from 'react'
import { CustomTab, CustomTabItem, CustomTabCreateRequest, CustomTabItemCreateRequest } from '../../types/custom-tabs'
import { useAuth } from './useAuth'

export function useCustomTabs() {
  const { token } = useAuth()
  const [tabs, setTabs] = useState<CustomTab[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // タブ一覧取得
  const fetchTabs = async () => {
    if (!token) {
      console.log('[useCustomTabs] No token available, skipping fetch')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/custom-tabs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[useCustomTabs] API error:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to fetch tabs')
      }

      const data = await response.json()
      console.log('[useCustomTabs] Fetched tabs:', data.tabs?.length || 0)
      setTabs(data.tabs || [])
    } catch (err) {
      console.error('[useCustomTabs] Error fetching tabs:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // タブ作成
  const createTab = async (tabData: CustomTabCreateRequest) => {
    if (!token) {
      throw new Error('Authentication required')
    }

    try {
      const response = await fetch('/api/custom-tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tabData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create tab')
      }

      const data = await response.json()
      setTabs(prev => [...prev, data.tab])
      return data.tab
    } catch (err) {
      console.error('[useCustomTabs] Error creating tab:', err)
      throw err
    }
  }

  // タブ削除
  const deleteTab = async (tabId: string) => {
    if (!token) {
      throw new Error('Authentication required')
    }

    try {
      const response = await fetch(`/api/custom-tabs/${tabId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete tab')
      }

      setTabs(prev => prev.filter(tab => tab.id !== tabId))
    } catch (err) {
      console.error('[useCustomTabs] Error deleting tab:', err)
      throw err
    }
  }

  // タブアイテム取得
  const fetchTabItems = async (tabId: string): Promise<CustomTabItem[]> => {
    if (!token) {
      throw new Error('Authentication required')
    }

    try {
      const response = await fetch(`/api/custom-tabs/${tabId}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tab items')
      }

      const data = await response.json()
      return data.items || []
    } catch (err) {
      console.error('[useCustomTabs] Error fetching tab items:', err)
      throw err
    }
  }

  // タブアイテム追加
  const addTabItem = async (tabId: string, itemData: CustomTabItemCreateRequest) => {
    if (!token) {
      throw new Error('Authentication required')
    }

    try {
      const response = await fetch(`/api/custom-tabs/${tabId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      })

      if (!response.ok) {
        throw new Error('Failed to add tab item')
      }

      const data = await response.json()
      return data.item
    } catch (err) {
      console.error('[useCustomTabs] Error adding tab item:', err)
      throw err
    }
  }

  // 初回ロード
  useEffect(() => {
    if (token) {
      fetchTabs()
    }
  }, [token])

  return {
    tabs,
    loading,
    error,
    fetchTabs,
    createTab,
    deleteTab,
    fetchTabItems,
    addTabItem
  }
}
