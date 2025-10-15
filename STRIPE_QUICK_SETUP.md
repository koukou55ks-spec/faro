# Stripe課金機能 - クイックセットアップガイド

## 🚀 今すぐ使える課金機能の設定方法

### 現在の問題
- Stripe環境変数が未設定
- 課金機能のUIは実装済みだが、実際に動作しない
- Supabaseのサブスクリプションテーブルが未作成の可能性

### 解決方法

## オプション1: テストモード（推奨 - 即座に開発可能）

### 1. Stripeアカウント作成（無料）
1. [Stripe](https://stripe.com/jp)にアクセス
2. アカウント作成（メールアドレスのみ）
3. ダッシュボードにログイン

### 2. テスト用APIキー取得
1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)を開く
2. **テストモード**であることを確認（画面上部のスイッチ）
3. 以下をコピー：
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`（「表示」をクリック）

### 3. テスト商品作成
1. [Products](https://dashboard.stripe.com/test/products)ページへ
2. 「商品を追加」をクリック
3. 入力内容：
   - 商品名: `Faro Pro`
   - 価格: `980円`
   - 請求サイクル: 月次
4. Price IDをコピー（`price_...`）

### 4. 環境変数設定

`.env.local`ファイルを作成：
```bash
# Stripe Test Mode
STRIPE_SECRET_KEY=sk_test_あなたのテストシークレットキー
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_あなたのテスト公開可能キー
NEXT_PUBLIC_STRIPE_PRICE_ID=price_あなたのプライスID
STRIPE_WEBHOOK_SECRET=whsec_開発時は任意の文字列でOK
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Supabaseテーブル作成
1. [Supabase Dashboard](https://supabase.com/dashboard)を開く
2. SQL Editorで以下を実行：

```sql
-- subscriptionsテーブル作成（既に存在する場合はスキップ）
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan TEXT NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS有効化
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true) WITH CHECK (true);
```

### 6. 開発サーバー再起動
```bash
# 既存のサーバーを停止（Ctrl+C）
# キャッシュクリア
rm -rf apps/web/.next

# 再起動
pnpm dev
```

### 7. テスト方法
1. http://localhost:3000/app にアクセス
2. ログイン（必須）
3. サイドバーの「料金プラン」をクリック
4. 「Proにアップグレード」をクリック
5. テストカード情報を入力：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）
6. 決済完了

## オプション2: 開発用モック実装（Stripe不要）

環境変数やStripeアカウントなしで、即座に動作確認したい場合：

### モック実装を有効化
`.env.local`に追加：
```bash
# モックモード有効化
NEXT_PUBLIC_MOCK_PAYMENTS=true
```

これにより：
- 「Proにアップグレード」をクリックすると即座にProプランに変更
- 実際の決済は発生しない
- 開発・デモ用途に最適

## トラブルシューティング

### エラー: "Stripe is not defined"
**原因**: Publishable keyが未設定
**解決**: `.env.local`に`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`を設定

### エラー: "Invalid API Key provided"
**原因**: APIキーの形式が間違っている
**解決**: テストキーは`sk_test_`、`pk_test_`で始まることを確認

### エラー: "No such price"
**原因**: Price IDが間違っている
**解決**: Stripe Dashboardで正しいPrice IDを確認

### サブスクリプションが反映されない
**原因**: Webhookが未設定
**解決**: 開発環境では手動でDBを更新するか、Stripe CLIでWebhookをローカルにフォワード

## 本番環境への移行

1. **Stripeアカウントの本番モード有効化**
   - ビジネス情報入力
   - 銀行口座登録
   - 本人確認

2. **本番用APIキー取得**
   - `sk_live_...`、`pk_live_...`

3. **Webhookエンドポイント設定**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - イベント選択（subscription関連）

4. **Vercel環境変数設定**
   - すべての本番用キーを設定

詳細は[STRIPE_SETUP.md](./STRIPE_SETUP.md)を参照してください。