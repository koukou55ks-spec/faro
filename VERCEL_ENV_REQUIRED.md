# Vercel環境変数設定リスト（本番デプロイ用）

## 🔴 必須環境変数（これがないと動きません）

Vercel Dashboard → Settings → Environment Variables で以下を設定してください。

### Supabase (Database & Auth)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tckfgrxuxkxysmpemplj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Gemini AI (必須 - チャット機能の核心)
```bash
GEMINI_API_KEY=your_gemini_api_key
AI_PRIMARY_PROVIDER=gemini
AI_FALLBACK_PROVIDER=openai
```

### Application
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
ENVIRONMENT=production
NODE_ENV=production
```

## 🟢 オプション環境変数（課金機能を使う場合）

### Stripe (Payment & Subscription)
```bash
# 本番用（sk_live_, pk_live_で始まるキー）
STRIPE_SECRET_KEY=sk_live_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_ID=price_your_price_id

# テスト環境の場合
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_ID=price_your_test_price_id
```

**注意**: Stripeの環境変数が設定されていない場合、課金機能は自動的にモックモードで動作します。

## 🟡 推奨環境変数（本番環境での監視・分析）

### Sentry (エラー監視)
```bash
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
```

### Axiom (構造化ログ)
```bash
AXIOM_TOKEN=your_axiom_token
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=https://api.axiom.co
AXIOM_DATASET=faro-logs
```

### Upstash Redis (レート制限 & キャッシュ)
```bash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## 🔄 OpenAI (フォールバック用 - オプション)
```bash
OPENAI_API_KEY=your_openai_api_key
```

## 📝 設定方法

### 1. Vercel Dashboardで設定
1. https://vercel.com/dashboard にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables
4. 上記の環境変数を1つずつ追加
5. Environment: **Production** を選択（本番環境の場合）

### 2. コマンドラインで設定（オプション）
```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# 環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add GEMINI_API_KEY production
# ... 他の環境変数も同様に追加
```

## ⚠️ 重要な注意事項

1. **NEXT_PUBLIC_で始まる環境変数**
   - ブラウザに公開されるため、機密情報（Secret Key等）は含めない
   - Publishable KeyやURLのみ使用

2. **Stripe環境変数**
   - 本番環境では必ず`sk_live_`, `pk_live_`を使用
   - テストキー（`sk_test_`, `pk_test_`）は本番では使用しない

3. **環境変数の優先順位**
   - Vercelの環境変数 > .env.local > .env

4. **デプロイ後の反映**
   - 環境変数を変更した場合、再デプロイが必要
   - Vercel Dashboard → Deployments → Redeploy

## 📚 関連ドキュメント

- [STRIPE_QUICK_SETUP.md](./STRIPE_QUICK_SETUP.md) - Stripe課金機能のセットアップ
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - 本番環境への詳細な移行ガイド
- [Vercel Environment Variables Documentation](https://vercel.com/docs/environment-variables)