# 🚀 Faro - 本番デプロイクイックスタート（30分）

## 前提条件
- Node.js 18+ インストール済み
- GitHubアカウント
- クレジットカード（Supabase/Vercel/Stripe無料枠でも必要）

---

## ステップ1: Supabaseセットアップ（10分）

### 1.1 Supabaseプロジェクト作成

```bash
# Supabaseアカウント作成
# https://supabase.com/dashboard にアクセス

# 新規プロジェクト作成
- Project name: faro-mvp
- Database Password: （強力なパスワード生成・保存）
- Region: Northeast Asia (Tokyo)
```

### 1.2 データベーススキーマ作成

Supabase Dashboard → SQL Editor → 新規クエリ:

```bash
# ローカルマイグレーション実行
cd c:\Users\kouko\OneDrive\ドキュメント\Taxhack
type supabase\migrations\001_initial_schema.sql
```

上記出力を全選択してSupabase SQL Editorに貼り付け、実行。

### 1.3 環境変数取得

Supabase Dashboard → Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service_roleキー)
```

メモ帳に保存しておく。

---

## ステップ2: Vercelデプロイ（5分）

### 2.1 GitHubリポジトリ作成

```bash
cd c:\Users\kouko\OneDrive\ドキュメント\Taxhack

# Git初期化
git init
git add .
git commit -m "Initial commit"

# GitHubで新規リポジトリ作成（faro-mvp）
# リモート追加
git remote add origin https://github.com/YOUR_USERNAME/faro-mvp.git
git branch -M main
git push -u origin main
```

### 2.2 Vercelプロジェクト作成

```bash
# Vercelログイン
cd frontend
npx vercel login

# プロジェクト作成
npx vercel

# プロンプト回答:
? Set up and deploy? Y
? Which scope? (Your account)
? Link to existing project? N
? Project name? faro-mvp
? In which directory is your code? ./
? Want to modify settings? N
```

### 2.3 環境変数設定

Vercel Dashboard → Settings → Environment Variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Gemini AI
GEMINI_API_KEY=AIzaSy... (Google AI Studioから取得)

# App URL
NEXT_PUBLIC_API_URL=https://faro-mvp.vercel.app
```

### 2.4 本番デプロイ

```bash
npx vercel --prod
```

デプロイURL: `https://faro-mvp.vercel.app`

---

## ステップ3: Gemini API Key取得（3分）

### 3.1 Google AI Studio

https://makersuite.google.com/app/apikey にアクセス

- "Create API Key" クリック
- プロジェクト選択（または新規作成）
- APIキーをコピー: `AIzaSy...`

### 3.2 Vercelに追加

Vercel Dashboard → Settings → Environment Variables:

```
GEMINI_API_KEY=AIzaSy...
```

再デプロイ:

```bash
npx vercel --prod
```

---

## ステップ4: Stripe統合（12分）

### 4.1 Stripeアカウント作成

https://dashboard.stripe.com/register にアクセス

### 4.2 商品作成

Stripe Dashboard → Products → Add product:

**Basic Plan**:
- Name: Faro Basic
- Price: ¥500
- Billing period: Monthly
- 保存後、Price IDをコピー: `price_xxxxx`

**Pro Plan**:
- Name: Faro Pro
- Price: ¥1,500
- Billing period: Monthly
- 保存後、Price IDをコピー: `price_yyyyy`

### 4.3 環境変数追加

Vercel Dashboard → Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_test_... (Stripe Dashboard → Developers → API keys)
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_yyyyy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4.4 Webhook設定

Stripe Dashboard → Developers → Webhooks → Add endpoint:

```
Endpoint URL: https://faro-mvp.vercel.app/api/stripe/webhook
Events to send:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
```

Signing secretをコピー: `whsec_...`

Vercel環境変数に追加:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

再デプロイ:

```bash
npx vercel --prod
```

---

## ステップ5: 動作確認（5分）

### 5.1 アプリアクセス

https://faro-mvp.vercel.app/workspace にアクセス

### 5.2 サインアップ

- メールアドレス入力
- パスワード設定
- 確認メール確認

### 5.3 チャットテスト

```
質問: 確定申告について教えてください
```

→ Gemini AIから回答が返ってくればOK

### 5.4 ノート機能テスト

- ノートタブクリック
- 新規ノート作成
- 保存確認

### 5.5 Stripe決済テスト

Pricing page → Basic Plan → Subscribe

テストカード:
```
Card number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

決済完了確認。

---

## 🎉 完了！

**本番稼働中のURL**: https://faro-mvp.vercel.app

### 次のステップ

1. **カスタムドメイン設定**
   - Vercel Dashboard → Settings → Domains
   - `faro.app` などのドメイン追加

2. **Sentry監視設定**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Analytics追加**
   - Vercel Dashboard → Analytics → Enable

4. **本番用Gemini API Key**
   - Google Cloud Console → APIs & Services → Credentials
   - 本番用APIキー作成（クォータ管理）

5. **Stripe本番モード切り替え**
   - Stripe Dashboard → 本番モード切り替え
   - 本番用APIキー取得
   - Vercel環境変数更新

---

## トラブルシューティング

### エラー: "Supabase connection failed"

**原因**: 環境変数未設定

**解決**:
```bash
# Vercel Dashboard → Settings → Environment Variables確認
# Redeploy: npx vercel --prod
```

### エラー: "Gemini API quota exceeded"

**原因**: APIキーのクォータ超過

**解決**:
```bash
# Google AI Studio → Quota確認
# または Google Cloud Console → クォータ増額申請
```

### エラー: "Stripe webhook signature mismatch"

**原因**: STRIPE_WEBHOOK_SECRET不一致

**解決**:
```bash
# Stripe Dashboard → Webhooks → Signing secret再確認
# Vercel環境変数更新 → Redeploy
```

---

## コスト見積もり

### 無料枠内（0-100ユーザー）

- Vercel: $0（Hobby Plan）
- Supabase: $0（Free Plan: 500MB DB, 2GB bandwidth）
- Gemini API: $0（無料枠: 15 requests/min）
- Stripe: 3.6%手数料のみ

**合計: $0/月 + Stripe手数料**

### スケール時（100-1000ユーザー）

- Vercel: $20/月（Pro Plan）
- Supabase: $25/月（Pro Plan: 8GB DB, 50GB bandwidth）
- Gemini API: ~$10/月（推定）
- Stripe: 3.6%手数料

**合計: $55/月 + Stripe手数料**

---

## サポート

問題が発生した場合:

1. Vercel Logs確認: `npx vercel logs --prod`
2. Supabase Logs確認: Dashboard → Logs
3. GitHub Issues: https://github.com/YOUR_USERNAME/faro-mvp/issues

---

**🎯 本番稼働おめでとうございます！**
