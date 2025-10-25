'use client'

import { Info, ExternalLink, Mail, Github, Twitter, FileText, Shield } from 'lucide-react'

export function AboutSection() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">アプリ情報</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Faroについての情報と各種リンク
        </p>
      </div>

      {/* アプリ情報 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Info className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Faro</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI税金アシスタント
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <InfoRow label="バージョン" value="1.0.0" />
          <InfoRow label="ビルド" value="2025.01.24" />
          <InfoRow label="環境" value={process.env.NODE_ENV || 'production'} />
        </div>
      </section>

      {/* Faroについて */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Faroとは</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Faroは、AIを活用した税金アシスタントアプリです。
          あなたの状況に合わせた節税アドバイスや、確定申告のサポートを提供します。
        </p>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
            <span>Gemini 1.5 Flashによる高速AI回答</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
            <span>パーソナライズされた節税アドバイス</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
            <span>確定申告シミュレーター</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
            <span>税金関連書類のドキュメント管理</span>
          </li>
        </ul>
      </section>

      {/* 法的情報 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          法的情報
        </h3>

        <div className="space-y-2">
          <LinkItem
            icon={<FileText className="w-5 h-5" />}
            label="利用規約"
            href="/terms"
          />
          <LinkItem
            icon={<Shield className="w-5 h-5" />}
            label="プライバシーポリシー"
            href="/privacy"
          />
          <LinkItem
            icon={<FileText className="w-5 h-5" />}
            label="特定商取引法に基づく表記"
            href="/legal"
          />
        </div>
      </section>

      {/* サポート・お問い合わせ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          サポート・お問い合わせ
        </h3>

        <div className="space-y-2">
          <LinkItem
            icon={<Mail className="w-5 h-5" />}
            label="お問い合わせ"
            href="mailto:support@faro.app"
            external
          />
          <LinkItem
            icon={<FileText className="w-5 h-5" />}
            label="ヘルプセンター"
            href="/help"
          />
          <LinkItem
            icon={<FileText className="w-5 h-5" />}
            label="よくある質問"
            href="/faq"
          />
        </div>
      </section>

      {/* SNS・リンク */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          フォローする
        </h3>

        <div className="space-y-2">
          <LinkItem
            icon={<Twitter className="w-5 h-5" />}
            label="Twitter"
            href="https://twitter.com/faro_app"
            external
          />
          <LinkItem
            icon={<Github className="w-5 h-5" />}
            label="GitHub"
            href="https://github.com/faro-app"
            external
          />
        </div>
      </section>

      {/* ライセンス情報 */}
      <section className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          © 2025 Faro. All rights reserved.
        </p>
      </section>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

function LinkItem({
  icon,
  label,
  href,
  external = false,
}: {
  icon: React.ReactNode
  label: string
  href: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
    </a>
  )
}
