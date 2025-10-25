import './globals.css'
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Faro - あなたの生涯お金思考パートナー | AI税金・金融アシスタント',
  description: '税金・お金の疑問をAIが即答。確定申告、節税、資産運用、ライフプランまで。あなたの状況に合わせたパーソナライズされたアドバイスを提供します。',
  keywords: ['税金相談', '確定申告', '節税', '資産運用', 'NISA', 'iDeCo', 'ライフプラン', '住宅ローン', 'AI', 'フリーランス', '副業', '個人事業主'],
  authors: [{ name: 'Faro Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://faro10.vercel.app'),
  openGraph: {
    title: 'Faro - あなたの生涯お金思考パートナー',
    description: '税金・お金の疑問をAIが即答。あなたの状況に合わせたパーソナライズされたアドバイスを提供します。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'Faro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Faro - あなたの生涯お金思考パートナー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faro - あなたの生涯お金思考パートナー',
    description: '税金・お金の疑問をAIが即答。あなたの状況に合わせたパーソナライズされたアドバイスを提供します。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZeiGuide',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
