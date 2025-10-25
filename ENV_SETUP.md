# 環境変数設定ガイド

このガイドでは、Faroプロジェクトの環境変数の設定方法を説明します。

---

## 📝 必須環境変数

### 1. Supabase

Supabaseプロジェクトを作成後、以下の3つのキーが必要です：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 取得方法

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択
3. `Settings` → `API` に移動
4. 以下をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` ⚠️ 秘密鍵（公開厳禁）

---

### 2. Gemini AI

Google AI Studioで API キーを取得：

```bash
# .env.local
GEMINI_API_KEY=AIzaSy...
```

#### 取得方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成されたキーをコピー

---

## 🔧 オプション環境変数

### 3. Stripe（決済機能）

将来的にサブスクリプション機能を実装する場合に必要：

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 取得方法

1. [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
2. `Developers` → `API keys` に移動
3. Publishable key と Secret key をコピー

---

### 4. Sentry（エラー監視）

本番環境でエラートラッキングを有効化：

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

#### 取得方法

1. [Sentry](https://sentry.io/) にサインアップ
2. プロジェクトを作成
3. DSN をコピー

---

### 5. Axiom（ログ監視）

本番環境でログを収集：

```bash
# .env.local
AXIOM_TOKEN=xaat-...
AXIOM_DATASET=faro-logs
```

#### 取得方法

1. [Axiom](https://axiom.co/) にサインアップ
2. Dataset を作成
3. API token を生成

---

### 6. Upstash Redis（レート制限）

API のレート制限を実装する場合：

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AY...
```

#### 取得方法

1. [Upstash](https://console.upstash.com/) にサインアップ
2. Redis データベースを作成
3. REST URL と Token をコピー

---

## 🚀 設定手順

### ローカル開発環境

1. `.env.local` ファイルを作成：

```bash
# Windowsの場合
copy NUL .env.local

# Mac/Linuxの場合
touch .env.local
```

2. 必須環境変数を追加（Supabase + Gemini）

3. 開発サーバーを起動：

```bash
pnpm dev
```

---

### Vercel（本番環境）

1. Vercelプロジェクトの設定画面を開く
2. `Settings` → `Environment Variables` に移動
3. すべての環境変数を追加
4. `Production`, `Preview`, `Development` のスコープを選択
5. 保存後、再デプロイ

---

## 🔒 セキュリティ注意事項

### ❌ 絶対にやってはいけないこと

1. **`.env.local` をGitにコミットしない**
   - `.gitignore` で除外されているか確認
   
2. **`SUPABASE_SERVICE_KEY` を公開しない**
   - サーバーサイドのみで使用
   - フロントエンドに露出させない

3. **環境変数をハードコードしない**
   ```typescript
   // ❌ 悪い例
   const apiKey = "AIzaSy..."
   
   // ✅ 良い例
   const apiKey = process.env.GEMINI_API_KEY
   ```

### ✅ ベストプラクティス

1. **環境ごとに異なるキーを使用**
   - 開発: テストモード
   - 本番: プロダクションモード

2. **定期的にキーをローテーション**
   - 6ヶ月ごとに更新を推奨

3. **環境変数の変更後は再起動**
   - 開発サーバーを再起動（`pnpm dev:clean`）
   - Vercelで再デプロイ

---

## 🧪 検証方法

### 環境変数が正しく設定されているか確認

開発環境で以下のAPIにアクセス：

```
http://localhost:3000/api/debug-env
```

**注意**: このエンドポイントは開発環境（`NODE_ENV=development`）でのみ動作します。

出力例：
```json
{
  "environment": "development",
  "supabase": {
    "url": "https://your-project.supabase.co",
    "hasAnonKey": true,
    "hasServiceKey": true
  },
  "gemini": {
    "hasApiKey": true
  },
  "stripe": {
    "hasPublishableKey": false,
    "hasSecretKey": false
  }
}
```

---

## 🐛 トラブルシューティング

### "Supabase environment variables not configured" エラー

**原因**: `SUPABASE_SERVICE_KEY` が設定されていない

**解決方法**:
1. `.env.local` に `SUPABASE_SERVICE_KEY` を追加
2. 開発サーバーを再起動（`pnpm dev:clean`）

---

### "Invalid token" エラー

**原因**: Supabase のトークンが無効または期限切れ

**解決方法**:
1. Supabase Dashboard で新しいキーを生成
2. `.env.local` を更新
3. 再起動

---

### 環境変数が反映されない

**原因**: 環境変数の変更後に再起動していない

**解決方法**:
```bash
# 開発サーバーを停止（Ctrl+C）
# ポートをクリーンアップ
pnpm dev:clean

# または手動で
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 📞 サポート

環境変数の設定で問題が発生した場合：

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を確認
2. Supabase/Gemini の公式ドキュメントを参照
3. エラーメッセージをコピーしてGoogle検索

---

**Last Updated:** 2025-10-25

