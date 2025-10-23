# RAG精度評価・AI品質管理

**データドリブンなAI品質向上戦略**

---

## 🎯 RAG精度評価基準

### 評価指標（3つの軸）

| 指標 | 目標値 | 計測方法 | 重要度 |
|-----|-------|---------|--------|
| **Relevance** (関連性) | > 0.7 | コサイン類似度 | 🔴 Critical |
| **Accuracy** (正確性) | > 85% | 人間評価 | 🔴 Critical |
| **Latency** (応答速度) | < 2s | 実測値 | 🟡 High |

---

## 📊 1. Relevance Score（自動評価）

### 計測方法
```typescript
// lib/ai/rag.ts
export async function searchDocs(query: string): Promise<SearchResult[]> {
  const queryEmbedding = await embed(query) // Gemini embedding

  const results = await supabase
    .rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // ← 関連性の最低ライン
      match_count: 5,
    })

  // 各結果にスコアを付与
  return results.data.map((doc) => ({
    ...doc,
    relevanceScore: doc.similarity, // 0.0-1.0
  }))
}
```

### 評価基準
```typescript
// lib/ai/quality.ts
export function evaluateRelevance(score: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  status: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable'
} {
  if (score >= 0.9) return { grade: 'A', status: 'excellent' }
  if (score >= 0.7) return { grade: 'B', status: 'good' }
  if (score >= 0.5) return { grade: 'C', status: 'acceptable' }
  if (score >= 0.3) return { grade: 'D', status: 'poor' }
  return { grade: 'F', status: 'unacceptable' }
}
```

### ログ記録
```typescript
// app/api/v1/chat/route.ts
import { axiom } from '@/lib/monitoring/axiom'

export async function POST(req: Request) {
  const { query } = await req.json()

  const searchResults = await searchDocs(query)
  const avgRelevance = searchResults.reduce((sum, r) => sum + r.relevanceScore, 0) / searchResults.length

  // Axiomにログ
  await axiom.logChatInteraction({
    userId: userId,
    query: query,
    avgRelevance: avgRelevance,
    resultsCount: searchResults.length,
  })

  // 低品質の場合はアラート
  if (avgRelevance < 0.5) {
    logger.warn('Low RAG relevance detected', {
      query,
      avgRelevance,
      searchResults: searchResults.map(r => r.title),
    })
  }
}
```

---

## 🧑‍⚖️ 2. Accuracy（人間評価）

### 評価フロー
```
ユーザーチャット
    ↓
AI応答生成
    ↓
ユーザーフィードバック（Good / Bad）
    ↓
データベース記録
    ↓
週次レビュー
```

### 実装
```typescript
// lib/supabase/schema.sql
CREATE TABLE chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id),
  user_id UUID REFERENCES users(id),
  feedback TEXT CHECK(feedback IN ('good', 'bad', 'report')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_feedback_created ON chat_feedback(created_at DESC);
```

```typescript
// app/api/v1/feedback/route.ts
export async function POST(req: Request) {
  const { chatId, feedback, comment } = await req.json()

  await supabase.from('chat_feedback').insert({
    chat_id: chatId,
    user_id: userId,
    feedback,
    comment,
  })

  // 即座にモニタリング
  if (feedback === 'bad' || feedback === 'report') {
    logger.warn('Negative feedback received', {
      chatId,
      userId,
      comment,
    })
  }

  return NextResponse.json({ success: true })
}
```

### 週次レポート
```sql
-- 週次の精度レポート
SELECT
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as total_feedbacks,
  COUNT(*) FILTER (WHERE feedback = 'good') as good_count,
  ROUND(COUNT(*) FILTER (WHERE feedback = 'good')::numeric / COUNT(*) * 100, 2) as accuracy_pct
FROM chat_feedback
WHERE created_at >= NOW() - INTERVAL '4 weeks'
GROUP BY week
ORDER BY week DESC;
```

**目標:**
- Good率 > 85%
- Bad率 < 10%
- Report < 1%

---

## ⚡ 3. Latency（応答速度）

