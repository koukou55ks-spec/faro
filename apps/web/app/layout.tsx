import './globals.css'
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Faro - あなたのパーソナルCFO',
  description: '税務・財務・投資に関する専門家レベルの金融アドバイスをAIが提供。あなたの一生涯の金融思考パートナー。',
  keywords: ['金融アドバイス', 'AI CFO', '税務相談', '投資戦略', '財務管理', '確定申告', 'パーソナルファイナンス'],
  authors: [{ name: 'Faro Team' }],
  metadataBase: new URL('https://faro.app'),
  openGraph: {
    title: 'Faro - パーソナルCFO AI',
    description: '知識格差を是正し、誰もが富裕層の知恵にアクセスできる',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'Faro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Faro - Your Personal CFO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faro - あなたのパーソナルCFO',
    description: '税務・財務・投資に関する専門家レベルの金融アドバイスをAIが提供',
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
    title: 'Faro',
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
