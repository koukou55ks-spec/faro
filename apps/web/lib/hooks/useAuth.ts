import { useState, useEffect } from 'react'
import { createClient } from '../supabase/client'
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface User {
  id: string
  email?: string
  user_metadata?: Record<string, any>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[useAuth] Error getting session:', error)
          setUser(null)
          setToken(null)
        } else {
          console.log('[useAuth] Initial session check:', session?.user?.email || 'No user')
          setUser(session?.user ?? null)
          setToken(session?.access_token ?? null)
        }
      } catch (error) {
        console.error('[useAuth] Exception getting session:', error)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('[useAuth] Auth state changed:', event, session?.user?.email || 'No user')
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    return data
  }

  return {
    user,
    loading,
    token,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }
}
