import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Faro - あなたのパーソナルCFO',
  description: '知識格差を是正し、富裕層が持つ金融戦略を民主化するAI CFOアプリケーション',
  metadataBase: new URL('https://faro.app'),
  openGraph: {
    title: 'Faro - パーソナルCFO AI',
    description: '知識格差を是正し、誰もが富裕層の知恵にアクセスできる',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
