# 監視・ログ戦略

**段階的に導入する実用的な監視体制**

---

## 🎯 監視方針

### Stage別監視レベル

| Stage | ユーザー数 | 監視ツール | 月額コスト | 重点項目 |
|-------|-----------|----------|----------|---------|
| **MVP** | 0-1K | Vercel Analytics | ¥0 | パフォーマンス |
| **Growth** | 1K-10K | Sentry + Axiom | ¥5,000 | エラー率、API遅延 |
| **Scale** | 10K+ | 上記 + Datadog | ¥30,000 | インフラ全体 |

---

## 📊 監視ツール構成

### 1. Vercel Analytics（MVP段階）✅ 必須

**監視項目:**
- ページビュー
- リアルユーザーメトリクス（Core Web Vitals）
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- デプロイ履歴

**設定:**
```typescript
// apps/web/app/layout.tsx（既に実装済み）
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**ダッシュボード:**
https://vercel.com/[your-team]/faro/analytics

---

### 2. Sentry（Growth段階）🔴 優先

**監視項目:**
- **エラー追跡**
  - JavaScriptエラー
  - API例外
  - 未処理のPromise Rejection
- **パフォーマンス**
  - トランザクション追跡
  - API遅延
- **セッションリプレイ**（有料プラン）

**設定:**

#### Step 1: 初期化
```typescript
// apps/web/instrumentation.ts（既に実装済み）
import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || 'development',
    tracesSampleRate: 0.1, // 10%のトランザクションをトレース
    beforeSend(event, hint) {
      // 個人情報をフィルタリング
      if (event.user) {
        delete event.user.email
      }
      return event
    },
  })
}
```

#### Step 2: エラーハンドリング
```typescript
// apps/web/app/api/v1/chat/route.ts
import { logger } from '@/lib/monitoring/logger'

