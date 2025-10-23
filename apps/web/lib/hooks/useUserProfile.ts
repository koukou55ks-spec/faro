import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  UserProfile,
  UserLifeEvent,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  CreateLifeEventRequest,
  UpdateLifeEventRequest
} from '../types/userProfile'

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [events, setEvents] = useState<UserLifeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // プロフィール取得
  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setProfile(null)
        setLoading(false)
        return
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const { profile } = await response.json()
      setProfile(profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('[useUserProfile] Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  // ライフイベント取得
  const fetchLifeEvents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setEvents([])
        return
      }

      const response = await fetch('/api/profile/life-events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch life events')
      }

      const { events } = await response.json()
      setEvents(events)
    } catch (err) {
      console.error('[useUserProfile] Error fetching life events:', err)
    }
  }

  // プロフィール作成
  const createProfile = async (data: CreateUserProfileRequest) => {
    try {
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create profile')
      }

      const { profile } = await response.json()
      setProfile(profile)
      return profile
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('[useUserProfile] Error creating profile:', err)
      throw err
    }
  }

  // プロフィール更新
  const updateProfile = async (data: UpdateUserProfileRequest) => {
    try {
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const { profile } = await response.json()
      setProfile(profile)
      return profile
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('[useUserProfile] Error updating profile:', err)
      throw err
    }
  }

  // ライフイベント作成
  const createLifeEvent = async (data: CreateLifeEventRequest) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/profile/life-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create life event')
      }

      const { event } = await response.json()
      setEvents([event, ...events])
      return event
    } catch (err) {
      console.error('[useUserProfile] Error creating life event:', err)
      throw err
    }
  }

  // ライフイベント更新
  const updateLifeEvent = async (id: string, data: UpdateLifeEventRequest) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/profile/life-events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update life event')
      }

      const { event } = await response.json()
      setEvents(events.map(e => e.id === id ? event : e))
      return event
    } catch (err) {
      console.error('[useUserProfile] Error updating life event:', err)
      throw err
    }
  }

  // ライフイベント削除
  const deleteLifeEvent = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/profile/life-events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete life event')
      }

      setEvents(events.filter(e => e.id !== id))
    } catch (err) {
      console.error('[useUserProfile] Error deleting life event:', err)
      throw err
    }
  }

  // 初回読み込み
  useEffect(() => {
    fetchProfile()
    fetchLifeEvents()
  }, [])

  return {
    profile,
    events,
    loading,
    error,
    refetch: () => {
      fetchProfile()
      fetchLifeEvents()
    },
    createProfile,
    updateProfile,
    createLifeEvent,
    updateLifeEvent,
    deleteLifeEvent
  }
}
