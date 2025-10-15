'use client'

import { useState } from 'react'
import { Check, Loader2, Sparkles, Zap } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingPlansProps {
  currentPlan?: string
  onUpgrade?: () => void
}

const plans = [
  {
    id: 'free',
    name: '無料プラン',
    price: '¥0',
    period: '/月',
    description: 'Faroを試してみたい方に最適',
    icon: Sparkles,
    features: [
      'AIチャット月30回まで',
      '基本的な家計簿機能',
      'ノート機能（制限あり）',
      '月次レポート',
    ],
    limitations: [
      'ドキュメント保存は5件まで',
      '過去3ヶ月のデータのみ',
      'サポートはコミュニティのみ',
    ],
    cta: '現在のプラン',
    priceId: null,
  },
  {
    id: 'pro',
    name: 'Proプラン',
    price: '¥980',
    period: '/月',
    description: 'すべての機能を無制限に利用',
    icon: Zap,
    popular: true,
    features: [
      'AIチャット無制限',
      '高度な家計簿分析',
      'ノート機能（無制限）',
      '年間レポート＆予測',
      '確定申告支援',
      '銀行連携（今後対応）',
      'ドキュメント保存無制限',
      '全期間のデータ閲覧',
      '優先サポート',
      'エキスパートモード',
    ],
    limitations: [],
    cta: 'Proにアップグレード',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
  },
]

export function PricingPlans({ currentPlan = 'free', onUpgrade }: PricingPlansProps) {
  const [loading, setLoading] = useState(false)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string | null, planId: string) => {
    if (!priceId || planId === 'free') return

    setLoading(true)
    setLoadingPlanId(planId)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const { sessionId, url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }

      if (onUpgrade) {
        onUpgrade()
      }
    } catch (error) {
      console.error('[Pricing] Error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
      setLoadingPlanId(null)
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            シンプルな料金プラン
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            あなたに最適なプランを選んで、Faroをフル活用しましょう
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = currentPlan === plan.id
            const isPopular = plan.popular

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 ${
                  isPopular
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl scale-105'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                } transition-all duration-300 hover:shadow-xl`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                    おすすめ
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isPopular ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isPopular ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-bold ${
                        isPopular ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {plan.name}
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${
                      isPopular ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        isPopular ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-lg ${
                        isPopular ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-white' : 'text-green-600 dark:text-green-400'
                        }`}
                        strokeWidth={3}
                      />
                      <span
                        className={`text-sm ${
                          isPopular ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.priceId || null, plan.id)}
                  disabled={isCurrentPlan || loading}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? isPopular
                        ? 'bg-white/20 text-white cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : isPopular
                      ? 'bg-white text-purple-600 hover:bg-gray-100 active:scale-95 shadow-lg'
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-md'
                  } ${loading && loadingPlanId === plan.id ? 'opacity-70' : ''}`}
                >
                  {loading && loadingPlanId === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      処理中...
                    </span>
                  ) : isCurrentPlan ? (
                    plan.cta
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            いつでもキャンセル可能 • 日割り返金 • クレジットカード決済
          </p>
        </div>
      </div>
    </div>
  )
}
