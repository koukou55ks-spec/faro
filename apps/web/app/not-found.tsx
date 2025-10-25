'use client'

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <FileQuestion className="w-24 h-24 mx-auto text-purple-500 mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ページが見つかりません
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            ホームに戻る
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            前のページに戻る
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            問題が解決しない場合は、
            <Link href="/settings" className="text-purple-600 dark:text-purple-400 hover:underline ml-1">
              サポート
            </Link>
            までお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  )
}
