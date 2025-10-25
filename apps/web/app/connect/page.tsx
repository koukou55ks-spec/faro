'use client'

import { useState } from 'react'
import {
  Users,
  Star,
  MessageSquare,
  MapPin,
  DollarSign,
  ExternalLink,
  Filter,
  Award,
  Clock,
  Briefcase,
  Check,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AffiliateButton } from '../../components/ui/AffiliateLink'

// 実際のアフィリエイトパートナー（会計ソフト）
const accountingSoftware = [
  {
    id: 'freee',
    name: 'freee会計',
    description: '質問に答えるだけで確定申告が完了',
    tagline: '初心者でも迷わない',
    price: '月980円〜',
    originalPrice: '月1,180円',
    discount: '17% OFF',
    rating: 4.5,
    users: '100万事業所',
    features: [
      '銀行・クレカ自動連携',
      'レシート写真で自動仕訳',
      'スマホアプリ完備',
      'サポート充実'
    ],
    highlight: '質問形式で簡単',
    color: 'from-blue-500 to-cyan-500',
    icon: '📊',
    trial: '30日間無料'
  },
  {
    id: 'moneyforward',
    name: 'マネーフォワード クラウド確定申告',
    description: '自動仕訳で入力作業を80%削減',
    tagline: '自動化No.1',
    price: '月800円〜',
    originalPrice: '月980円',
    discount: '初年度50% OFF',
    rating: 4.4,
    users: '70万事業所',
    features: [
      '2,400以上の金融機関連携',
      'AI自動仕訳',
      'リアルタイム損益確認',
      '請求書作成機能'
    ],
    highlight: '自動仕訳最強',
    color: 'from-green-500 to-emerald-500',
    icon: '🤖',
    trial: '1ヶ月無料'
  },
  {
    id: 'yayoi',
    name: '弥生会計 オンライン',
    description: '業界シェアNo.1の安心感',
    tagline: '25年連続売上No.1',
    price: '初年度無料',
    originalPrice: '月408円',
    discount: '1年間無料',
    rating: 4.3,
    users: '200万事業所',
    features: [
      '業界最安値',
      'サポート満足度95%',
      '簿記知識不要',
      'e-Tax対応'
    ],
    highlight: '最安値',
    color: 'from-orange-500 to-red-500',
    icon: '💰',
    trial: '1年間無料'
  }
]

// クレジットカード・銀行口座
const financialServices = [
  {
    id: 'bizcard',
    name: '三井住友カード ビジネスオーナーズ',
    description: '年会費永年無料の法人カード',
    tagline: '個人事業主・フリーランス向け',
    reward: '最大8,000円相当プレゼント',
    features: [
      '年会費永年無料',
      '最大1.5%ポイント還元',
      'ナンバーレスで最短5分発行',
      '会計ソフト連携'
    ],
    color: 'from-purple-500 to-pink-500',
    icon: '💳'
  },
  {
    id: 'gmocoin',
    name: 'GMOあおぞらネット銀行',
    description: 'フリーランス・個人事業主の定番',
    tagline: '振込手数料が安い',
    reward: '口座開設で1,000円プレゼント',
    features: [
      '他行宛振込 月1回無料',
      '会計ソフト連携',
      'ビジネスデビットカード',
      'スマホで完結'
    ],
    color: 'from-indigo-500 to-blue-500',
    icon: '🏦'
  }
]

// 保険・年金
const insuranceServices = [
  {
    id: 'hoken',
    name: '保険見直しラボ',
    description: 'フリーランス向け保険の無料相談',
    tagline: '平均年齢12.1年のベテランFP',
    reward: '相談で選べるギフトプレゼント',
    features: [
      '自宅・カフェで相談OK',
      '保険料平均33%削減',
      '強引な勧誘なし',
      '何度でも無料'
    ],
    color: 'from-teal-500 to-green-500',
    icon: '🛡️'
  }
]

export default function ConnectPage() {
  const [activeCategory, setActiveCategory] = useState<'accounting' | 'finance' | 'insurance'>('accounting')

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">
            👨‍💼 エキスパート
          </h1>
          <p className="text-purple-100">
            あなたの金融ウェルビーイングを支える専門家とツール
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('accounting')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === 'accounting'
                ? 'bg-white text-purple-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📊 会計ソフト
          </button>
          <button
            onClick={() => setActiveCategory('finance')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === 'finance'
                ? 'bg-white text-purple-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            💳 カード・口座
          </button>
          <button
            onClick={() => setActiveCategory('insurance')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === 'insurance'
                ? 'bg-white text-purple-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🛡️ 保険・年金
          </button>
        </div>
      </div>

      {/* Content - スクロール可能 */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-20" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="p-4 space-y-4">
        {/* Accounting Software */}
        {activeCategory === 'accounting' && accountingSoftware.map((software, index) => (
          <motion.div
            key={software.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${software.color} p-4 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{software.icon}</div>
                  <div>
                    <h3 className="font-bold text-xl">{software.name}</h3>
                    <p className="text-sm opacity-90">{software.tagline}</p>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-xs font-bold">{software.trial}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-300">{software.description}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2">
                {software.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{software.rating}</span>
                    <span className="text-xs text-gray-500">/ 5.0</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{software.users}が利用中</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-500 line-through">{software.originalPrice}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{software.price}</span>
                  </div>
                  <span className="text-xs text-red-500 font-semibold">{software.discount}</span>
                </div>
              </div>

              {/* CTA */}
              <AffiliateButton
                service={software.id as 'freee' | 'moneyforward' | 'yayoi'}
                source="connect"
                className="w-full"
              >
                {software.trial}で試してみる →
              </AffiliateButton>
            </div>
          </motion.div>
        ))}

        {/* Financial Services */}
        {activeCategory === 'finance' && financialServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className={`bg-gradient-to-r ${service.color} p-4 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{service.icon}</div>
                  <div>
                    <h3 className="font-bold text-xl">{service.name}</h3>
                    <p className="text-sm opacity-90">{service.tagline}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-300">{service.description}</p>

              {/* Reward Banner */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl">
                <p className="text-center font-bold text-gray-900">🎁 {service.reward}</p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg">
                無料で申し込む →
              </button>
            </div>
          </motion.div>
        ))}

        {/* Insurance Services */}
        {activeCategory === 'insurance' && insuranceServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className={`bg-gradient-to-r ${service.color} p-4 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{service.icon}</div>
                  <div>
                    <h3 className="font-bold text-xl">{service.name}</h3>
                    <p className="text-sm opacity-90">{service.tagline}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-300">{service.description}</p>

              {/* Reward Banner */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl">
                <p className="text-center font-bold text-gray-900">🎁 {service.reward}</p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="w-full py-3 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white rounded-xl font-bold transition-all shadow-lg">
                無料相談を予約する →
              </button>
            </div>
          </motion.div>
        ))}

        {/* Bottom CTA - Future UGC Platform Teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl text-white mt-8"
        >
          <div className="text-center space-y-3">
            <div className="text-4xl">🚀</div>
            <h3 className="text-xl font-bold">もっと多くのサービスを準備中</h3>
            <p className="text-sm text-purple-100">
              税理士、社労士、FPなど専門家による<br />
              あなたに最適なサービスをご紹介予定
            </p>
            <div className="bg-white/20 px-4 py-2 rounded-full inline-block">
              <span className="text-xs font-semibold">Coming Soon</span>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}