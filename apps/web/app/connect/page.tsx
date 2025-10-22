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
  Briefcase
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AffiliateButton } from '../../src/components/AffiliateLink'

const taxExperts = [
  {
    id: 1,
    name: '山田 花子',
    title: '税理士・CFP',
    speciality: 'フリーランス・個人事業主',
    rating: 4.9,
    reviews: 127,
    price: '初回相談無料',
    location: 'オンライン対応',
    badge: '認定専門家',
    image: '👩‍💼'
  },
  {
    id: 2,
    name: '佐藤 健一',
    title: '税理士',
    speciality: '不動産・相続税',
    rating: 4.8,
    reviews: 89,
    price: '¥5,000/30分',
    location: '東京・オンライン',
    badge: '人気',
    image: '👨‍💼'
  },
  {
    id: 3,
    name: '鈴木 美咲',
    title: '税理士・社労士',
    speciality: '起業・法人設立',
    rating: 4.7,
    reviews: 64,
    price: '¥3,000/30分',
    location: 'オンライン専門',
    image: '👩‍💼'
  }
]

const recommendedTools = [
  {
    name: 'freee会計',
    description: '初心者向け確定申告ソフト',
    price: '月980円〜',
    rating: 4.5,
    users: '100万人以上',
    highlight: '質問形式で簡単',
    color: 'bg-blue-500'
  },
  {
    name: 'マネーフォワード',
    description: '銀行連携が強い会計ソフト',
    price: '月800円〜',
    rating: 4.4,
    users: '70万人以上',
    highlight: '自動仕訳',
    color: 'bg-green-500'
  },
  {
    name: '弥生会計',
    description: '定番の会計ソフト',
    price: '月408円〜',
    rating: 4.3,
    users: '200万人以上',
    highlight: '最安値',
    color: 'bg-orange-500'
  }
]

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState<'experts' | 'tools'>('experts')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            つながる
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            専門家とツールをご紹介
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('experts')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'experts'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            税理士に相談
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tools'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            おすすめツール
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'experts' ? (
        <div className="p-4 space-y-4">
          {/* Filter */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                オンライン
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                初回無料
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                フリーランス専門
              </button>
            </div>
            <button className="p-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Expert Cards */}
          {taxExperts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <div className="text-4xl">{expert.image}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {expert.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {expert.title}
                      </p>
                      {expert.badge && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs rounded-full">
                          {expert.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {expert.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {expert.reviews}件のレビュー
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {expert.speciality}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {expert.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {expert.price}
                    </div>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                      相談する
                    </button>
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* More Experts CTA */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl">
            <h3 className="text-white font-bold mb-2">
              もっと多くの専門家を探す
            </h3>
            <p className="text-white/90 text-sm mb-3">
              全国1,000人以上の税理士から最適な専門家をご紹介
            </p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm">
              無料で税理士を探す →
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Tools Grid */}
          {recommendedTools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tool.description}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 ${tool.color} bg-opacity-10 text-sm rounded-full`}>
                    <span className={`${tool.color.replace('bg-', 'text-')}`}>
                      {tool.highlight}
                    </span>
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{tool.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {tool.users}
                  </p>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {tool.price}
                  </span>
                  <AffiliateButton
                    service={tool.name === 'freee会計' ? 'freee' : tool.name === 'マネーフォワード' ? 'moneyforward' : 'yayoi'}
                    source="connect"
                  >
                    無料で試す
                  </AffiliateButton>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Comparison CTA */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              📊 詳しい比較を見る
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              機能・価格・使いやすさを徹底比較
            </p>
            <button className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm">
              ツール比較表を見る →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}