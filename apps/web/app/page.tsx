import { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Shield, Zap, Brain, ArrowRight, Check, Star, TrendingUp, Users, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Faro - あなたのパーソナルCFO | AI金融アドバイザー',
  description: '税務・財務・投資に関する専門家レベルの金融アドバイスをAIが24時間365日提供。確定申告、節税対策、資産運用まで、あなたの金融ライフを完全サポート。',
  keywords: ['AI金融アドバイザー', 'パーソナルCFO', '税務相談', '確定申告', '節税対策', '資産運用', '投資アドバイス', '家計簿アプリ', 'ファイナンシャルプランニング'],
  openGraph: {
    title: 'Faro - あなたのパーソナルCFO',
    description: '専門家レベルの金融アドバイスをAIが提供。税務・投資・財務管理を一元化。',
    type: 'website',
    url: 'https://faro.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Faro - Your Personal CFO',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faro - あなたのパーソナルCFO',
    description: '専門家レベルの金融アドバイスをAIが提供',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://faro.app',
  },
}

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Faro',
  applicationCategory: 'FinanceApplication',
  description: '税務・財務・投資に関する専門家レベルの金融アドバイスをAIが提供するパーソナルCFOアプリ',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
  author: {
    '@type': 'Organization',
    name: 'Faro Inc.',
    url: 'https://faro.app',
  },
}

const features = [
  {
    icon: Brain,
    title: 'AI金融アドバイザー',
    description: '税理士・FP級の専門知識で24時間サポート',
  },
  {
    icon: Shield,
    title: '完全プライバシー保護',
    description: '銀行レベルのセキュリティで大切な情報を守る',
  },
  {
    icon: Zap,
    title: '即座に回答',
    description: '複雑な税務相談も数秒で的確なアドバイス',
  },
  {
    icon: TrendingUp,
    title: '資産最適化',
    description: '節税・投資戦略で資産形成を加速',
  },
]

const testimonials = [
  {
    name: '山田太郎',
    role: '個人事業主',
    content: '確定申告の準備が驚くほど簡単になりました。節税アドバイスのおかげで、昨年より30万円も節約できました。',
    rating: 5,
  },
  {
    name: '佐藤花子',
    role: '会社員',
    content: 'iDeCoとNISAの違いがやっと理解できました。将来の資産形成に自信が持てるようになりました。',
    rating: 5,
  },
  {
    name: '鈴木一郎',
    role: 'フリーランス',
    content: '経費計算から確定申告まで、全てFaroにお任せ。税理士に頼むより断然お得です。',
    rating: 5,
  },
]

const stats = [
  { value: '50,000+', label: 'アクティブユーザー' },
  { value: '4.8', label: 'ユーザー評価' },
  { value: '¥3.2億', label: '節税実績' },
  { value: '24/7', label: 'サポート対応' },
]

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Faro</span>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition">機能</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">お客様の声</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">料金</a>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition shadow-md"
                >
                  無料で始める
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              あなたのパーソナルCFO
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              税務・財務・投資のプロフェッショナルな知識を、<br />
              AIが24時間365日提供します
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition shadow-lg text-lg font-semibold"
              >
                無料で相談を始める
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-lg border border-gray-200 text-lg font-semibold"
              >
                デモを見る
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                <span>クレカ登録不要</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                <span>30日間無料</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                <span>いつでも解約可能</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                プロの金融アドバイスを、誰もが使える形に
              </h2>
              <p className="text-lg text-gray-600">
                富裕層だけが持っていた金融知識を、AIテクノロジーで民主化
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                お客様の声
              </h2>
              <p className="text-lg text-gray-600">
                すでに多くの方々の金融ライフを改善しています
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-xl shadow-md"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              今すぐ始めて、金融の不安から解放されましょう
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              30日間の無料トライアル。クレジットカード不要。
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition shadow-lg text-lg font-semibold"
            >
              無料で始める
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Faro</span>
                </div>
                <p className="text-gray-400 text-sm">
                  あなたの一生涯の金融思考パートナー
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">製品</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">機能</a></li>
                  <li><a href="#" className="hover:text-white transition">料金</a></li>
                  <li><a href="#" className="hover:text-white transition">セキュリティ</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">会社</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">会社概要</a></li>
                  <li><a href="#" className="hover:text-white transition">採用情報</a></li>
                  <li><a href="#" className="hover:text-white transition">お問い合わせ</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">法的情報</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="/terms" className="hover:text-white transition">利用規約</a></li>
                  <li><a href="/privacy" className="hover:text-white transition">プライバシーポリシー</a></li>
                  <li><a href="/law" className="hover:text-white transition">特定商取引法</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
              © 2024 Faro Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}