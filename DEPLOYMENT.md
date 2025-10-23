# デプロイ・環境管理ガイド

**プレビュー → ステージング → 本番の安全な展開戦略**

---

## 🌍 環境構成

### 3環境戦略

```
┌─────────────┬──────────────┬─────────────┬──────────────┐
│ 環境         │ URL          │ 用途         │ デプロイ条件  │
├─────────────┼──────────────┼─────────────┼──────────────┤
│ Preview     │ pr-123.vercel│ PR確認       │ PR作成時自動  │
│ Staging     │ staging.vercel│ 最終確認     │ develop push │
│ Production  │ faro.com     │ 本番         │ master push  │
└─────────────┴──────────────┴─────────────┴──────────────┘
```

---

## 🔄 CI/CD パイプライン

### 既存の GitHub Actions（✅ 実装済み）

#### 1. `.github/workflows/ci.yml` - 品質チェック

```yaml
トリガー: PR作成、push (master/develop)

Jobs:
  1. Lint          # ESLint
  2. Type Check    # TypeScript
  3. Unit Tests    # Jest/Vitest
  4. E2E Tests     # Playwright
  5. Build         # Next.js build
```

#### 2. `.github/workflows/security.yml` - セキュリティスキャン

```yaml
トリガー: 毎日午前3時、PR作成時

Jobs:
  1. Dependency Scan  # npm audit
  2. Code Scan        # CodeQL
  3. Secret Scan      # GitGuardian
```

#### 3. `.github/workflows/deploy.yml` - デプロイ自動化

```yaml
トリガー: master/develop push

Jobs:
  1. Build & Test
  2. Deploy to Vercel
  3. Smoke Test
  4. Slack通知
```

---

## 🎯 プレビュー環境戦略

### Vercel Preview Deployment（自動）

**仕組み:**
1. PRを作成
2. Vercel が自動で Preview URL を生成
3. GitHub PR に URL コメント
4. レビュアーが実際の動作確認

**設定（Vercel Dashboard）:**
```bash
Settings → Git → Branch Protection
✅ Enable Preview Deployments
✅ Comment on Pull Request
✅ Deploy only when checks pass
```

**環境変数（Preview用）:**
```bash
# Vercel Dashboard → Settings → Environment Variables

# Preview環境専用の設定
NEXT_PUBLIC_SUPABASE_URL = https://test.supabase.co  # Preview
STRIPE_SECRET_KEY = sk_test_xxx                      # テストモード
GEMINI_API_KEY = AIza_test_xxx                       # テスト用キー
```

---

## 📋 デプロイチェックリスト

### Stage 1: PR作成時（Preview）

```bash
✅ CI パス (Lint + Type Check + Tests)
✅ Security スキャンパス
✅ ビルド成功
✅ Preview URL で動作確認
✅ Lighthouse スコア確認
```

### Stage 2: develop マージ時（Staging）

```bash
✅ 上記 + 以下
✅ E2E テスト実施
✅ パフォーマンステスト
✅ API負荷テスト
✅ DB Migration 実行
✅ 最終レビュー承認
```

### Stage 3: master マージ時（Production）

```bash
✅ 上記 + 以下
✅ リリースノート作成
✅ Git Tag 付与 (v1.2.3)
✅ ロールバック手順確認
✅ Slack/Discord通知
✅ 本番環境変数確認
```

---

## 🚀 デプロイ手順

### 1. 機能開発 → Preview

```bash
# 1. 新機能ブランチ作成
git checkout -b feature/new-chat-ui

# 2. 開発 & ローカルテスト
pnpm dev
pnpm pre-deploy  # Lint + Type Check + Build

# 3. コミット
git add .
git commit -m "feat: Add new chat UI"

# 4. Push & PR作成
git push origin feature/new-chat-ui
# GitHub で PR 作成

# 5. Preview URL で確認
# Vercel が自動でコメント: https://faro-pr-123.vercel.app
```

### 2. Preview OK → Staging

```bash
# 1. PR を develop にマージ
git checkout develop
git merge feature/new-chat-ui
git push origin develop

# 2. Staging 自動デプロイ
# → https://faro-staging.vercel.app

# 3. Staging で最終確認
- 全機能の動作確認
- パフォーマンス確認
- エラーログ確認
```

### 3. Staging OK → Production

```bash
# 1. develop → master PR 作成
git checkout master
git merge develop

# 2. タグ付与
git tag -a v1.2.0 -m "Release v1.2.0: New chat UI"
git push origin v1.2.0

# 3. master push
git push origin master

# 4. 本番デプロイ（自動）
# → https://faro.com

# 5. スモークテスト
- ホームページ読み込み
- ログイン
- チャット送信
- Sentry でエラー確認
```

---

## 🛡️ ロールバック戦略

### 即座ロールバック（5分以内）

```bash
# Method 1: Vercel Dashboard
1. Vercel Dashboard → Deployments
2. 前回の成功デプロイを選択
3. "Promote to Production" クリック

# Method 2: Git Tag
git reset --hard v1.1.0  # 前回の安定版
git push origin master --force

# Method 3: Vercel CLI
vercel rollback
```

### データベースロールバック

```bash
# Supabase Migration ロールバック
supabase db reset --db-url $PRODUCTION_DB_URL
supabase migration down

# または手動でSQLを実行
psql $PRODUCTION_DB_URL < migrations/rollback_v1.2.0.sql
```

---

## 📊 デプロイ後の確認

### 5分後
```bash
✅ Vercel Dashboard: デプロイ成功
✅ ホームページ読み込み
✅ Sentry: 新規エラーなし
✅ Vercel Analytics: トラフィック正常
```

### 1時間後
```bash
✅ Core Web Vitals: LCP < 2.5s
✅ API p95 latency < 1s
✅ エラー率 < 1%
```

### 24時間後
```bash
✅ ユーザーフィードバック確認
✅ Axiom ログ分析
✅ チャット完遂率 > 95%
```

---

## 🔒 本番環境変数管理

### Vercel Dashboard 設定

```bash
# Production Only（暗号化される）
SUPABASE_SERVICE_KEY = eyJ...    # サービスキー
STRIPE_SECRET_KEY = sk_live_xxx  # 本番決済キー
GEMINI_API_KEY = AIza_prod_xxx   # 本番APIキー

# All Environments
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
NEXT_PUBLIC_APP_URL = https://faro.com

# Monitoring
SENTRY_DSN = https://xxx@sentry.io/xxx
AXIOM_TOKEN = xaiot_xxx
```

**セキュリティルール:**
1. `_SERVICE_KEY`, `_SECRET_KEY` は Production のみ表示
2. ローカルでは `.env.local` (Git除外)
3. Preview/Staging はテストモードキー使用

---

## 📈 デプロイメトリクス

### 目標指標

| メトリクス | 目標 | 現状 |
|----------|------|------|
| デプロイ頻度 | 1日1回 | - |
| Lead Time | < 1時間 | - |
| MTTR (復旧時間) | < 15分 | - |
| Change Failure Rate | < 5% | - |

---

## 🔗 関連ドキュメント

- [CLAUDE.md](./CLAUDE.md) - 開発ガイド
- [TESTING.md](./TESTING.md) - テスト戦略
- [MONITORING.md](./MONITORING.md) - 監視戦略

---

**安全で確実なデプロイを実現しましょう。**
