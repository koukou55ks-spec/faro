# Stripe課金機能セットアップガイド

## 📌 重要: 本番環境優先

このガイドは**本番環境での実装を最優先**としています。テスト環境での動作確認は本番設定後に行うことを推奨します。

## 概要

FaroにStripeを使った本番レベルのサブスクリプション課金機能を統合するためのセットアップガイドです。

---

## 🚀 クイックスタート（本番環境）

### 必須手順

1. **Stripeアカウントの本番モード有効化**（最重要）
2. 本番用APIキーの取得（`sk_live_`, `pk_live_`）
3. Proプラン商品の作成
4. Webhookエンドポイントの設定
5. Vercel環境変数の設定
6. デプロイ

詳細は **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** を参照してください。

---

## 必要な環境変数（本番用）

`.env.local`（本番デプロイ用設定）:

```bash
# ============================================
# Stripe (本番環境) ⚠️ 必ずLIVEキーを使用
# ============================================
# Secret Key (sk_live_で始まるキー)
STRIPE_SECRET_KEY=sk_live_51QiInJP4oEJPZQjq_YOUR_LIVE_SECRET_KEY

# Publishable Key (pk_live_で始まるキー)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QiInJP4oEJPZQjq_YOUR_LIVE_PUBLISHABLE_KEY

# Webhook Secret (本番用エンドポイントから取得)
# エンドポイントURL: https://yourdomain.vercel.app/api/stripe/webhook
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Price ID (本番環境で作成したProプラン)
NEXT_PUBLIC_STRIPE_PRICE_ID=price_YOUR_LIVE_PRICE_ID

# App URL (本番ドメイン)
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app

# Supabase (既存)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

---

## セットアップ手順（本番環境）

### 1. Stripeアカウントの本番モード有効化（最重要）

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. 左上の「テストモード」トグルをOFFにして**本番モードに切り替え**
3. 「本番環境をアクティベート」をクリック
4. 必要な情報を入力：
   - ビジネス情報（会社名、住所等）
   - 銀行口座情報（売上の振込先）
   - 本人確認書類（運転免許証、パスポート等）
5. 審査完了を待つ（通常24時間以内）

### 2. 本番用APIキーの取得

1. [API Keys](https://dashboard.stripe.com/apikeys)ページに移動
2. **本番モードであることを確認**（左上のトグル）
3. 以下のキーをコピー：
   - **Publishable key**: `pk_live_...`
     → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`に設定
   - **Secret key**: `sk_live_...`（「表示」をクリック）
     → `STRIPE_SECRET_KEY`に設定

⚠️ **重要**: テストキー（`sk_test_`, `pk_test_`）ではなく、本番キー（`sk_live_`, `pk_live_`）を使用してください。

### 3. Proプラン商品の作成（本番環境）

