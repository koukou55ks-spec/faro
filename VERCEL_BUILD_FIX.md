# Vercelビルドエラー完全修正ログ

## 🐛 発生したエラーと解決策

### エラー1: 404 Page Not Found
**原因**: outputDirectory が間違っていた
**解決**: outputDirectory を削除（Vercelが自動検出）

### エラー2: cd apps/web: No such file or directory
**原因**: Vercelはルートディレクトリでコマンド実行
**解決**: `pnpm turbo build --filter=faro-frontend` 使用

### エラー3: /vercel/path0/apps/web/apps/web/.next/routes-manifest.json not found
**原因**: outputDirectory が重複パスを生成
**解決**: outputDirectory を完全に削除

### エラー4: Environment variables missing from turbo.json
**原因**: 新しい環境変数がturbo.jsonに未定義
**解決**: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, NEXT_PUBLIC_APP_URL, ENVIRONMENT を追加

---

## ✅ 最終的な正しい設定

### vercel.json（最終版）
```json
{
  "buildCommand": "pnpm turbo build --filter=faro-frontend",
  "installCommand": "pnpm install --no-frozen-lockfile"
}
```

**重要**: outputDirectory は**指定しない**（Vercelが自動検出）

### turbo.json（追加した環境変数）
```json
"globalEnv": [
  // ... 既存の変数
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_APP_URL",
  "ENVIRONMENT"
]
```

---

## 🎯 エラーを二度と起こさないための原則

### 1. Vercel設定の原則
- ✅ **outputDirectory は指定しない**（自動検出に任せる）
- ✅ **buildCommand は Turboを使う**（`pnpm turbo build --filter=パッケージ名`）
- ✅ **installCommand は `--no-frozen-lockfile`**（Vercel環境で柔軟に対応）

### 2. 環境変数管理の原則
- ✅ **新しい環境変数を追加したら必ずturbo.jsonに追加**
- ✅ **globalEnvとtasks.build.envの両方に追加**
- ✅ **Vercel Dashboardで設定した変数名と完全一致**

### 3. モノレポ構造の原則
- ✅ **apps/web が Next.js アプリのルート**
- ✅ **Vercelはプロジェクトルートでコマンド実行**
- ✅ **相対パスは使わず、Turboのfilterを使う**

---

## 📋 環境変数チェックリスト（完全版）

Vercel Dashboard と turbo.json の両方に以下が設定されているか確認：

### Supabase（3個）
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_KEY

### Gemini AI（2個）
- [ ] GEMINI_API_KEY
- [ ] AI_PRIMARY_PROVIDER

### Stripe（4個）
- [ ] STRIPE_SECRET_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] NEXT_PUBLIC_STRIPE_PRICE_ID

### Upstash Redis（2個）
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN

### アプリケーション設定（3個）
- [ ] NEXT_PUBLIC_APP_URL
- [ ] ENVIRONMENT
- [ ] NODE_ENV

**合計**: 14個

---

## 🚀 デプロイ手順（正しい方法）

### 1. コード変更後
```bash
git add .
git commit -m "feat: 新機能追加"
git push origin master
```

### 2. 環境変数追加時
1. Vercel Dashboard → Settings → Environment Variables で追加
2. `turbo.json` の `globalEnv` と `tasks.build.env` に追加
3. コミット＆プッシュ

### 3. デプロイ確認
1. [Vercel Deployments](https://vercel.com/koukou55ks-spec-projects/faro10/deployments)
2. 最新デプロイが **Ready** になるまで待つ（3-5分）
3. 「Visit」で本番URLにアクセス

---

## 🔍 トラブルシューティング

### ビルドが失敗したら

1. **ビルドログを確認**
   - Vercel Deployments → 失敗したデプロイ → Logs

2. **よくあるエラー**
   - `Module not found`: パッケージ依存関係を確認
   - `Environment variable not found`: turbo.json に追加
   - `routes-manifest.json not found`: outputDirectory を削除

3. **キャッシュクリア（最終手段）**
   - Vercel Dashboard → Deployments → 最新デプロイ → Redeploy → Clear cache

---

## ✅ 成功したデプロイの確認方法

以下が全て正常なら成功：

1. ✅ ビルドログに `✓ Compiled successfully` が表示
2. ✅ `✓ Generating static pages (XX/XX)` が完了
3. ✅ デプロイステータスが **Ready** (緑色)
4. ✅ https://faro10.vercel.app にアクセスできる
5. ✅ https://faro10.vercel.app/app にアクセスできる（404なし）

---

## 📝 このドキュメントの使い方

- 新しいエラーが発生したら、このドキュメントに追記
- 環境変数を追加したら、チェックリストを更新
- デプロイ前に必ず原則を確認

**このドキュメントに従えば、二度と同じエラーは起きません。**

---

**最終更新**: 2025-10-16
**コミット**: 92b8c3a
**ステータス**: ✅ 完全修正済み
