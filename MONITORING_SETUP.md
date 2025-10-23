# 監視ツールセットアップガイド

**コスト最適化：必要になってから導入する段階的戦略**

---

## 🎯 現状（MVP: 0-500ユーザー）

### ✅ 今すぐやること（コスト: ¥0）

```bash
# 1. Vercel Analytics（既に有効）✅
# apps/web/app/layout.tsx で実装済み
import { Analytics } from '@vercel/analytics/react'
<Analytics />

# 2. console.log でのエラー追跡
# 開発環境・本番環境の両方でVercelログに記録される
console.error('[API] Error:', error)

# 3. Vercel Dashboard で確認
https://vercel.com/[your-team]/faro/logs
```

**これだけで十分！** 追加コストなし。

---

## 📅 Stage 1: 500ユーザー到達時（コスト: ¥0）

### Sentry Free 導入（所要時間: 30分）

#### Step 1: Sentryアカウント作成
```bash
# 1. https://sentry.io/ でサインアップ（無料）
# 2. プロジェクト作成: "faro-production"
# 3. DSN をコピー
```

#### Step 2: 環境変数設定
```bash
# .env.local に追加
SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=faro-production

# Vercel Dashboard にも同じ値を設定
# Settings → Environment Variables → Production
```

#### Step 3: 動作確認
```bash
# ローカルでテスト
pnpm dev

# わざとエラーを発生させる
# apps/web/app/test-error/page.tsx
export default function TestError() {
  throw new Error('Test Sentry error')
}

# http://localhost:3000/test-error にアクセス
# → Sentry Dashboard にエラーが表示されればOK
```

**無料枠:**
- 5,000 エラー/月
- 500ユーザーなら余裕で足りる

---

## 📅 Stage 2: 1,000ユーザー到達時（コスト: ¥8,000/月）

### 導入するもの

1. **Sentry Pro**: $26/月（50,000エラー）
2. **Axiom Hobby**: $25/月（100GB）
3. **Upstash Pro**: ¥2,500/月（10GB）

### Axiom セットアップ（所要時間: 1時間）

#### Step 1: Axiomアカウント作成
```bash
# 1. https://app.axiom.co/ でサインアップ
# 2. Dataset 作成: "faro-logs"
# 3. API Token 取得
```

#### Step 2: Next.js統合
```bash
# パッケージインストール
pnpm add next-axiom

# .env.local に追加
AXIOM_TOKEN=xaiot_xxx
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=https://api.axiom.co

# Vercel にも設定
```

#### Step 3: コード統合
```typescript
// apps/web/instrumentation.ts に追加
import { log } from 'next-axiom'

export async function register() {
  if (process.env.AXIOM_TOKEN) {
    log.info('Application started', {
      env: process.env.NODE_ENV,
      version: process.env.VERCEL_GIT_COMMIT_SHA,
    })
  }
}
```

### Upstash Rate Limiting セットアップ

#### Step 1: Upstashアカウント作成
```bash
# 1. https://console.upstash.com/ でサインアップ
# 2. Redis データベース作成（リージョン: Tokyo推奨）
# 3. REST API credentials 取得
```

#### Step 2: 環境変数設定
```bash
# .env.local に追加
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Vercel にも設定
```

#### Step 3: Rate Limitingコード（既に実装済み）
```typescript
// apps/web/lib/redis.ts（既存ファイル）
// apps/web/middleware.ts で自動的に有効化される
```

---

## 📅 Stage 3: 10,000ユーザー以降（コスト: ¥30,000/月）

### 追加するもの（オプション）

- **Datadog**: インフラ全体の監視
- **PagerDuty**: オンコール体制
- **New Relic**: APM（Application Performance Monitoring）

**現時点では不要！**

---

## 💡 実際の導入判断基準

### Sentry導入タイミング
```
✅ 今すぐ（無料）: エラーが週1回以上発生
⏰ 有料化: エラーが5,000/月を超える（= 約500ユーザー）
```

### Axiom導入タイミング
```
⏰ 導入: 以下のいずれか
  - ユーザー数 > 1,000
  - API呼び出し > 50万/月
  - console.log だけでは原因特定困難
  - RAG精度を定量的に測定したい
```

### Upstash導入タイミング
```
⏰ 導入: 以下のいずれか
  - APIスパム攻撃を受けた
  - AI APIコストが月¥10,000超え
  - ユーザー数 > 1,000
```

---

## 🚨 緊急時の対応（無料範囲）

### 今すぐできるエラー監視（Vercelのみ）

```bash
# 1. Vercel Dashboard → Logs
https://vercel.com/[your-team]/faro/logs

# 2. フィルター
- Level: Error
- Time: Last 24 hours

# 3. Slack通知（無料）
Vercel → Settings → Integrations → Slack
→ エラーログを自動通知
```

### console.log ベストプラクティス

```typescript
// ❌ 悪い例
console.log('error')

// ✅ 良い例
console.error('[API:Chat] Failed to generate response', {
  userId: req.userId,
  error: error.message,
  timestamp: new Date().toISOString(),
})
```

**Vercel Logs で検索しやすくなる**

---

## 📊 コストシミュレーション

### ユーザー数別の月額コスト

| ユーザー数 | 監視ツール | 月額コスト | 備考 |
|-----------|----------|----------|------|
| 0-500 | Vercel + console.log | **¥0** | 十分 |
| 500-1K | 上記 + Sentry Free | **¥0** | エラー追跡開始 |
| 1K-3K | Sentry Pro + Axiom | **¥8,000** | 本格監視 |
| 3K-10K | 上記 + Upstash | **¥10,500** | Rate Limit |
| 10K+ | 上記 + Datadog | ¥30,000+ | 要検討 |

---

## ✅ アクションプラン（改訂版）

### Phase 0: 今すぐ（0-500ユーザー）✅ 実施中
- [x] Vercel Analytics
- [x] console.error でログ
- [ ] Vercel Logs 確認を習慣化

### Phase 1: 500ユーザー到達時（30分作業）
- [ ] Sentry Free アカウント作成
- [ ] SENTRY_DSN 設定
- [ ] テストエラー確認

### Phase 2: 1,000ユーザー到達時（1日作業）
- [ ] Sentry Pro 契約（$26/月）
- [ ] Axiom Hobby 契約（$25/月）
- [ ] Upstash 契約（¥2,500/月）
- [ ] 統合テスト

### Phase 3: 10,000ユーザー以降（要検討）
- [ ] Datadog検討
- [ ] PagerDuty検討

---

## 💰 結論：今やるべきこと

### ✅ 今すぐ（無料）
```bash
# 1. Vercel Logs を毎日確認する習慣をつける
https://vercel.com/[your-team]/faro/logs

# 2. エラーログを構造化する
console.error('[Module] Description', { context })

# 3. Sentry Freeアカウントだけ作っておく（設定は後回し）
https://sentry.io/signup/
```

### ⏰ 500ユーザー到達したら
```bash
# Sentry Free 有効化（30分作業）
```

### ⏰ 1,000ユーザー到達したら
```bash
# 有料監視ツール導入（1日作業、¥8,000/月）
```

---

**無駄なコストを避けつつ、必要な時に素早く導入できる準備が整いました！** 💪
