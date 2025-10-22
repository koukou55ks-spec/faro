import './globals.css'
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ErrorBoundary } from '../components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'ZeiGuide - 税金の疑問を即解決 | AI税務アシスタント',
  description: '確定申告、経費判定、節税アドバイスをAIが即答。freee・マネーフォワード等のツール比較、税理士紹介も。フリーランス・副業の税金相談なら。',
  keywords: ['確定申告', 'やり方', '税金相談', '経費判定', '節税', 'freee', 'マネーフォワード', '税理士紹介', 'フリーランス', '副業', '個人事業主', 'e-Tax'],
  authors: [{ name: 'ZeiGuide Team' }],
  metadataBase: new URL('https://taxhack.vercel.app'),
  openGraph: {
    title: 'ZeiGuide - 税金の疑問を即解決',
    description: '確定申告から経費判定まで、AIが24時間いつでも回答。税理士費用の1/10以下で専門知識が手に入る。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'ZeiGuide',
    images: [
      {
        url: '/api/og?title=ZeiGuide&description=税金の疑問を即解決',
        width: 1200,
        height: 630,
        alt: 'ZeiGuide - AI税務アシスタント',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZeiGuide - 税金の疑問を即解決',
    description: '確定申告、経費判定、節税アドバイスをAIが即答。freee・マネーフォワード等のツール比較も。',
    images: ['/api/og?title=ZeiGuide&description=税金の疑問を即解決'],
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
