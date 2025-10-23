import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. サービス概要</h2>
          <p className="text-gray-700 mb-4">
            Faro（以下「本サービス」）は、AI技術を活用したパーソナルCFOサービスです。
            税務・財務に関するアドバイスを提供しますが、これは情報提供を目的としており、
            法的助言や税務申告代行サービスではありません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. 利用資格</h2>
          <p className="text-gray-700 mb-4">
            本サービスは18歳以上の個人または法人がご利用いただけます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. 料金とサブスクリプション</h2>
          <p className="text-gray-700 mb-4">
            - 無料プラン: 基本機能のみ利用可能<br />
            - スタンダードプラン: 月額500円（税込）<br />
            - プレミアムプラン: 月額1,500円（税込）
          </p>
          <p className="text-gray-700 mb-4">
            料金は毎月自動で請求されます。キャンセルはいつでも可能です。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. 免責事項</h2>
          <p className="text-gray-700 mb-4">
            本サービスが提供する情報は参考情報であり、税務申告や法的判断の最終責任はユーザー様にあります。
            重要な判断を行う際は、必ず税理士等の専門家にご相談ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. データの取り扱い</h2>
          <p className="text-gray-700 mb-4">
            ユーザーが入力したデータは、サービス改善のために利用されますが、
            個人を特定できる形での第三者提供は行いません。
            詳細は<a href="/privacy" className="text-blue-600 underline">プライバシーポリシー</a>をご覧ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. 禁止事項</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>本サービスを不正な目的で利用すること</li>
            <li>他のユーザーに迷惑をかける行為</li>
            <li>サービスの運営を妨害する行為</li>
            <li>第三者の権利を侵害する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. サービスの変更・終了</h2>
          <p className="text-gray-700 mb-4">
            当社は事前の通知なく、サービスの内容を変更または終了する権利を留保します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. 準拠法と管轄裁判所</h2>
          <p className="text-gray-700 mb-4">
            本規約は日本法に準拠し、本サービスに関する紛争については、
            東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
