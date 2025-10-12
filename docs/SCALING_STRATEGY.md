# Faro Scaling Strategy
# スケール対応戦略ドキュメント

**作成日**: 2025-10-12
**対象**: 100万ユーザー超を見据えたアーキテクチャ移行計画

---

## 🎯 概要

Faroは現在、Next.js API Routesをバックエンドとして使用していますが、100万ユーザーを超えるとパフォーマンスのボトルネックとなる可能性があります。

このドキュメントでは、段階的なスケーリング戦略と、適切な移行タイミングを定義します。

---

## 📊 現在の構成（Phase 1: 0〜100万ユーザー）

### アーキテクチャ
```
ユーザー
  ↓
Vercel (Next.js 15 + API Routes)
  ↓
Supabase (PostgreSQL + Auth + RLS + pgvector)
  ↓
Gemini API (AI処理)
```

### 限界点
- **Vercel Serverless Functions**: 10秒タイムアウト、10MB レスポンスサイズ制限
- **Next.js API Routes**: CPU集約的な処理が不得意
- **Supabase無料枠**: 500MB DB、50,000 Monthly Active Users
- **Gemini API**: 60 RPM (リクエスト/分)

### 現状の強み
- **開発速度**: 一人で超高速開発可能
- **コスト**: ほぼ$0（月間100万リクエストまで無料）
- **シンプルさ**: モノレポで全て管理
- **デプロイ**: Git push → 自動デプロイ

---

## 🚀 Phase 2: マイクロサービス移行（10万〜100万ユーザー）

### 移行トリガー（以下のいずれか）
1. API Routes のレスポンスタイムが500ms超を常時記録
2. Vercel Function実行時間が平均8秒超
3. Supabase Connectionプーリングが枯渇（500並列接続超）
4. 月間コストが$500超

### 移行先候補

#### Option A: FastAPI + Railway/Fly.io（推奨）
```
ユーザー
  ↓
Vercel (Next.js Frontend)
  ↓
Railway (FastAPI Backend)
  ↓
Supabase / Neon (PostgreSQL)
  ↓
Gemini API
```

**メリット**:
- Python製で機械学習と相性最高
- 開発速度維持（型ヒント、自動ドキュメント生成）
- Railway/Fly.ioは$5/月〜でスケール可能
- WebSocket対応（リアルタイム機能追加可）

**コスト**:
- Railway: $5〜$20/月（小〜中規模）
- Neon: $19/月〜（Supabase互換、Autoscaling）

**移行手順**:
1. `packages/core` → FastAPI UseCase実装
2. `packages/infrastructure` → Supabaseクライアント移植
3. Next.js → FastAPIへのプロキシ設定（`rewrites`）
4. 段階的にエンドポイント移行（Canary Deploy）

#### Option B: Go + Cloud Run（スケール重視）
```
ユーザー
  ↓
Cloudflare (CDN)
  ↓
Cloud Run (Go Backend)
  ↓
Cloud SQL / Supabase
  ↓
Gemini API
```

**メリット**:
- 超高速（Go並行処理）
- Google Cloudエコシステム統合（Gemini、Cloud SQL）
- 完全従量課金（リクエストゼロなら$0）
- コールドスタート高速

**コスト**:
- Cloud Run: $0.0001/リクエスト（月100万リクエスト = $100）
- Cloud SQL: $10〜$300/月

**デメリット**:
- Go学習コスト（一人開発で負担）
- 開発速度低下

---

## ⚡ Phase 3: ハイパースケール（100万〜1000万ユーザー）

### アーキテクチャ
```
ユーザー
  ↓
Cloudflare (CDN + Workers)
  ↓
Load Balancer
  ↓
Kubernetes Cluster (API + AI Workers)
  ↓
PostgreSQL (Primary-Replica) + Redis (Cache)
  ↓
Gemini API / Self-hosted LLM
```

### 移行要素
1. **Read/Write分離**: PostgreSQL Primary-Replica構成
2. **キャッシュ層**: Redis（会話履歴、セッション）
3. **AI専用サーバー**: Gemini → Self-hosted Llama 3.3（コスト削減）
4. **非同期処理**: RabbitMQ/SQS（重いAI処理をキュー化）
5. **CDN最適化**: 静的アセット99%キャッシュヒット率

