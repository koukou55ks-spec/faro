'use client'

import { TrendingUp, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileCompletionBarProps {
  percentage: number
  nextStep: {
    field: string
    reason: string
    value: string
  }
}

export function ProfileCompletionBar({ percentage, nextStep }: ProfileCompletionBarProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-bold">プロファイル完成度</h2>
          </div>
          <p className="text-sm text-purple-100">
            AIがあなたに最適な提案をするために
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{percentage}%</div>
          <div className="text-xs text-purple-200">完了</div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="relative h-3 bg-white/20 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white to-purple-200 rounded-full"
        />
      </div>

      {/* 次のステップ */}
      {percentage < 100 && (
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">次のステップ</p>
              <p className="text-sm text-purple-100">
                「{nextStep.field}」を入力してください
              </p>
              <p className="text-xs text-purple-200 mt-2">
                💡 {nextStep.reason}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {nextStep.value}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 100%完了時 */}
      {percentage === 100 && (
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">完璧です！</p>
          <p className="text-sm text-purple-100 mt-1">
            AIがあなたに最適な提案をする準備が整いました
          </p>
        </div>
      )}
    </div>
  )
}
