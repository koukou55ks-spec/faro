# Vercel 本番環境デプロイガイド

## 📋 概要

このガイドでは、FaroアプリをVercelにデプロイし、実際のユーザーがアクセスできるようにする手順を説明します。

## ✅ デプロイ前チェックリスト

### 1. 必要なアカウント
- [ ] Vercelアカウント（https://vercel.com/signup）
- [ ] GitHubアカウント（リポジトリ連携用）
- [ ] Supabaseプロジェクト（データベース）
- [ ] Google AI Studio（Gemini API）
- [ ] Stripeアカウント（課金機能）

### 2. 環境変数の準備
以下の環境変数を`.env.local`から確認してください：

```env
NEXT_PUBLIC_SUPABASE_URL=https://tckfgrxuxkxysmpemplj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...（あなたのキー）
SUPABASE_SERVICE_KEY=eyJ...（あなたのキー）
GEMINI_API_KEY=AIzaS...（あなたのキー）
STRIPE_SECRET_KEY=sk_live_...（本番用キー）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...（本番用キー）
STRIPE_WEBHOOK_SECRET=whsec_...（Webhook設定後に取得）
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...（あなたのPrice ID）
```

## 🚀 デプロイ手順

### ステップ1: GitHubリポジトリの準備

```bash
# 現在のブランチを確認
git branch

# まだコミットしていない変更をコミット
git add .
git commit -m "feat: 本番環境デプロイ準備完了"

# GitHubにプッシュ
git push origin master
```

### ステップ2: Vercelプロジェクト作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「New Project」をクリック
3. GitHubリポジトリ `koukou55ks-spec/faro` を選択
4. 以下の設定を入力：

#### プロジェクト設定
```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: pnpm turbo build --filter=faro-frontend
Install Command: pnpm install --no-frozen-lockfile
Output Directory: （デフォルトのまま .next）
```

#### 環境変数設定

「Environment Variables」セクションで以下を追加：

**Supabase**
```
NEXT_PUBLIC_SUPABASE_URL = https://tckfgrxuxkxysmpemplj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = （.env.localからコピー）
SUPABASE_SERVICE_KEY = （.env.localからコピー）
```

**AI**
```
AI_PRIMARY_PROVIDER = gemini
GEMINI_API_KEY = （.env.localからコピー）
```

**Stripe（本番用キー）**
```
STRIPE_SECRET_KEY = sk_live_...（本番用に変更）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...（本番用に変更）
NEXT_PUBLIC_STRIPE_PRICE_ID = price_...（本番用Price ID）
NEXT_PUBLIC_APP_URL = https://あなたのドメイン.vercel.app
```

**その他**
```
ENVIRONMENT = production
NODE_ENV = production
```

5. 「Deploy」をクリック

### ステップ3: Stripe Webhook設定

デプロイが完了したら、VercelのURLを確認します（例: `https://faro-xyz123.vercel.app`）

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) にアクセス
2. 「Add endpoint」をクリック
3. 以下を入力：

```
Endpoint URL: https://あなたのドメイン.vercel.app/api/stripe/webhook
Events to send:
  ✓ checkout.session.completed
  ✓ customer.subscription.created
  ✓ customer.subscription.updated
  ✓ customer.subscription.deleted
  ✓ invoice.payment_failed
```

4. 「Add endpoint」をクリック
5. **Signing secret**（`whsec_...`）をコピー
6. Vercel Dashboardに戻り、環境変数に追加：

```
STRIPE_WEBHOOK_SECRET = whsec_...（コピーしたシークレット）
```

7. Vercelで再デプロイ（Settings → Redeploy）

### ステップ4: データベースマイグレーション確認

Supabaseにログインして、以下のテーブルが存在することを確認：

```sql
- profiles
- conversations
- messages
- notes
- documents
- collections
- transactions
- categories
- subscriptions ← 課金機能に必須
- usage_limits ← 使用量制限に必須
```

マイグレーション未実行の場合：

```bash
# ローカルで実行
cd supabase
supabase db push
```

または Supabase Dashboard → SQL Editor で手動実行。