### コスト試算
- Kubernetes: $300〜$1,000/月（GKE/EKS）
- PostgreSQL Managed: $200〜$500/月
- Redis Managed: $50〜$200/月
- **Total**: $550〜$1,700/月

**期待収益**: 100万ユーザー × 5%転換率 × $9.99 = **$499,500/月**

---

## 🛠️ 技術的負債の回避戦略

### 1. Clean Architectureの維持
現在のモノレポ構成を維持:
```
@faro/core         ← ビジネスロジック（言語非依存）
@faro/infrastructure ← DB/AI統合（移行しやすい）
```

**移行時のポイント**:
- `@faro/core` の TypeScript → Python/Go移植
- Repository InterfaceをそのままFastAPI/Goで実装

### 2. Database移行の最小化
Supabase → Neonへの移行は容易:
- 両方ともPostgreSQL互換
- pgvectorサポート
- 接続文字列変更のみ

### 3. APIバージョニング
```
/api/v1/chat  ← 現行（Next.js API Routes）
/api/v2/chat  ← 新環境（FastAPI/Go）
```
- フロントエンドは環境変数で切り替え
- A/Bテストで段階移行

---

## 📈 移行タイミングの判断指標

### 現在地の確認コマンド
```bash
# Vercel Function実行時間チェック
vercel logs --follow

# Supabase接続数確認
supabase db inspect

# Gemini APIレート制限チェック
curl -H "Authorization: Bearer $GEMINI_API_KEY" https://generativelanguage.googleapis.com/v1/models
```

### 移行推奨タイミング

| 指標 | Phase 1維持 | Phase 2移行検討 | Phase 2移行必須 |
|------|------------|----------------|----------------|
| DAU（日間アクティブユーザー） | < 1,000 | 1,000〜10,000 | > 10,000 |
| API平均レスポンス | < 300ms | 300〜500ms | > 500ms |
| Vercel請求額 | < $100 | $100〜$500 | > $500 |
| Supabase接続数 | < 100 | 100〜400 | > 400 |
| エラー率 | < 0.1% | 0.1〜1% | > 1% |

---

## 🎯 推奨アクション（2025年版）

### 今すぐやるべきこと（Phase 1）
- [x] モニタリング必須化（Sentry + Axiom）
- [x] Clean Architecture完全実装
- [ ] Load Testing（Apache JMeter/k6で10,000リクエスト/分）
- [ ] Database Indexing最適化（EXPLAIN ANALYZE実行）

### 1万ユーザー達成時（Phase 1.5）
- [ ] Supabase Pro移行（$25/月）
- [ ] Upstash Redis導入（レート制限強化）
- [ ] CDNキャッシュ戦略最適化

### 10万ユーザー達成時（Phase 2）
- [ ] FastAPI Proof of Concept実装
- [ ] `/api/v2/chat` エンドポイント作成
- [ ] Railway/Fly.ioデプロイ

### 100万ユーザー達成時（Phase 3）
- [ ] Kubernetes移行計画策定
- [ ] SREエンジニア採用検討
- [ ] Self-hosted LLM検討（コスト削減）

---

## 📚 参考資料

### 同規模サービスの事例
- **Notion**: FastAPI + PostgreSQL → K8s移行（100万ユーザー時）
- **Linear**: Next.js + PostgreSQL維持（50万ユーザーで$20M ARR達成）
- **Superhuman**: Next.js + Go → 10万ユーザーで$20M ARR

### ベンチマーク
```bash
# Next.js API Routes (現行)
- Requests/sec: 50〜100
- Avg Latency: 200〜500ms
- Max Concurrency: 100

# FastAPI (移行後想定)
- Requests/sec: 500〜1,000
- Avg Latency: 50〜200ms
- Max Concurrency: 1,000

# Go + Cloud Run (最終形)
- Requests/sec: 5,000〜10,000
- Avg Latency: 10〜50ms
- Max Concurrency: 10,000
```

---

## ✅ アクションアイテム

- [ ] Sentryダッシュボード作成（P95レイテンシ監視）
- [ ] Axiomアラート設定（エラー率1%超で通知）
- [ ] 月次レビュー（移行判断指標チェック）
- [ ] FastAPI移行リポジトリ準備（`experiments/fastapi-backend`）

---

**結論**: 現在はPhase 1で十分。10万ユーザー達成までNext.js維持、その後FastAPIへ段階移行。
