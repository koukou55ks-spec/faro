# Faro Production Deployment Checklist
# 本番デプロイチェックリスト

**最終更新**: 2025-10-12

---

## 🚀 デプロイ前チェックリスト

### 1. 環境変数設定 ✅

#### 1.1 ローカル環境
```bash
# .env.localを作成
cp .env.local.example .env.local

# 必須項目を設定
nano .env.local
```

**必須項目**:
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_KEY`
- [x] `GEMINI_API_KEY`

**推奨項目**:
- [ ] `SENTRY_DSN`
- [ ] `AXIOM_TOKEN`
- [ ] `UPSTASH_REDIS_REST_URL`

#### 1.2 Vercel環境変数
```bash
# Vercel CLIログイン
vercel login

# 環境変数設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
vercel env add GEMINI_API_KEY

# 本番環境を選択
? Which environment: Production
```

**または**: Vercel Dashboard → Settings → Environment Variables

---

### 2. データベースセットアップ ✅

#### 2.1 Supabaseマイグレーション実行
```bash
# Windowsの場合
.\scripts\setup-database.ps1

# macOS/Linuxの場合
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

**確認項目**:
- [ ] マイグレーション成功（全てのSQLファイル適用）
- [ ] pgvectorエクステンション有効化
- [ ] RLSポリシー適用確認
- [ ] テーブル作成確認（profiles, conversations, messages, etc.）

#### 2.2 データベース検証
```bash
# テーブル一覧確認
supabase db execute --sql "
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
"

# RLS確認
supabase db execute --sql "
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
"

# pgvector確認
supabase db execute --sql "
SELECT * FROM pg_extension WHERE extname = 'vector';
"
```

---

### 3. ビルド確認 ✅

#### 3.1 型チェック
```bash
pnpm type-check
```

**期待結果**: エラーゼロ

#### 3.2 Lint
```bash
pnpm lint
```

**期待結果**: エラーゼロ（警告は許容）

#### 3.3 ビルド
```bash
pnpm build
```

**確認項目**:
- [ ] ビルド成功
- [ ] バンドルサイズ警告なし（< 500KB）
- [ ] 未使用コード警告なし

---

### 4. テスト実行 ✅

#### 4.1 単体テスト
```bash
pnpm test
```

**確認項目**:
- [ ] 全テスト成功
- [ ] カバレッジ > 70%（目標）

#### 4.2 E2Eテスト（オプション）
```bash
# Playwrightテスト
pnpm test:e2e
```

**確認項目**:
- [ ] ログインフロー成功
- [ ] チャット機能動作確認

---

### 5. セキュリティチェック ✅

#### 5.1 環境変数漏洩確認
```bash
# .env.localがGitに含まれていないか確認
git status --ignored

# .gitignoreに含まれているか確認
cat .gitignore | grep ".env.local"
```

**確認項目**:
- [x] `.env.local` が `.gitignore` に含まれている
- [x] `.env` が `.gitignore` に含まれている
- [x] `SUPABASE_SERVICE_KEY` がコードに含まれていない

#### 5.2 Supabase RLS確認
```bash
# RLSが全テーブルで有効か確認
supabase db execute --sql "
SELECT
    tablename,
    rowsecurity,
    (SELECT count(*) FROM pg_policies WHERE tablename = pg_tables.tablename) as policies_count
FROM pg_tables
WHERE schemaname = 'public';
"
```

**期待結果**: 全テーブル `rowsecurity = true` かつ `policies_count > 0`

#### 5.3 APIエンドポイント保護確認
- [ ] `/api/auth/*` - 認証済みユーザーのみ
- [ ] `/api/chat` - 認証済みユーザーのみ
- [ ] `/api/conversations` - 認証済みユーザーのみ

---

### 6. パフォーマンスチェック ✅

#### 6.1 Lighthouse スコア
```bash
# ローカルビルド起動
pnpm build && pnpm start

# Chrome DevTools → Lighthouse実行
# 対象: http://localhost:3000
```

**目標スコア**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

#### 6.2 バンドルサイズ確認
```bash
# ビルド時に表示されるサイズを確認
pnpm build

# または
npx @next/bundle-analyzer
```

**目標**:
- First Load JS: < 200KB
- Route JS: < 100KB

---

### 7. Vercelデプロイ 🚀

#### 7.1 Vercelプロジェクト接続
```bash
# Vercel CLI初期化
vercel

# プロジェクト設定
? Set up and deploy "~/Taxhack"? [Y/n] y
? Which scope? Personal Account
? Link to existing project? [y/N] n
? What's your project's name? faro
? In which directory is your code located? ./
? Want to modify these settings? [y/N] n
```

#### 7.2 本番デプロイ
```bash
# 本番環境にデプロイ
vercel --prod

# または Git push（自動デプロイ）
git add .
git commit -m "🚀 Deploy to production"
git push origin main
```

**Vercel自動デプロイ設定**:
- Vercel Dashboard → Settings → Git
- Production Branch: `main`
- Preview Branches: All branches
- Ignored Build Step: （空欄）

