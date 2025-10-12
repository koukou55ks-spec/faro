'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles, TrendingUp, Shield, Brain, Zap, ArrowRight,
  Star, Users, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered CFO',
      description: '最先端AIがあなた専属の財務アドバイザーとして機能'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '法律順守モード',
      description: '税理士レベルの正確な法的根拠と計算'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '支出最適化',
      description: 'AI分析で無駄な支出を自動検出・改善提案'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '統合ワークスペース',
      description: '家計簿・ノート・チャットが1つに統合'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 mb-8"
            >
              <Sparkles className="w-10 h-10" />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Faro
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4 font-medium px-4">
              Your AI-Powered Financial Operating System
            </p>

            <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              富裕層だけが知る財務知識を、AIで誰もがアクセス可能に。<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>知識格差を是正し、すべての人に財務的自由を。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                onClick={() => router.push('/chat')}
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-2xl w-full sm:w-auto"
              >
                無料で始める <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button
                onClick={() => router.push('/workspace')}
                size="lg"
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-2xl w-full sm:w-auto"
              >
                Workspaceを見る
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16 px-4">
            なぜFaroが選ばれるのか
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-violet-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center">
            {[
              { value: '10,000+', label: 'アクティブユーザー', icon: <Users /> },
              { value: '¥50億+', label: '最適化された資産', icon: <BarChart3 /> },
              { value: '4.9★', label: 'ユーザー評価', icon: <Star /> }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-8"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">
            財務の未来を、今すぐ体験
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 px-4">
            無料で始めて、AIパーソナルCFOの力を実感してください
          </p>
          <Button
            onClick={() => router.push('/chat')}
            size="lg"
            className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg rounded-2xl mx-4"
          >
            今すぐ無料で始める <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-500" />
              <span className="font-bold text-xl">Faro</span>
            </div>

            <div className="flex gap-6 text-sm text-gray-400">
              <button onClick={() => router.push('/terms')} className="hover:text-white transition-colors">
                利用規約
              </button>
              <button onClick={() => router.push('/privacy')} className="hover:text-white transition-colors">
                プライバシーポリシー
              </button>
              <button onClick={() => router.push('/refund')} className="hover:text-white transition-colors">
                特定商取引法
              </button>
            </div>

            <p className="text-sm text-gray-500">
              © 2025 Faro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
