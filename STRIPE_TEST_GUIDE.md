# Stripe統合テストガイド

## ✅ 実装完了項目

### バックエンドAPI
- ✅ `/api/stripe/create-checkout-session` - チェックアウトセッション作成
- ✅ `/api/stripe/webhook` - Stripe Webhookハンドラー
- ✅ `/api/subscription/status` - サブスクリプションステータス取得
- ✅ `/api/usage/check` - 使用量確認
- ✅ `/api/usage/increment` - 使用量カウントアップ

### フロントエンド
- ✅ `PricingPlans` - 料金プラン表示コンポーネント
- ✅ `UsageIndicator` - 使用状況表示コンポーネント
- ✅ `useSubscription` - サブスクリプション状態管理フック
- ✅ `/app` ページに料金プラン統合済み

### データベース
- ✅ `subscriptions` テーブル
- ✅ `usage_limits` テーブル
- ✅ RLSポリシー設定済み
- ✅ インデックス最適化済み

## 🧪 テスト手順

### 1. 事前準備

#### Stripe APIキーの取得
1. [Stripe Dashboard](https://dashboard.stripe.com) にログイン
2. **開発者 → APIキー** に移動
3. 以下をコピー:
   - 公開可能キー (`pk_test_...`)
   - シークレットキー (`sk_test_...`)

#### 環境変数の設定
`.env.local` ファイルに以下を追加:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 商品とPriceの作成
1. Stripe Dashboard → **商品 → 商品を追加**
2. 以下を入力:
   - 商品名: `Faro Pro`
   - 価格: `¥980`
   - 請求サイクル: `月次`
3. Price IDをコピー (`price_xxxxx`)
4. `.env.local` の `NEXT_PUBLIC_STRIPE_PRICE_ID` に設定

#### Webhookのセットアップ（ローカル）
ターミナルで以下を実行:

```bash
# Stripe CLIをインストール (Windows)
scoop install stripe

# Stripe CLIにログイン
stripe login

# Webhookをローカルにフォワード
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

表示されるWebhook Signing Secretをコピーし、`.env.local` の `STRIPE_WEBHOOK_SECRET` に設定。

#### データベースマイグレーション
Supabase Dashboardで以下のSQLを実行:

```bash
# Supabase SQL Editor で実行
supabase/migrations/20250115_add_subscriptions.sql
```

### 2. 機能テスト

#### テスト2-1: 料金プラン表示
1. http://localhost:3000/app にアクセス
2. サイドバーで **料金プラン** をクリック
3. 確認項目:
   - ✅ 無料プランとProプランが表示される
   - ✅ Proプランに「おすすめ」バッジが表示される
   - ✅ 各プランの機能リストが正しく表示される
   - ✅ ボタンが表示される（ゲストユーザーの場合）

#### テスト2-2: チェックアウトフロー（ゲストユーザー）
1. **Proにアップグレード** ボタンをクリック
2. 確認項目:
   - ❌ ゲストユーザーは決済できない（認証必須）
   - ✅ ログインページにリダイレクトされる（今後実装）

#### テスト2-3: チェックアウトフロー（認証ユーザー）
1. ログイン後、**Proにアップグレード** ボタンをクリック
2. Stripeチェックアウトページにリダイレクトされる
3. 確認項目:
   - ✅ チェックアウトページが正しく表示される
   - ✅ 商品名が `Faro Pro` である
   - ✅ 価格が `¥980/月` である

#### テスト2-4: テスト決済
チェックアウトページで以下を入力:

**成功ケース:**
- カード番号: `4242 4242 4242 4242`
- 有効期限: `12/34` (未来の日付)
- CVC: `123`
- 郵便番号: `123-4567`

**失敗ケース（テスト用）:**
- カード番号: `4000 0000 0000 0002` (決済失敗)
- カード番号: `4000 0025 0000 3155` (3Dセキュア認証)

#### テスト2-5: Webhook動作確認
決済完了後、Stripe CLIのターミナルで以下を確認:

```
✔ Received event checkout.session.completed
✔ Received event customer.subscription.created
✔ Received event customer.subscription.updated
```

サーバーログで以下を確認:

```
[Stripe Webhook] Event type: checkout.session.completed
[Stripe Webhook] Subscription created for user: xxxxx
```

#### テスト2-6: データベース確認
Supabase Dashboard → **Table Editor** で確認:

**subscriptions テーブル:**
- ✅ 新しいレコードが作成されている
- ✅ `status` が `active`
- ✅ `plan` が `pro`
- ✅ `stripe_customer_id` が設定されている
- ✅ `stripe_subscription_id` が設定されている
- ✅ `current_period_start` と `current_period_end` が正しい

**usage_limits テーブル:**
- ✅ レコードが存在する（まだ使用していない場合は0）

#### テスト2-7: サブスクリプションステータス表示
1. アプリに戻る（自動リダイレクト）
2. 確認項目:
   - ✅ サイドバーの使用状況インジケータが `Proプラン` と表示される
   - ✅ 「無制限利用可能」と表示される
   - ✅ 料金プランページで `現在のプラン` ボタンが表示される

#### テスト2-8: 使用量カウント
1. チャットで質問を送信
2. Supabase Dashboard → **Table Editor** → `usage_limits` を確認
3. 確認項目:
   - ✅ `ai_messages_count` がインクリメントされている（無料プランの場合のみ）
   - ✅ Proプランの場合はカウントされない（無制限）

#### テスト2-9: 無料プラン制限
1. ログアウト
2. ゲストユーザーとしてチャットを30回以上送信
3. 確認項目:
   - ✅ 使用状況インジケータが更新される
   - ✅ 30回到達時に制限メッセージが表示される（今後実装）

#### テスト2-10: サブスクリプションキャンセル
Stripe Dashboard → **顧客** → 該当顧客 → **サブスクリプション** → **キャンセル**

Webhook動作確認:
```
✔ Received event customer.subscription.deleted
[Stripe Webhook] Subscription canceled for user: xxxxx
```

データベース確認:
- ✅ `status` が `canceled`
- ✅ `plan` が `free` に戻る

### 3. エッジケーステスト

#### エッジ3-1: 決済失敗時の動作
- カード番号: `4000 0000 0000 0002` で決済
- 確認: チェックアウトページでエラーが表示される
- 確認: データベースには何も記録されない

#### エッジ3-2: Webhook署名検証失敗
- Stripe CLIを停止した状態で決済を試す
- 確認: Webhookが受信されない（ローカルのみ）

#### エッジ3-3: 重複決済の防止
- 同じユーザーで2回決済を試す
- 確認: Stripeが自動的に既存サブスクリプションを更新する

#### エッジ3-4: 月が変わったときの使用量リセット
- `usage_limits` テーブルの `month` を手動で変更
- チャットを送信
- 確認: 新しい月のレコードが作成される

## 🔧 トラブルシューティング

### エラー: "Invalid API Key"
**原因:** `.env.local` のAPIキーが間違っている
**解決策:** Stripe Dashboardから正しいキーをコピーして再設定

### エラー: "Webhook signature verification failed"
**原因:** Webhook Secretが間違っている
**解決策:**
1. Stripe CLIを再起動: `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`
2. 表示される新しいSecretを `.env.local` に設定
3. 開発サーバーを再起動

### エラー: "Failed to create checkout session"
**原因:** Price IDが間違っている
**解決策:**
1. Stripe Dashboard → **商品** → Price IDを確認
2. `.env.local` の `NEXT_PUBLIC_STRIPE_PRICE_ID` を更新

### Webhookが受信されない
**原因:** Stripe CLIが実行されていない
**解決策:**
```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```
を実行し続ける（バックグラウンドで実行推奨）

### サブスクリプションが反映されない
**原因:** Webhook処理でエラーが発生している
**解決策:**
1. サーバーログを確認: `[Stripe Webhook]` で検索
2. Supabase RLSポリシーを確認
3. `subscriptions` テーブルに手動でレコードを作成してテスト

## 📊 本番環境への移行

### 1. Stripeを本番モードに切り替え
1. Stripe Dashboard → **本番環境に切り替え**
2. 新しいAPIキーを取得 (`pk_live_...`, `sk_live_...`)
3. Vercel環境変数に設定

### 2. 本番Webhookの設定
1. Stripe Dashboard → **開発者 → Webhook → エンドポイントを追加**
2. URL: `https://yourdomain.com/api/stripe/webhook`
3. イベント:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Webhook Signing Secretをコピー
5. Vercelの `STRIPE_WEBHOOK_SECRET` に設定

### 3. セキュリティチェック
- ✅ `.env.local` が `.gitignore` に含まれている
- ✅ APIキーがコードにハードコードされていない
- ✅ RLSポリシーが全テーブルで有効
- ✅ HTTPS接続のみを許可

## 🎯 成功基準

すべてのテストケースが✅であれば、Stripe統合は完全に機能しています。

### チェックリスト
- [ ] 料金プランが正しく表示される
- [ ] チェックアウトセッションが作成される
- [ ] Stripeチェックアウトページにリダイレクトされる
- [ ] テスト決済が成功する
- [ ] Webhookが正しく受信される
- [ ] データベースに正しくレコードが作成される
- [ ] サブスクリプションステータスが正しく表示される
- [ ] 使用量がカウントされる（無料プランのみ）
- [ ] Proプランは無制限に使用できる
- [ ] サブスクリプションキャンセルが機能する

すべてチェックが完了したら、本番デプロイの準備完了です！