### 計測ポイント
```typescript
// app/api/v1/chat/route.ts
export async function POST(req: Request) {
  const startTime = Date.now()

  // 1. RAG検索
  const searchStart = Date.now()
  const docs = await searchDocs(query)
  const searchDuration = Date.now() - searchStart

  // 2. AI生成
  const genStart = Date.now()
  const response = await generateResponse(docs, query)
  const genDuration = Date.now() - genStart

  const totalDuration = Date.now() - startTime

  // ログ記録
  await axiom.logApiCall('/api/v1/chat', totalDuration, 200)

  logger.info('Chat API timing', {
    searchDuration,
    genDuration,
    totalDuration,
    docsCount: docs.length,
  })

  return NextResponse.json({
    response,
    metadata: {
      timing: {
        search: searchDuration,
        generation: genDuration,
        total: totalDuration,
      },
    },
  })
}
```

### 最適化ターゲット
| フェーズ | 目標 | 最適化施策 |
|---------|------|----------|
| RAG検索 | < 500ms | pgvector index最適化 |
| AI生成 | < 1.5s | Streaming response |
| 合計 | < 2s | - |

---

## 🔄 継続的改善プロセス

### 週次サイクル
```
月曜: 前週データ集計
    ↓
火曜: 低品質クエリ分析
    ↓
水曜: ベクトルDB/プロンプト調整
    ↓
木曜: A/Bテスト実施
    ↓
金曜: 結果評価・次週計画
```

### A/Bテスト例
```typescript
// lib/ai/abtest.ts
export async function generateResponseWithAB(
  docs: Document[],
  query: string,
  userId: string
): Promise<string> {
  const variant = getUserVariant(userId) // 'A' or 'B'

  const prompts = {
    A: '以下の情報を元に、簡潔に回答してください。', // 現行
    B: '以下の情報を元に、具体例を交えて詳しく回答してください。', // 新パターン
  }

  const response = await gemini.generate({
    prompt: prompts[variant],
    context: docs,
    query,
  })

  // バリアント記録
  await supabase.from('ab_tests').insert({
    user_id: userId,
    variant,
    query,
    response_length: response.length,
  })

  return response
}
```

---

## 📈 品質ダッシュボード

### Supabase SQL（週次実行）
```sql
-- RAG品質サマリー
WITH chat_metrics AS (
  SELECT
    DATE(created_at) as date,
    AVG(rag_relevance) as avg_relevance,
    AVG(response_time_ms) / 1000.0 as avg_response_sec,
    COUNT(*) as chat_count
  FROM chats
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(created_at)
),
feedback_metrics AS (
  SELECT
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE feedback = 'good') as good_count,
    COUNT(*) as total_feedback
  FROM chat_feedback
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(created_at)
)
SELECT
  c.date,
  c.avg_relevance,
  c.avg_response_sec,
  c.chat_count,
  ROUND(f.good_count::numeric / NULLIF(f.total_feedback, 0) * 100, 2) as accuracy_pct
FROM chat_metrics c
LEFT JOIN feedback_metrics f ON c.date = f.date
ORDER BY c.date DESC;
```

**可視化（Axiom Dashboard）:**
```
┌─────────────────────────────────────┐
│ RAG Quality Metrics (Last 7 Days)  │
├─────────────────────────────────────┤
│ 📊 Avg Relevance: 0.76 (🟢 Target: >0.7) │
│ ⚡ Avg Latency: 1.8s (🟢 Target: <2s)     │
│ ✅ Accuracy: 87% (🟢 Target: >85%)        │
│ 💬 Total Chats: 1,245                    │
└─────────────────────────────────────┘
```

---

## 🚨 アラート条件

### Critical（即座対応）
- Relevance < 0.5（3回連続）
- Accuracy < 70%（日次）
- Latency > 5s（p95）

### Warning（1日以内対応）
- Relevance < 0.7（1時間平均）
- Accuracy < 85%（週次）
- Latency > 3s（p95）

---

## 🛠️ ツール

### 1. 品質評価スクリプト
```bash
# scripts/evaluate_rag.ts
pnpm tsx scripts/evaluate_rag.ts --days 7
```

### 2. ベンチマークテスト
```typescript
// test/benchmark/rag.bench.ts
import { searchDocs } from '@/lib/ai/rag'

const testQueries = [
  '確定申告の期限は？',
  'iDeCoとNISAの違い',
  '住宅ローン控除の条件',
  // ...
]

for (const query of testQueries) {
  const start = Date.now()
  const results = await searchDocs(query)
  const duration = Date.now() - start

  console.log({
    query,
    avgRelevance: results.reduce((s, r) => s + r.relevanceScore, 0) / results.length,
    duration,
    status: duration < 500 && results[0]?.relevanceScore > 0.7 ? '✅' : '❌',
  })
}
```

---

**データドリブンで継続的にAI品質を改善しましょう。**
