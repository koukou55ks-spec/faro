/**
 * Supabase Client for Next.js
 * 認証とデータベースアクセス
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * ユーザー認証状態を取得
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Get user error:', error)
    return null
  }
  return user
}

/**
 * サインアップ
 */
export async function signUp(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * サインイン
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * サインアウト
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

/**
 * アクセストークン取得
 */
export async function getAccessToken() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    return null
  }
  return session.access_token
}

/**
 * リフレッシュトークンで更新
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

// ============================================
// Supabase Realtime
// ============================================

/**
 * 会話メッセージのリアルタイム購読
 * マルチデバイス間でメッセージを同期
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: any) => void
) {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new)
      }
    )
    .subscribe()

  // Cleanup function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * ユーザーの財務DNA更新をリアルタイム購読
 */
export function subscribeToFinancialDNA(
  userId: string,
  onUpdate: (data: any) => void
) {
  const channel = supabase
    .channel(`financial-dna:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_financial_dna',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * プレゼンス（オンライン状態）の追跡
 * 複数デバイスでログイン中かを検出
 */
export function trackPresence(userId: string) {
  const channel = supabase.channel('online-users', {
    config: {
      presence: {
        key: userId,
      },
    },
  })

  // Join the presence channel
  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      console.log('Online users:', Object.keys(presenceState))
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        })
      }
    })

  return () => {
    channel.untrack()
    supabase.removeChannel(channel)
  }
}

/**
 * 汎用的なリアルタイム購読
 * 任意のテーブル変更を監視
 */
export function subscribeToTable(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void,
  filter?: string
) {
  const channel = supabase
    .channel(`table:${table}`)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
