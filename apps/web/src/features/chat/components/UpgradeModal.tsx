'use client'

import { Zap } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  usageLimit?: number
}

export function UpgradeModal({ isOpen, onClose, usageLimit }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            無料プランの上限に達しました
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            今月のAIメッセージ数が上限の{usageLimit}回に達しました。<br />
            Proプランにアップグレードして無制限に利用しましょう。
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose()
                window.location.href = '/app?view=pricing'
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Proプランにアップグレード
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
