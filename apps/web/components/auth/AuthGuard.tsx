'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../lib/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

/**
 * 認証状態に基づいてアクセスを制御するコンポーネント
 *
 * @param requireAuth - 認証が必要かどうか（デフォルト: true）
 * @param redirectTo - 未認証時のリダイレクト先（デフォルト: /login）
 */
export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 認証チェックが完了してから処理
    if (!loading) {
      if (requireAuth && !user) {
        // 認証が必要だが未認証の場合
        console.log('[AuthGuard] Redirecting to login, current path:', pathname)

        // 現在のパスを保存して、ログイン後に戻れるようにする
        const returnUrl = encodeURIComponent(pathname)
        router.push(`${redirectTo}?returnUrl=${returnUrl}`)
      }
    }
  }, [user, loading, requireAuth, router, redirectTo, pathname])

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // 認証が必要で未認証の場合は何も表示しない（リダイレクト中）
  if (requireAuth && !user) {
    return null
  }

  // 認証OK、または認証不要の場合はchildrenを表示
  return <>{children}</>
}