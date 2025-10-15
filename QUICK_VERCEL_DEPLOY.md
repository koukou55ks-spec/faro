# クイックVercelデプロイ（Stripe登録用）

Stripeアカウント有効化のために、すぐにVercelデプロイを行う手順

## 🚀 5分でデプロイ

### 1. Vercelアカウント作成

1. [Vercel](https://vercel.com/signup)にアクセス
2. GitHubアカウントで連携
3. 「Import Project」をクリック

### 2. リポジトリをプッシュ

```bash
# 現在の変更をコミット
git add .
git commit -m "feat: 本番環境用Stripe設定を追加"

# GitHubにプッシュ（リポジトリがない場合は作成）
git push origin main
```

### 3. Vercelでインポート

1. GitHubリポジトリ「Taxhack」を選択
2. プロジェクト設定:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm build --filter=web`
   - **Install Command**: `pnpm install`

### 4. 環境変数を設定（最小限）

以下のみ設定（Stripeは後で追加）:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tckfgrxuxkxysmpemplj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（既存の値）
SUPABASE_SERVICE_KEY=（既存の値）

# Gemini
GEMINI_API_KEY=（既存の値）
AI_PRIMARY_PROVIDER=gemini

# Upstash Redis
UPSTASH_REDIS_REST_URL=（既存の値）
UPSTASH_REDIS_REST_TOKEN=（既存の値）

# App URL（後で自動生成されるURLに変更）
NEXT_PUBLIC_APP_URL=https://yourproject.vercel.app

# 環境
ENVIRONMENT=production
NODE_ENV=production
```

### 5. デプロイ実行

1. 「Deploy」をクリック
2. ビルド完了を待つ（3-5分）
3. 生成されたURL（例: `faro-xxxxx.vercel.app`）をコピー

### 6. StripeにURLを入力

1. Stripeの「ビジネスのウェブサイト」に:
   ```
   https://faro-xxxxx.vercel.app
   ```
2. 「続ける」をクリック

### 7. Stripe設定完了後

1. 本番用APIキーを取得
2. Vercel環境変数に追加:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PRICE_ID`
3. Webhook URLを設定: `https://faro-xxxxx.vercel.app/api/stripe/webhook`

---

## ⚡ もっと早く進めたい場合

**今すぐStripeを進めるには**:

1. Stripeに `https://www.example.com` と入力
2. アカウント有効化を完了
3. 後から「設定」→「ビジネス情報」でURLを更新

**理由**:
- Stripeはウェブサイトを後から変更可能
- アカウント有効化を優先すべき
- 実際のウェブサイトができてから正式URLに更新すればOK

---

## 📝 注意事項

- Stripeは実際に動作するウェブサイトを確認する場合がある
- `example.com` で登録した場合、後で必ず正式URLに更新すること
- 本番決済を受け付ける前に、正しいURLに変更すること