1. [Products](https://dashboard.stripe.com/products)ページに移動
2. 「商品を追加」をクリック
3. 商品情報を入力：
   - **商品名**: `Faro Pro`
   - **説明**: `無制限のAI相談と高度な機能を提供`
   - **料金体系**: 定期支払い
   - **価格**: `¥980`
   - **請求サイクル**: 月次
4. 保存後、**Price ID**（`price_...`で始まる）をコピー
   - → `NEXT_PUBLIC_STRIPE_PRICE_ID`に設定

### 4. 本番用Webhookエンドポイントの設定

1. [Webhooks](https://dashboard.stripe.com/webhooks)ページに移動
2. **本番モードであることを確認**
3. 「エンドポイントを追加」をクリック
4. エンドポイント設定：
   - **エンドポイントURL**: `https://yourdomain.vercel.app/api/stripe/webhook`
     （Vercelデプロイ後の実際のドメインに置き換え）
   - **API version**: Latest (デフォルト)
5. **監視するイベント**を選択（以下の4つを必ず追加）：
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
6. エンドポイントを保存
7. **Signing secret**（`whsec_...`で始まる）をコピー
   - → `STRIPE_WEBHOOK_SECRET`に設定

⚠️ **重要**: Webhook URLは必ずHTTPSにしてください。HTTPは使用できません。

---

## 📝 テスト環境での確認（オプション）

本番環境設定後、念のためテスト環境で動作確認したい場合：

### テスト用APIキー取得

1. Stripe Dashboardで「テストモード」をONにする
2. テスト用キー（`sk_test_`, `pk_test_`）を取得
3. テスト用Price IDを作成

### ローカルWebhook設定

```bash
# Stripe CLIをインストール（初回のみ）
# Windows (Scoop)
scoop install stripe

# Mac (Homebrew)
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# Webhookをローカルにフォワード
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

### テストカード番号

- **成功**: `4242 4242 4242 4242`
- **失敗**: `4000 0000 0000 0002`
- **3Dセキュア**: `4000 0025 0000 3155`

有効期限: 未来の任意の日付（例: 12/34）
CVC: 任意の3桁（例: 123）

---

## 🗄️ Supabaseデータベースセットアップ

### マイグレーション実行

1. [Supabase Dashboard](https://supabase.com/dashboard)を開く
2. 本番プロジェクトを選択
3. **SQL Editor**に移動
4. `supabase/migrations/20250115_add_subscriptions.sql`の内容をコピー＆ペースト
5. **Run**をクリックして実行
6. 以下のテーブルが作成されたことを確認：
   - `subscriptions`: ユーザーのサブスクリプション情報
   - `usage_limits`: 月次使用量制限

### RLS（Row Level Security）確認

1. **Authentication** → **Policies**に移動
2. 以下のポリシーが有効になっているか確認：
   - `subscriptions`: ユーザーは自分のサブスクリプションのみアクセス可能
   - `usage_limits`: ユーザーは自分の使用量のみアクセス可能

---

## 🚢 Vercelデプロイ

詳細な手順は **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** を参照してください。

### クイックステップ

1. Vercel Dashboardでプロジェクト作成
2. 環境変数設定（すべての本番用APIキー）
3. `git push origin main`で自動デプロイ
4. デプロイ完了後、本番URLにアクセス

### Vercel環境変数（必須）

すべて**Production**環境に設定：

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`

---

## ✅ 本番環境動作確認

### 1. 基本動作

- [ ] 本番URLにアクセス可能
- [ ] HTTPSで接続されている
- [ ] ログイン/サインアップが動作
- [ ] ダッシュボード表示

### 2. 決済フロー

- [ ] 「Proにアップグレード」ボタンをクリック
- [ ] Stripeチェックアウトページに遷移
- [ ] 本番カードで決済実行
- [ ] 成功ページにリダイレクト
- [ ] プラン表示が「Pro」に変更

### 3. Webhook確認

- [ ] Stripe Dashboard → Webhooksでイベント成功確認
- [ ] Supabase `subscriptions`テーブルに新レコード作成
- [ ] `status`が`active`、`plan`が`pro`になっている

### 4. 使用量制限

- [ ] 無料ユーザーは30メッセージで制限
- [ ] Proユーザーは無制限に使用可能

---

## 💰 料金プラン

| プラン | 価格 | AI相談 | ドキュメント | その他機能 |
|--------|------|--------|--------------|------------|
| **無料** | ¥0/月 | 月30回 | 月5個 | 基本機能のみ |
| **Pro** | ¥980/月 | **無制限** | **無制限** | 全機能アクセス、優先サポート |

---

## 🔧 トラブルシューティング

### エラー: "Invalid API Key provided"

**原因**: テストモードのキーと本番モードのキーが混在

**解決策**:
1. Stripe Dashboardで本番モードに切り替え
2. 本番用キー（`sk_live_`, `pk_live_`）を再取得
3. Vercel環境変数を更新して再デプロイ

### エラー: "No such price: 'price_test...'"

**原因**: テスト環境のPrice IDを本番環境で使用

**解決策**:
1. 本番モードでProプラン商品を作成
2. 本番用Price ID（`price_...`）を取得
3. `NEXT_PUBLIC_STRIPE_PRICE_ID`を更新して再デプロイ

### エラー: "Webhook signature verification failed"

**原因**: Webhook Secretが間違っているか古い

**解決策**:
1. Stripe Dashboard → Webhooks → エンドポイントを選択
2. **Signing secret**を再取得
3. `STRIPE_WEBHOOK_SECRET`を更新して再デプロイ

### Webhookが404エラーを返す

**原因**: Webhook URLが間違っている

**解決策**:
1. Webhook URL: `https://yourdomain.vercel.app/api/stripe/webhook`
2. HTTPSであることを確認（HTTPは不可）
3. エンドポイントを更新

### 決済完了後にDBが更新されない

**原因**: Webhookが正しく動作していない、またはRLS制限

**解決策**:
1. Stripe Dashboard → Webhooksでイベントログ確認
2. Vercelログでサーバーエラー確認
3. Supabase → Authentication → PoliciesでRLS確認
4. `subscriptions`, `usage_limits`テーブルにポリシーが設定されているか確認

---

## 🔐 セキュリティチェックリスト（本番デプロイ前必須）

- [ ] 本番用APIキー（`sk_live_`, `pk_live_`）を使用
- [ ] `.env.local`はGitにコミットしていない（`.gitignore`確認）
- [ ] Vercel環境変数が**Production**環境に設定されている
- [ ] Webhook URLがHTTPS（HTTPは禁止）
- [ ] Supabase RLSが全テーブルで有効
- [ ] Webhook署名検証が有効（`STRIPE_WEBHOOK_SECRET`設定済み）
- [ ] ブラウザコンソールにAPIキーが表示されていない
- [ ] Stripeダッシュボードで本番モードに切り替え済み

---

## 📚 参考リンク

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Next.js + Stripe Integration Guide](https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe)
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) ← 詳細なデプロイ手順
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**本番環境での成功を祈ります！🚀**
