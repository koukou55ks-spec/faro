# Stripe Webhook設定ガイド（本番環境）

Vercel WebhookではなくStripe Webhookを設定します。

## 🎯 Stripe Webhook設定手順

### 1. Stripe Dashboardにアクセス

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. **本番モード**であることを確認（左上のトグル）
3. [Webhooks](https://dashboard.stripe.com/webhooks)に移動

---

### 2. エンドポイントを追加

1. **「エンドポイントを追加」**をクリック
2. 以下を入力:

#### エンドポイントURL
```
https://faro10.vercel.app/api/stripe/webhook
```

#### リッスンするイベント
以下の4つを選択（必須）:

- ☑ `customer.subscription.created`
- ☑ `customer.subscription.updated`
- ☑ `customer.subscription.deleted`
- ☑ `invoice.payment_succeeded`

3. **「エンドポイントを追加」**をクリックして保存

---

### 3. Webhook Signing Secretを取得

1. 作成したエンドポイントをクリック
2. **「Signing secret」**セクションで「表示」をクリック
3. `whsec_...` で始まる文字列をコピー

---

### 4. Vercel環境変数に追加

1. [Vercel Dashboard](https://vercel.com/dashboard)を開く
2. faro10プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下を**Production**環境に追加:

```bash
# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SIGNING_SECRET_HERE
```

5. **Save**をクリック

---

### 5. Vercel再デプロイ

環境変数を追加した後、再デプロイして反映:

```bash
# ローカルから
git add .
git commit -m "feat: Stripe本番環境設定完了"
git push origin main
```

または、Vercel Dashboard → Deployments → 「Redeploy」

---

### 6. Webhookテスト

#### Stripe Dashboardでテスト

1. Webhooksページで作成したエンドポイントをクリック
2. **「テストイベントを送信」**タブに移動
3. `customer.subscription.created` を選択して送信
4. ステータスが **200 OK** であれば成功

#### 本番決済でテスト

1. https://faro10.vercel.app/app にアクセス
2. 「Proにアップグレード」をクリック
3. Stripeチェックアウトで本番カードで決済
4. 決済完了後:
   - Stripe Dashboard → Webhooksで成功ログ確認
   - Supabase `subscriptions`テーブルで新レコード確認

---

## 🔍 トラブルシューティング

### エラー: Webhook signature verification failed

**原因**: Webhook Secretが間違っているか古い

**解決策**:
1. Stripe Dashboard → Webhooksで正しいSigning secretを確認
2. Vercel環境変数の`STRIPE_WEBHOOK_SECRET`を更新
3. 再デプロイ

---

### エラー: 404 Not Found

**原因**: Webhook URLが間違っている

**解決策**:
1. URL: `https://faro10.vercel.app/api/stripe/webhook` を確認
2. HTTPSであることを確認（HTTPは不可）

---

### エラー: 500 Internal Server Error

**原因**: サーバーサイドのコードエラー

**解決策**:
1. Vercel Dashboard → Logsでエラー内容を確認
2. Supabase接続情報が正しいか確認
3. Stripe APIキーが正しいか確認

---

## ✅ 完了チェックリスト

- [ ] Stripe Webhookエンドポイント作成
- [ ] 4つのイベントを選択
- [ ] Signing secretをコピー
- [ ] Vercel環境変数に`STRIPE_WEBHOOK_SECRET`を追加
- [ ] Vercel再デプロイ
- [ ] Webhookテスト成功（200 OK）
- [ ] 本番決済テスト完了

---

## 📌 注意事項

- **Vercel Webhookは不要**: Stripe決済にはStripe Webhookのみ必要
- **無料プランで動作**: Vercel無料プランでもStripe Webhookは使える
- **本番カード**: テストカード番号ではなく本番カードで決済テスト

---

**これでStripe本番環境の設定完了です！🚀**
