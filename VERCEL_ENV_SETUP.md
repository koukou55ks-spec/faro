# Vercel環境変数設定ガイド（Stripe課金機能有効化）

## 🎯 目的
faro10.vercel.app でユーザーがProプランにアップグレードできるようにする

## 📋 設定手順（5分で完了）

### 1. Vercel Dashboardにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard) を開く
2. **faro10** プロジェクトをクリック
3. **Settings** タブをクリック
4. 左サイドバーから **Environment Variables** を選択

---

## 2. 必須環境変数を追加

以下の環境変数を1つずつ追加してください。

### ✅ Supabase（データベース）

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tckfgrxuxkxysmpemplj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | （既存の.env.localから取得） |
| `SUPABASE_SERVICE_KEY` | （既存の.env.localから取得） |

**取得方法**:
```bash
cat apps/web/.env.local | grep SUPABASE
```

---

### ✅ Gemini AI

| 変数名 | 値 |
|--------|-----|
| `GEMINI_API_KEY` | （既存の.env.localから取得） |
| `AI_PRIMARY_PROVIDER` | `gemini` |

**取得方法**:
```bash
cat apps/web/.env.local | grep GEMINI
```

---

### ✅ Upstash Redis（レート制限）

| 変数名 | 値 |
|--------|-----|
| `UPSTASH_REDIS_REST_URL` | （既存の.env.localから取得） |
| `UPSTASH_REDIS_REST_TOKEN` | （既存の.env.localから取得） |

**取得方法**:
```bash
cat apps/web/.env.local | grep UPSTASH
```

---

### 🔥 Stripe（課金機能）⚠️ 最重要

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `STRIPE_SECRET_KEY` | `sk_live_51SEK8kLrgQNNeYRg...` | 本番用シークレットキー |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_51SEK8kLrgQNNeYRg...` | 本番用公開キー |
| `STRIPE_WEBHOOK_SECRET` | `whsec_cE6eaOXL3zX95le...` | Webhook署名検証用 |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | `price_1SIV0vLrgQNNeYRg...` | Proプラン価格ID |

**取得方法**:
```bash
cat apps/web/.env.local | grep STRIPE
```

**注意**:
- すべて `sk_live_`、`pk_live_` で始まる**本番用キー**を使用
- テスト用キー（`sk_test_`、`pk_test_`）は使わない

---

### ✅ アプリケーション設定

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://faro10.vercel.app` | 本番URL |
| `ENVIRONMENT` | `production` | 環境識別 |
| `NODE_ENV` | `production` | Node環境 |

---

## 3. 環境変数の適用範囲

各環境変数を追加する際、**適用範囲**を選択：

- ✅ **Production** （本番環境）- 必ずチェック
- ⬜ Preview（プレビュー環境）- オプション
- ⬜ Development（開発環境）- 不要

---

## 4. デプロイをトリガー

環境変数を追加したら：

1. Vercel Dashboard → **Deployments** タブ
2. 最新のデプロイ（今プッシュしたもの）を確認
3. 自動デプロイが完了するまで待つ（3-5分）

または手動で再デプロイ：
1. **Deployments** タブ
2. 最新デプロイの右側の「⋮」→ **Redeploy**
3. **Redeploy** をクリック

---

## 5. Stripe Webhook設定

環境変数設定後、Stripe DashboardでWebhookを設定：

1. [Stripe Webhooks](https://dashboard.stripe.com/webhooks) を開く
2. **エンドポイントを追加** をクリック
3. 設定：
   - **エンドポイントURL**: `https://faro10.vercel.app/api/stripe/webhook`
   - **監視するイベント**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. **エンドポイントを追加** をクリック
5. **Signing secret** (`whsec_...`) をコピー
6. Vercelの `STRIPE_WEBHOOK_SECRET` を更新（既に設定済みの場合はスキップ）

---

## 6. 動作確認

1. https://faro10.vercel.app/app にアクセス
2. ログインまたはサインアップ
3. サイドバーから **料金プラン** をクリック
4. **Proにアップグレード** ボタンをクリック
5. Stripe決済ページにリダイレクトされるか確認

### テスト決済（本番モードでもテスト可能）

Stripe本番モードでもテストカードで決済可能：

- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の未来の日付（例: 12/34）
- CVC: 任意の3桁（例: 123）

---

## 📊 環境変数チェックリスト

設定完了後、以下を確認：

- [ ] Supabase環境変数（3個）
- [ ] Gemini AI環境変数（2個）
- [ ] Upstash Redis環境変数（2個）
- [ ] Stripe環境変数（4個）- **本番用キー**
- [ ] アプリケーション設定（3個）
- [ ] すべて **Production** 環境に適用
- [ ] Vercelデプロイ完了
- [ ] Stripe Webhook設定完了

**合計**: 14個の環境変数

---

## 🚨 トラブルシューティング

### エラー: "Environment variable not found"

**原因**: 環境変数が未設定または名前が間違っている

**解決策**:
1. Vercel Dashboard → Settings → Environment Variables
2. 変数名のスペルを確認
3. **Production** 環境に適用されているか確認
4. 再デプロイ

### エラー: "Invalid API Key provided"

**原因**: テストモードのキーを本番環境で使用している

**解決策**:
1. Stripe Dashboard で **本番モード** に切り替え
2. 本番用キー（`sk_live_`, `pk_live_`）を取得
3. Vercel環境変数を更新
4. 再デプロイ

### Webhook が 404 エラー

**原因**: Webhook URLが間違っている、または最新コードが未デプロイ

**解決策**:
1. URL: `https://faro10.vercel.app/api/stripe/webhook` を確認
2. 最新コードがデプロイされているか確認
3. ブラウザで `https://faro10.vercel.app/app` にアクセスできるか確認

---

## ✅ 設定完了後

すべての設定が完了したら：

1. ✅ ユーザーはProプランにアップグレード可能
2. ✅ 決済完了後、自動的にProプランが有効化
3. ✅ AIチャット無制限利用可能
4. ✅ Stripe Dashboardでサブスクリプション管理可能

---

**設定完了を確認したら、このガイドは完了です！🎉**
