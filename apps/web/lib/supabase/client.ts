import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// シングルトンパターン: 1つのクライアントインスタンスを再利用
let supabaseClient: SupabaseClient | null = null

export function createClient() {
  // 既存のインスタンスがあれば再利用
  if (supabaseClient) {
    return supabaseClient
  }

  // 関数内で環境変数を読み込む（ビルド時ではなく実行時に評価）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 環境変数が設定されているか確認
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase環境変数が設定されていません。' +
      '\nNEXT_PUBLIC_SUPABASE_URL: ' + (supabaseUrl ? '設定済み' : '未設定') +
      '\nNEXT_PUBLIC_SUPABASE_ANON_KEY: ' + (supabaseAnonKey ? '設定済み' : '未設定') +
      '\n\n.env.localファイルを確認し、開発サーバーを再起動してください。'
    )
  }

  // 新しいクライアントを作成してキャッシュ
  // ブラウザ環境でcookieを使用してセッションを永続化
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
        return undefined
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return
        let cookie = `${name}=${value}`
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`
        if (options?.path) cookie += `; path=${options.path}`
        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`
        document.cookie = cookie
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=; max-age=0; path=${options?.path || '/'}`
      },
    },
  })
  return supabaseClient
}
