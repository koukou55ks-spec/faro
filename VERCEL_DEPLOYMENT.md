# Vercel 本番デプロイガイド

Faroアプリケーションを本番環境（Vercel）にデプロイするための完全ガイド

## 📋 目次

1. [事前準備](#事前準備)
2. [Stripe本番環境セットアップ](#stripe本番環境セットアップ)
3. [Vercel環境変数設定](#vercel環境変数設定)
4. [デプロイ手順](#デプロイ手順)
5. [デプロイ後の確認](#デプロイ後の確認)
6. [トラブルシューティング](#トラブルシューティング)

---

## 事前準備

### 必要なアカウント

- ✅ GitHub アカウント
- ✅ Vercel アカウント（GitHubで連携）
- ✅ Stripe アカウント（本番モード有効化）
- ✅ Supabase プロジェクト（本番DB）

### リポジトリ準備

```bash
# 最新のコードをコミット
git add .
git commit -m "feat: 本番環境用Stripe設定を追加"
git push origin main

# ブランチ確認
git branch
# → main ブランチにいることを確認
```

---

## Stripe本番環境セットアップ

### 1. Stripeアカウントの本番モード有効化

1. [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
2. 左上の「テストモード」トグルをOFFにして本番モードに切り替え
3. 「本番環境をアクティベート」をクリック
4. 必要な情報を入力：
   - ビジネス情報
   - 銀行口座情報（振込先）
   - 本人確認書類

### 2. 本番用APIキーを取得

1. [API Keys](https://dashboard.stripe.com/apikeys) ページに移動
2. 以下のキーをコピー：
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`（「表示」をクリックしてコピー）

### 3. Proプラン商品を作成

1. [Products](https://dashboard.stripe.com/products) → 「商品を追加」
2. 商品情報を入力：
   - **商品名**: Faro Pro
   - **説明**: 無制限のAI相談と高度な機能
   - **料金体系**: 定期支払い
   - **価格**: ¥980
   - **請求サイクル**: 月次
3. 保存後、**Price ID** (`price_...`) をコピー

### 4. Webhook エンドポイントを設定

1. [Webhooks](https://dashboard.stripe.com/webhooks) → 「エンドポイントを追加」
2. 設定：
   - **エンドポイントURL**: `https://yourdomain.vercel.app/api/stripe/webhook`
   - **監視するイベント**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
3. 保存後、**Signing secret** (`whsec_...`) をコピー

---

## Vercel環境変数設定

### 1. Vercelプロジェクト作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択（`Taxhack`）
4. プロジェクト設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm build --filter=web`
   - **Install Command**: `pnpm install`

### 2. 環境変数を設定

Vercel Dashboard → Settings → Environment Variables で以下を追加：

#### Supabase（データベース）

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tckfgrxuxkxysmpemplj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### AI API（Gemini）

```bash
AI_PRIMARY_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyB_C3YyQXLyVcaYmdk5YlHUFnX2_sKx3ak
```

#### Upstash Redis（レート制限）

```bash
UPSTASH_REDIS_REST_URL=https://cute-wren-21439.upstash.io
UPSTASH_REDIS_REST_TOKEN=AVO_AAIncDJmZDA2ODIxMTEzZDE0MWI1OTc4ZTJiYzAyYTcxNzg0NXAyMjE0Mzk
```

#### Stripe（本番環境）⚠️ 重要

```bash
# 本番用APIキー（sk_live_とpk_live_で始まる）
STRIPE_SECRET_KEY=sk_live_51QiInJP4oEJPZQjq...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QiInJP4oEJPZQjq...

# Webhook Secret（whsec_で始まる）
STRIPE_WEBHOOK_SECRET=whsec_...

# Price ID（price_で始まる、本番環境で作成したもの）
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
```

#### アプリケーション設定

```bash
# 本番ドメイン（Vercelから割り当てられたURL）
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app

# 環境識別
ENVIRONMENT=production
NODE_ENV=production
```

### 3. 環境変数の適用範囲

すべての環境変数を **Production** 環境に適用してください。

---

## デプロイ手順

### 自動デプロイ（推奨）

```bash
# main ブランチにプッシュすると自動デプロイ
git push origin main
```

Vercel Dashboard で自動的にビルドが開始されます。

### 手動デプロイ

```bash
# Vercel CLIをインストール（初回のみ）
npm i -g vercel

# ログイン
vercel login

# デプロイ
cd apps/web
vercel --prod
```

### デプロイ状況の確認

1. Vercel Dashboard → Deployments
2. 最新のデプロイをクリック
3. ビルドログを確認
4. エラーがなければ「Visit」をクリックして本番URLにアクセス

---

## デプロイ後の確認

### 1. 基本動作確認

- [ ] ランディングページが正しく表示される
- [ ] ログイン/サインアップが動作する
- [ ] ダッシュボード（/app）にアクセスできる
- [ ] AIチャットが動作する

### 2. Stripe決済フローの確認

#### 2.1 価格表示の確認

1. `/app` にアクセス
2. プラン選択ボタンが表示されるか確認
3. 「Proにアップグレード」ボタンをクリック

#### 2.2 Checkout Sessionの動作確認

1. Stripeの決済ページにリダイレクトされるか確認
2. テストカード情報を入力：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 将来の任意の日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）
   - 郵便番号: 任意（例: 123-4567）
3. 「申し込む」をクリック

#### 2.3 サブスクリプション確認

1. 成功ページにリダイレクトされるか確認
2. ダッシュボードに戻り、プラン表示が「Pro」になっているか確認
3. Stripe Dashboard → [Customers](https://dashboard.stripe.com/customers) で顧客が作成されているか確認
4. Supabase Dashboard → `subscriptions` テーブルで新しいレコードが作成されているか確認

#### 2.4 Webhook動作確認

1. Stripe Dashboard → [Webhooks](https://dashboard.stripe.com/webhooks)
2. エンドポイントをクリック
3. 「イベントを送信」タブで成功したイベントを確認
4. エラーがないか確認（200 OKであればOK）

### 3. 使用量制限の確認

#### 無料プランユーザー

1. 新しいアカウントを作成（Proにアップグレードしない）
2. AIメッセージを30回送信
3. 31回目で「無料プランの上限に達しました」と表示されるか確認

#### Proプランユーザー

1. Proプランにアップグレード済みのアカウントでログイン
2. AIメッセージを31回以上送信
3. 制限なく使用できるか確認

### 4. セキュリティ確認

- [ ] HTTPSで接続されている（🔒マーク）
- [ ] APIキーがブラウザのコンソールに表示されていない
- [ ] ゲストユーザーが他人のデータにアクセスできない
- [ ] Supabase RLSが有効（Supabase Dashboard → Authentication → Policies）

---

## トラブルシューティング

### ビルドエラー

#### エラー: `Module not found: Can't resolve '@faro/core'`

**原因**: Turborepo/pnpmのワークスペース設定が正しくない

**解決策**:

1. `package.json` のワークスペース設定を確認
2. Vercel設定で `pnpm install` が正しく実行されているか確認
3. Build Command を `cd ../.. && pnpm build --filter=web` に変更

#### エラー: `Environment variable not found: STRIPE_SECRET_KEY`

**原因**: 環境変数が設定されていない

**解決策**:

1. Vercel Dashboard → Settings → Environment Variables
2. すべての必須環境変数が設定されているか確認
3. **Production** 環境に適用されているか確認
4. 再デプロイ

### Stripe決済エラー

#### エラー: `Invalid API Key provided`

**原因**: テストモードのキーと本番モードのキーが混在している

**解決策**:

1. Stripe Dashboard で本番モードに切り替え
2. 本番用キー（`sk_live_`, `pk_live_`）を再取得
3. Vercel環境変数を更新
4. 再デプロイ

#### エラー: `No such price: 'price_test...'`

**原因**: テスト環境のPrice IDを本番環境で使用している

**解決策**:

1. Stripe Dashboard（本番モード）でProプラン商品を作成
2. 本番用のPrice ID（`price_...`）を取得
3. `NEXT_PUBLIC_STRIPE_PRICE_ID` を更新
4. 再デプロイ

### Webhook エラー

#### エラー: `Webhook signature verification failed`

**原因**: Webhook Secretが間違っている、または古い

**解決策**:

1. Stripe Dashboard → Webhooks → エンドポイントを選択
2. 「Signing secret を表示」をクリックしてコピー
3. `STRIPE_WEBHOOK_SECRET` を更新
4. 再デプロイ

#### エラー: Webhookが404エラーを返す

**原因**: Webhook URLが間違っている

**解決策**:

1. Stripe Dashboard → Webhooks → エンドポイント編集
2. URL: `https://yourdomain.vercel.app/api/stripe/webhook`
3. 保存

### データベースエラー

#### エラー: `relation "subscriptions" does not exist`

**原因**: データベースマイグレーションが実行されていない

**解決策**:

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/20250115_add_subscriptions.sql` の内容を実行
3. テーブルが作成されたか確認

#### エラー: `new row violates row-level security policy`

**原因**: RLSポリシーが正しく設定されていない

**解決策**:

1. Supabase Dashboard → Authentication → Policies
2. `subscriptions`, `usage_limits` テーブルのポリシーを確認
3. 必要に応じてポリシーを再作成

---

## パフォーマンス監視

### Vercel Analytics

1. Vercel Dashboard → Analytics
2. Core Web Vitals を確認：
   - LCP < 2.5秒
   - FID < 100ms
   - CLS < 0.1

### Stripe Dashboard

1. [Dashboard](https://dashboard.stripe.com/) でMRR（月次経常収益）を確認
2. サブスクリプション数を追跡
3. 解約率を監視

---

## セキュリティチェックリスト

デプロイ前に必ず確認：

- [ ] 本番用APIキー（`sk_live_`, `pk_live_`）を使用
- [ ] `.env.local` はGitにコミットしていない
- [ ] Supabase RLSが全テーブルで有効
- [ ] HTTPS接続のみ（HTTPSリダイレクト有効）
- [ ] CORS設定が適切（不要なドメインを許可していない）
- [ ] Webhook署名検証が有効
- [ ] レート制限が有効（Upstash Redis）

---

## サポート

問題が解決しない場合：

- Vercelドキュメント: https://vercel.com/docs
- Stripeドキュメント: https://stripe.com/docs
- Supabaseドキュメント: https://supabase.com/docs
- GitHub Issues: プロジェクトリポジトリで質問

---

**デプロイ成功を祈ります！🚀**