export async function POST(req: Request) {
  try {
    const result = await processChat(req)
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Chat API failed', {
      error: error.message,
      userId: req.headers.get('user-id'),
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

#### Step 3: カスタムエラー
```typescript
// lib/monitoring/logger.ts
import * as Sentry from '@sentry/nextjs'

export const logger = {
  info: (message: string, extra?: object) => {
    console.log(`[INFO] ${message}`, extra)
  },

  warn: (message: string, extra?: object) => {
    console.warn(`[WARN] ${message}`, extra)
    Sentry.captureMessage(message, {
      level: 'warning',
      extra,
    })
  },

  error: (message: string, extra?: object) => {
    console.error(`[ERROR] ${message}`, extra)
    Sentry.captureException(new Error(message), {
      extra,
    })
  },

  // AI応答の品質追跡
  aiQuality: (metrics: {
    responseTime: number
    relevanceScore: number
    userFeedback?: 'good' | 'bad'
  }) => {
    Sentry.addBreadcrumb({
      category: 'ai.quality',
      data: metrics,
      level: 'info',
    })
  },
}
```

**アラート設定（Sentry Dashboard）:**
```yaml
Alerts:
  - Error Rate > 5% (1時間)
  - API Response Time > 3s (p95)
  - 新規エラー発生時（即座通知）
```

**コスト:**
- 無料枠: 5,000エラー/月
- Developer: $26/月（50,000エラー）
- Team: $80/月（250,000エラー）

---

### 3. Axiom（Growth段階）🟡 推奨

**監視項目:**
- **構造化ログ**
  - API呼び出しログ
  - ユーザー行動ログ
  - AI応答ログ
- **カスタムメトリクス**
  - RAG精度
  - チャット離脱率

**設定:**

#### Step 1: 初期化
```typescript
// lib/monitoring/axiom.ts
import { Logger } from 'next-axiom'

const log = new Logger({
  source: 'faro-app',
})

export const axiom = {
  logChatInteraction: async (data: {
    userId: string
    query: string
    responseTime: number
    ragRelevance: number
  }) => {
    log.info('chat.interaction', data)
    await log.flush()
  },

  logApiCall: async (endpoint: string, duration: number, status: number) => {
    log.info('api.call', { endpoint, duration, status })
    await log.flush()
  },

  logUserAction: async (action: string, metadata?: object) => {
    log.info('user.action', { action, ...metadata })
    await log.flush()
  },
}
```

#### Step 2: ミドルウェアで自動ログ
```typescript
// apps/web/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Logger } from 'next-axiom'

export async function middleware(request: NextRequest) {
  const logger = new Logger({ source: 'middleware' })
  const start = Date.now()

  const response = NextResponse.next()

  const duration = Date.now() - start
  logger.info('request', {
    method: request.method,
    url: request.url,
    duration,
    status: response.status,
  })

  await logger.flush()
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

**ダッシュボードクエリ例:**
```sql
-- API遅延トップ5
['req.method'] = 'POST'
| summarize avg(_duration), p95(_duration) by ['req.url']
| order by p95_duration desc
| limit 5

-- RAG精度トレンド
['event'] = 'chat.interaction'
| summarize avg(ragRelevance) by bin(_time, 1h)
```

**コスト:**
- 無料枠: 500MB/月
- Hobby: $25/月（100GB）

---

### 4. Upstash Rate Limiting（Growth段階）🔴 優先

**設定:**
```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = {
  // 一般API: 10リクエスト/分
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),

  // AI Chat: 5リクエスト/分（コスト高）
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  }),

  // Pro: 無制限（実際は100/分で制限）
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
}
```

**適用例:**
```typescript
// app/api/v1/chat/route.ts
import { ratelimit } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const userId = req.headers.get('user-id')
  const isPro = req.headers.get('subscription') === 'pro'

  const limiter = isPro ? ratelimit.pro : ratelimit.chat
  const { success, remaining } = await limiter.limit(userId || 'anonymous')

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', remaining },
      { status: 429 }
    )
  }

  // 処理続行
}
```

---

## 📈 メトリクス定義

### 1. ゴールデンシグナル（SRE）

| メトリクス | 目標値 | アラート条件 |
|----------|-------|------------|
| **Latency** (API応答) | p95 < 1s | p95 > 3s |
| **Traffic** (リクエスト/秒) | - | 急増・急減 |
| **Errors** (エラー率) | < 1% | > 5% |
| **Saturation** (CPU/DB) | < 70% | > 90% |

### 2. ビジネスメトリクス

| メトリクス | 計測方法 | 目標 |
|----------|---------|------|
| **チャット完遂率** | 返信あり/総リクエスト | > 95% |
| **RAG精度** | relevance score平均 | > 0.7 |
| **ユーザー満足度** | Good/Bad評価 | > 80% Good |
| **Pro転換率** | Pro登録/総ユーザー | > 5% |

---

## 🚨 アラート設定

### Critical（即座対応）🔴
- API全体ダウン
- データベース接続エラー
- 決済処理失敗

### High（1時間以内）🟡
- エラー率 > 5%
- API p95 > 3秒
- RAG精度 < 0.5

### Medium（1日以内）🟢
- 新規エラー発生
- メモリ使用率 > 80%
- ディスク使用率 > 90%

---

## 🔗 ダッシュボード構成

### 1. オペレーション（日次確認）
```
┌─────────────────────────────────┐
│ Faro Operations Dashboard       │
├─────────────────────────────────┤
│ ✅ API Health: 99.8% (24h)      │
│ ⚠️  Errors: 12 (last hour)      │
│ 📈 Traffic: 1.2K req/min        │
│ 🕒 p95 Latency: 850ms           │
└─────────────────────────────────┘
```

### 2. ビジネス（週次確認）
```
┌─────────────────────────────────┐
│ Faro Business Metrics           │
├─────────────────────────────────┤
│ 👥 Active Users: 2,450          │
│ 💬 Chats: 8,900 (this week)     │
│ 🎯 RAG Accuracy: 0.76           │
│ 💰 Pro Conversion: 6.2%         │
└─────────────────────────────────┘
```

---

## 🛠️ 実装ロードマップ

### Phase 1: MVP（現在）✅
- [x] Vercel Analytics
- [x] 基本的なconsole.log

### Phase 2: Growth（1000ユーザー到達時）🔴
- [ ] Sentry統合（1日）
- [ ] Axiom統合（1日）
- [ ] Rate Limiting（1日）
- [ ] アラート設定（半日）

### Phase 3: Scale（10000ユーザー以降）🟢
- [ ] Datadog統合（オプション）
- [ ] APM（Application Performance Monitoring）
- [ ] 分散トレーシング

---

## 📚 参考資料

- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Axiom Next.js Integration](https://axiom.co/docs/integrations/vercel)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)

---

**現実的なコストで最大の可視性を実現しましょう。**
