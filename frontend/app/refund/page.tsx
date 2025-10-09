export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">返金ポリシー</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. 基本方針</h2>
          <p className="text-gray-700 mb-4">
            Faroは月額サブスクリプション制サービスです。
            サービスの性質上、原則として返金は承っておりませんが、
            以下の場合に限り返金対応を検討いたします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. 返金対象となる場合</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>サービスの重大な障害により、連続して3日以上利用できなかった場合</li>
            <li>二重課金など、当社のシステムエラーにより誤った請求が行われた場合</li>
            <li>初回決済後、7日以内でサービスを一度も利用していない場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. 返金対象外となる場合</h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>ユーザー都合によるキャンセル（サービスが正常に提供されている場合）</li>
            <li>一度でもサービスを利用した後のキャンセル</li>
            <li>無料トライアル期間終了後の自動課金</li>
            <li>アカウント停止・凍結（利用規約違反）の場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. 返金の手続き</h2>
          <p className="text-gray-700 mb-4">
            返金をご希望の場合は、以下の情報を添えてお問い合わせください：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>登録メールアドレス</li>
            <li>決済日</li>
            <li>返金を希望する理由</li>
            <li>該当する場合、障害の発生日時</li>
          </ul>
          <p className="text-gray-700 mb-4 mt-4">
            お問い合わせ先: support@faro.app
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. 返金処理期間</h2>
          <p className="text-gray-700 mb-4">
            返金申請が承認された場合、以下の期間で処理されます：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>審査期間: 3-5営業日</li>
            <li>返金処理: 承認後5-10営業日</li>
            <li>お客様の口座への反映: 決済方法により異なる（最大30日）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. サブスクリプションのキャンセル</h2>
          <p className="text-gray-700 mb-4">
            サブスクリプションはいつでもキャンセル可能です。
            キャンセル後も、現在の請求期間終了までサービスは利用できます。
          </p>
          <p className="text-gray-700 mb-4">
            キャンセル方法: アプリ内「設定」→「サブスクリプション」→「キャンセル」
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. 日割り計算について</h2>
          <p className="text-gray-700 mb-4">
            月の途中でのキャンセルや返金の場合、日割り計算は行いません。
            次回の自動更新を停止する形での対応となります。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. 無料トライアル</h2>
          <p className="text-gray-700 mb-4">
            無料トライアル期間中にキャンセルした場合、料金は発生しません。
            トライアル終了日の24時間前までにキャンセルしてください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. 特別な事情による返金</h2>
          <p className="text-gray-700 mb-4">
            上記に該当しない場合でも、特別な事情がある場合は個別に審査いたします。
            まずはお問い合わせください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. ポリシーの変更</h2>
          <p className="text-gray-700 mb-4">
            本ポリシーは予告なく変更される場合があります。
            変更後も、変更前の契約に基づく返金申請は有効です。
          </p>
        </section>

        <div className="mt-12 text-sm text-gray-500">
          <p>最終更新日: 2025年10月8日</p>
          <p className="mt-2">
            <a href="/" className="text-blue-600 underline">トップページに戻る</a>
          </p>
        </div>
      </div>
    </div>
  )
}
