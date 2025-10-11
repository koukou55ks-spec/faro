'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * モバイルプレビュー専用ページ
 * 375×812 のiPhoneサイズでプレビュー
 */
export default function MobilePreviewPage() {
  const router = useRouter()
  const [currentUrl, setCurrentUrl] = useState('/faro')

  const pages = [
    { name: 'Faro Chat', url: '/faro' },
    { name: 'Main Chat', url: '/chat' },
    { name: 'Kakeibo', url: '/kakeibo' },
    { name: 'Workspace', url: '/workspace/workspace' },
    { name: 'Landing', url: '/' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">📱 Mobile Preview (375×812)</h1>
          <div className="flex gap-2 flex-wrap">
            {pages.map((page) => (
              <button
                key={page.url}
                onClick={() => setCurrentUrl(page.url)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentUrl === page.url
                    ? 'bg-violet-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          {/* iPhone 14 Pro フレーム */}
          <div className="relative">
            {/* デバイスフレーム */}
            <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
              {/* ノッチ */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10" />

              {/* スクリーン */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden relative" style={{ width: '375px', height: '812px' }}>
                <iframe
                  src={currentUrl}
                  className="w-full h-full border-0"
                  title="Mobile Preview"
                />
              </div>
            </div>

            {/* デバイス情報 */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>iPhone 14 Pro</p>
              <p className="text-xs">375 × 812px</p>
              <p className="text-xs text-violet-600 font-mono">{currentUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