#### 7.3 デプロイ検証
```bash
# デプロイURL取得
vercel --prod

# Health Check
curl https://getfaro.com/api/health
```

**期待結果**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T12:00:00.000Z",
  "environment": "production"
}
```

---

### 8. 本番環境動作確認 ✅

#### 8.1 認証フロー確認
- [ ] サインアップ動作確認
- [ ] ログイン動作確認
- [ ] ログアウト動作確認
- [ ] セッション保持確認（リロード後もログイン状態）

#### 8.2 AIチャット確認
- [ ] メッセージ送信成功
- [ ] AI応答取得成功
- [ ] 会話履歴保存確認
- [ ] ベクトル検索動作確認

#### 8.3 エラーハンドリング確認
- [ ] ネットワークエラー時の表示
- [ ] 認証エラー時の表示
- [ ] API制限時の表示

---

### 9. モニタリング設定 ✅

#### 9.1 Sentry設定
```bash
# Sentryプロジェクト作成
# https://sentry.io/organizations/[org]/projects/new/

# Sentry DSNを環境変数に設定
vercel env add SENTRY_DSN
```

**確認項目**:
- [ ] エラートラッキング動作確認（意図的にエラーを発生させる）
- [ ] Source Maps アップロード成功

#### 9.2 Axiom設定
```bash
# Axiomデータセット作成
# https://app.axiom.co/datasets/new

# Axiom Tokenを環境変数に設定
vercel env add AXIOM_TOKEN
vercel env add AXIOM_DATASET
```

**確認項目**:
- [ ] ログ送信確認
- [ ] パフォーマンスメトリクス記録確認

#### 9.3 Vercel Analytics有効化
```bash
# Vercel Dashboard → Analytics → Enable
```

---

### 10. SEO設定 ✅

#### 10.1 メタタグ確認
- [ ] `<title>` 設定（全ページ）
- [ ] `<meta name="description">` 設定
- [ ] Open Graph画像設定
- [ ] Twitter Card設定

#### 10.2 robots.txt
```bash
# public/robots.txt 作成
User-agent: *
Allow: /
Sitemap: https://getfaro.com/sitemap.xml
```

#### 10.3 sitemap.xml（オプション）
```bash
# Next.js 15の場合
# app/sitemap.ts で自動生成
```

---

### 11. ドメイン設定（オプション）

#### 11.1 カスタムドメイン追加
```bash
# Vercel Dashboard → Settings → Domains
# Add: getfaro.com
```

#### 11.2 DNS設定
```
# レジストラでCNAMEレコード追加
getfaro.com → cname.vercel-dns.com
```

#### 11.3 SSL証明書
- [ ] Vercelが自動発行（Let's Encrypt）
- [ ] HTTPS強制リダイレクト有効化

---

### 12. 運用準備 ✅

#### 12.1 バックアップ設定
- [ ] Supabase自動バックアップ有効化
- [ ] データベース毎日スナップショット

#### 12.2 アラート設定
- [ ] Sentryエラーアラート（Slack/Email）
- [ ] Axiomパフォーマンスアラート
- [ ] Uptime Monitoring（UptimeRobot等）

#### 12.3 ドキュメント整備
- [x] README.md更新
- [x] CLAUDE.md更新
- [x] DEPLOY_CHECKLIST.md（このファイル）

---

## 📊 デプロイ後の確認項目

### デプロイ後24時間以内
- [ ] エラー率 < 0.1%（Sentry）
- [ ] 平均レスポンスタイム < 500ms（Axiom）
- [ ] Uptime 99.9%（Vercel Status）

### デプロイ後1週間以内
- [ ] ユーザーフィードバック収集
- [ ] パフォーマンスボトルネック特定
- [ ] モバイル動作確認（iOS Safari, Chrome Android）

---

## 🔧 トラブルシューティング

### デプロイ失敗時
```bash
# ローカルでビルド確認
pnpm build

# Vercelログ確認
vercel logs

# キャッシュクリア
vercel --force
```

### データベース接続エラー
```bash
# Supabase接続確認
curl https://tckfgrxuxkxysmpemplj.supabase.co/rest/v1/

# 環境変数確認
vercel env ls
```

### Sentry未動作
```bash
# Source Maps確認
ls -la .next/static/chunks/
```

---

## ✅ 完了確認

すべてのチェックリストが完了したら:

```bash
# リリースノート作成
git tag -a v1.0.0 -m "🚀 Initial production release"
git push origin v1.0.0

# Product Hunt公開
# https://www.producthunt.com/posts/new

# SNS告知
# Twitter, LinkedIn, Reddit
```

---

## 📚 参考リンク

- Vercel Deployment: https://vercel.com/docs/deployments/overview
- Supabase Production: https://supabase.com/docs/guides/platform/going-into-prod
- Next.js Deployment: https://nextjs.org/docs/deployment
- Sentry Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**最終チェック**: すべての項目に ✅ がついたら本番デプロイ準備完了！ 🎉
