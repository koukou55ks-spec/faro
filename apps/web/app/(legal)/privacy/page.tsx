import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. 収集する情報</h2>
          <p className="text-gray-700 mb-4">
            本サービスでは、以下の情報を収集します：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>アカウント情報（メールアドレス、パスワード）</li>
            <li>プロフィール情報（年齢、職業、収入レンジ）</li>
            <li>ノート・メモの内容</li>
            <li>チャット履歴</li>
            <li>利用状況データ（アクセスログ、使用機能）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. 情報の利用目的</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>パーソナライズされたアドバイスの提供</li>
            <li>サービスの改善と新機能の開発</li>
            <li>カスタマーサポート</li>
            <li>統計分析（個人を特定できない形式）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. データフライホイール（集合知）</h2>
          <p className="text-gray-700 mb-4">
            本サービスは、ユーザー全体のデータを匿名化・統計化して、
            他のユーザーへのアドバイス精度向上に活用します（データフライホイール）。
          </p>
          <p className="text-gray-700 mb-4">
            例: 「30代・年収500-700万・会社員・節税目的」という匿名化されたペルソナで
            成功パターンを分析し、類似ユーザーに提案します。
          </p>
          <p className="text-gray-700 mb-4">
            個人を特定できる情報（氏名、具体的な会社名など）は除外されます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. 情報の第三者提供</h2>
          <p className="text-gray-700 mb-4">
            以下の場合を除き、個人情報を第三者に提供しません：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護に必要な場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. 利用する外部サービス</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>Supabase（データベース・認証）- プライバシーポリシー: <a href="https://supabase.com/privacy" target="_blank" rel="noopener" className="text-blue-600 underline">リンク</a></li>
            <li>Google Gemini（AI推論）- プライバシーポリシー: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="text-blue-600 underline">リンク</a></li>
            <li>Sentry（エラー監視）- プライバシーポリシー: <a href="https://sentry.io/privacy/" target="_blank" rel="noopener" className="text-blue-600 underline">リンク</a></li>
            <li>Stripe（決済処理）- プライバシーポリシー: <a href="https://stripe.com/privacy" target="_blank" rel="noopener" className="text-blue-600 underline">リンク</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. データの保管期間</h2>
          <p className="text-gray-700 mb-4">
            アカウント削除後も、統計データ（匿名化済み）は保持されますが、
            個人を特定できるデータは30日以内に削除されます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. セキュリティ</h2>
          <p className="text-gray-700 mb-4">
            当社は、以下のセキュリティ対策を実施しています：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>データの暗号化（通信・保存）</li>
            <li>アクセス制御（最小権限の原則）</li>
            <li>定期的なセキュリティ監査</li>
            <li>エラー監視とアラート</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. ユーザーの権利</h2>
          <p className="text-gray-700 mb-4">
            ユーザーは以下の権利を有します：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>個人情報の開示請求</li>
            <li>個人情報の訂正・削除請求</li>
            <li>データフライホイールへの参加オプトアウト</li>
            <li>アカウント削除</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Cookie・トラッキング</h2>
          <p className="text-gray-700 mb-4">
            本サービスは、ユーザー体験向上のためCookieを使用します。
            ブラウザ設定でCookieを無効化できますが、一部機能が制限される場合があります。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. ポリシーの変更</h2>
          <p className="text-gray-700 mb-4">
            本ポリシーは予告なく変更される場合があります。
            重要な変更はメールまたはアプリ内通知でお知らせします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">11. お問い合わせ</h2>
          <p className="text-gray-700 mb-4">
            プライバシーに関するご質問は、以下までご連絡ください：<br />
            Email: privacy@faro.app
          </p>
        </section>

        <div className="mt-12 text-sm text-gray-500">
          <p>最終更新日: 2025年10月8日</p>
          <p className="mt-2">
            <Link href="/" className="text-blue-600 underline">トップページに戻る</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
