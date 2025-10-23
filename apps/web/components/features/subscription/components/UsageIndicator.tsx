'use client'

import { useEffect, useState } from 'react'
import { Zap, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../../../lib/store/useAuthStore'

interface UsageData {
  allowed: boolean
  plan: string
  limit: number
  used: number
  remaining: number
}

export function UsageIndicator() {
  const { user, token } = useAuthStore()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      if (!user || !token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/usage/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'ai_message' }),
        })

        if (response.ok) {
          const data = await response.json()
          setUsage(data)
        }
      } catch (error) {
        console.error('[UsageIndicator] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [user, token])

  if (loading || !usage || !user) return null

  const isPro = usage.plan === 'pro'
  const percentage = isPro ? 100 : (usage.used / usage.limit) * 100
  const isNearLimit = percentage > 80 && !isPro

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isPro ? (
            <>
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Proプラン
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                無料プラン
              </span>
            </>
          )}
        </div>
        {!isPro && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {usage.remaining}/{usage.limit}
          </span>
        )}
      </div>

      {!isPro && (
        <>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isNearLimit
                  ? 'bg-red-500'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          {isNearLimit && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              残り{usage.remaining}回のみ
            </p>
          )}
        </>
      )}

      {isPro && (
        <p className="text-xs text-purple-600 dark:text-purple-400">
          無制限利用可能
        </p>
      )}
    </div>
  )
}

