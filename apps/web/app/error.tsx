'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをコンソールに記録
    console.error('[Global Error]:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <AlertTriangle className="w-24 h-24 mx-auto text-red-500 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
          {error.message && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            再読み込み
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            ホームに戻る
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            問題が解決しない場合は、ページをリロードするか、
            <Link href="/settings" className="text-purple-600 dark:text-purple-400 hover:underline ml-1">
              サポート
            </Link>
            までお問い合わせください。
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
              エラーID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