## 🧪 動作確認

### 1. 基本機能テスト

- [ ] トップページ（https://あなたのドメイン.vercel.app）にアクセス
- [ ] ユーザー登録（`/auth/signup`）
- [ ] ログイン（`/auth/login`）
- [ ] AIチャット動作確認
- [ ] ノート作成・保存
- [ ] 家計簿機能
- [ ] ダークモード切り替え

### 2. 課金機能テスト

**テストモード（推奨）**

1. Stripeをテストモードに切り替え
2. テスト用カード番号を使用：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 未来の日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）
3. 料金プランページで「Proにアップグレード」をクリック
4. Stripe Checkoutページでテスト決済
5. サブスクリプション成功を確認

**本番モード**

実際のクレジットカードで決済が発生します。慎重に実施してください。

### 3. Webhook動作確認

1. Stripe Dashboard → Webhooks → あなたのエンドポイント
2. 「Send test webhook」をクリック
3. `checkout.session.completed` を選択
4. Vercel Function Logs で正常処理を確認

## 📊 監視とモニタリング

### Vercelダッシュボード

- **Analytics**: ページビュー、ユーザー数
- **Logs**: サーバーエラー、API呼び出し
- **Speed Insights**: パフォーマンス

### Supabase Dashboard

- **Database**: テーブルデータ確認
- **Authentication**: ユーザー一覧
- **Logs**: クエリログ、エラーログ

### Stripe Dashboard

- **Payments**: 決済履歴
- **Subscriptions**: サブスクリプション管理
- **Customers**: 顧客リスト

## 🔒 セキュリティチェック

デプロイ後、以下を確認：

- [ ] 環境変数が正しく設定されている（Vercel Dashboard）
- [ ] Supabase RLSが全テーブルで有効
- [ ] Stripe Webhookが署名検証を実施
- [ ] HTTPS接続が強制されている
- [ ] 本番用APIキー（`sk_live_`、`pk_live_`）を使用

## 🐛 トラブルシューティング

### ビルドエラー

```
Error: Cannot find module '@faro/core'
```

**解決策**: `vercel.json`の`buildCommand`を確認
```json
{
  "buildCommand": "pnpm turbo build --filter=faro-frontend"
}
```

### 環境変数が反映されない

**解決策**: Vercel Dashboard → Settings → Environment Variables で再設定後、Redeploy

### Stripe Webhook失敗

**解決策**:
1. Webhook URLが正しいか確認
2. `STRIPE_WEBHOOK_SECRET`が正しいか確認
3. Vercel Logs でエラー詳細を確認

### データベース接続エラー

**解決策**:
1. Supabase URLとキーが正しいか確認
2. Supabaseプロジェクトがアクティブか確認
3. RLSポリシーが正しく設定されているか確認

## 📈 次のステップ

### カスタムドメイン設定

1. Vercel Dashboard → Settings → Domains
2. 「Add Domain」をクリック
3. あなたのドメイン（例: `getfaro.com`）を入力
4. DNS設定を更新（Vercelが指示を表示）

### パフォーマンス最適化

- [ ] 画像最適化（WebP使用）
- [ ] コード分割（Dynamic Import）
- [ ] キャッシング戦略
- [ ] CDN活用（Vercel Edge Network）

### SEO対策

- [ ] メタタグ設定（`app/layout.tsx`）
- [ ] サイトマップ生成
- [ ] robots.txt設定
- [ ] Google Search Console登録

## 🎉 完了！

おめでとうございます！Faroアプリが本番環境で稼働しています。

ユーザーは以下のURLからアクセスできます：
- **Vercelデフォルト**: https://faro-xyz123.vercel.app
- **カスタムドメイン**: https://getfaro.com（設定後）

---

## 📞 サポート

問題が発生した場合：

1. Vercel Function Logs を確認
2. Supabase Logs を確認
3. Stripe Webhook Logs を確認
4. GitHub Issuesで報告

**ドキュメント**:
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- Stripe: https://stripe.com/docs
- Supabase: https://supabase.com/docs
