import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    </div>
  )
}
