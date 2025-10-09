# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Faro - Personal CFO AI Application

Faroは知識格差を是正するパーソナルCFOアプリです。Next.js 14 + Supabase + Gemini 2.0で構築された、シンプルで拡張性の高いアーキテクチャを採用しています。

**実装ステータス**: Week 1-5完了。Next.js単体アーキテクチャ（FastAPI削除済み）。本番デプロイ準備完了。

**重要**: `static/workspace.html`はarchiveに移動済み。メインアプリは[frontend/app/workspace/page.tsx](frontend/app/workspace/page.tsx)。

---

## Common Commands

### 開発サーバー
```bash
cd frontend
npm run dev          # 開発サーバー起動（Turbopack）
npm run build        # プロダクションビルド
npm start            # プロダクションサーバー起動
npm run lint         # ESLint実行
npm run type-check   # TypeScript型チェック
```

### アクセスURL
- Main App: http://localhost:3000/workspace
- Landing: http://localhost:3000
- Auth: http://localhost:3000/auth/login

### データベース
```bash
supabase start       # ローカルSupabase起動
supabase db push     # マイグレーション適用
supabase migration new <name>  # 新規マイグレーション作成
```

### デプロイ
```bash
cd frontend
vercel               # プレビューデプロイ
vercel --prod        # 本番デプロイ
```

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 3.4 + shadcn/ui (Radix UI)
- **Database**: Supabase (PostgreSQL + pgvector + Auth)
- **AI**: Google Gemini 2.0 Flash
- **State**: Zustand + TanStack Query
- **Markdown**: marked
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

**削除済み**: FastAPI, ChromaDB, SQLite → archiveフォルダ

---

## Architecture

### 現在のアーキテクチャ（シンプル・スケーラブル）
```
Next.js on Vercel
  ├─ Frontend (React 19 + Tailwind)
  ├─ API Routes (/api/chat, /api/notes)
  │   └─ Gemini直接呼び出し（FastAPI不要）
  └─ Supabase
      ├─ PostgreSQL + pgvector（ChromaDB代替）
      ├─ Auth（email/password）
      └─ Row Level Security (RLS)
```

### なぜFastAPIを削除？
1. **MVPではRAGがシンプル** - Gemini APIを直接Next.jsから呼べば十分
2. **コスト削減** - $5-95/月 → $0-45/月
3. **開発速度UP** - 単一コードベース（TypeScript）
4. **デプロイ簡略化** - Vercel 1箇所のみ
5. **無限スケール** - Vercel自動スケール

**PMF達成後の拡張**: 複雑なAI処理が必要な場合、Python AIマイクロサービスを追加可能。

---

## File Structure

```
frontend/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── workspace/page.tsx           # ★メインアプリ
│   ├── workspace-new/page.tsx       # 新UI実験
│   ├── dashboard/page.tsx           # ダッシュボード
│   ├── faro/page.tsx                # Faro専用UI
│   ├── apps/                        # マイクロアプリ群
│   │   ├── kakeibo/page.tsx         # 家計簿
│   │   ├── shiwake/page.tsx         # 仕訳帳
│   │   ├── calendar/page.tsx        # カレンダー
│   │   └── notes/page.tsx           # ノート
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── terms/page.tsx               # Stripe必須ページ
│   ├── privacy/page.tsx
│   ├── refund/page.tsx
│   └── api/
│       ├── chat/route.ts            # ★Gemini直接呼び出し
│       └── notes/create/route.ts    # ノート作成API
│
├── components/
│   ├── workspace/                   # Workspaceコンポーネント
│   │   ├── Sidebar.tsx
│   │   ├── ChatPanel.tsx            # エキスパートモード対応
│   │   ├── NotesPanel.tsx           # Notion風エディタ
│   │   └── LawSearchPanel.tsx
│   └── ui/                          # shadcn/ui components
│
├── lib/
│   ├── hooks/
│   │   └── useAuth.ts               # Supabase Auth Hook
│   ├── api/
│   │   ├── chat.ts                  # Chat API Client
│   │   └── notes.ts                 # Notes API Client
│   └── supabase/
│       ├── client.ts                # Client-side Supabase
│       └── server.ts                # Server-side Supabase
│
└── package.json                     # Next.js 15 + React 19

supabase/
└── migrations/
    └── 001_initial_schema.sql       # ★pgvector + RLS

archive/                             # 削除済みファイル
├── app/ (FastAPI)
└── workspace.html
```

---

## Key Implementation Details

### 1. Chat API Route（FastAPI代替）

[frontend/app/api/chat/route.ts](frontend/app/api/chat/route.ts)がFastAPIの代わりにGemini APIを直接呼び出し：

```typescript
// エキスパートモード分岐
const prompt = expert_mode ? buildExpertPrompt() : buildNormalPrompt()

// Gemini直接呼び出し
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
const result = await model.generateContent(fullPrompt)

return NextResponse.json({ answer: result.response.text() })
```

**ポイント**:
- エキスパートモードはプロンプト切り替えのみ（別モデル不要）
- `include_user_notes`でユーザーノート統合
- `appContext`でアプリ固有のコンテキスト注入可能

### 2. Supabase Database（ChromaDB代替）

[supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)でpgvectorを使用：

```sql
CREATE EXTENSION vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  content TEXT,
  embedding VECTOR(768),  -- Gemini Embedding 768次元
  metadata JSONB
);

-- ベクトル検索関数
CREATE FUNCTION match_documents(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
) RETURNS TABLE (...) AS $$
  SELECT id, content, 1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql;

-- Row Level Security
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notes" ON user_notes
  USING (auth.uid() = user_id);
```

**ポイント**:
- ChromaDBはローカルファイル→デプロイ不可。pgvectorはPostgreSQLネイティブ。
- RLSでセキュリティ完全保護（サーバーサイド）
- ベクトル検索性能: <50ms for 10k documents

### 3. 認証フロー

```typescript
// lib/hooks/useAuth.ts
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

// RLS自動適用
const { data } = await supabase
  .from('user_notes')
  .select('*')  // 自分のノートのみ取得
```

---

## Development Workflow

### 新機能追加

```bash
# 1. コンポーネント作成
# frontend/components/workspace/NewFeature.tsx

# 2. API Route追加（必要な場合）
mkdir -p frontend/app/api/new-feature
# frontend/app/api/new-feature/route.ts

# 3. Workspaceに統合
# frontend/app/workspace/page.tsx を編集
```

### データベース変更

```bash
# 1. マイグレーション作成
supabase migration new add_feature_table

# 2. SQLファイル編集
# supabase/migrations/00X_add_feature_table.sql

# 3. ローカル適用
supabase db push

# 4. 本番適用（Supabase Dashboard → Database → Migrations）
```

### テスト

```bash
# 型チェック
npm run type-check

# Lint
npm run lint

# ビルド確認
npm run build
```

---

## Environment Variables

### frontend/.env.local
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # RLS回避用（サーバーのみ）

# Gemini AI
GEMINI_API_KEY=AIzaSy...

# App
NEXT_PUBLIC_API_URL=http://localhost:3000  # 本番: https://faro.vercel.app
```

**取得方法**:
- Supabase: Dashboard → Settings → API
- Gemini: https://makersuite.google.com/app/apikey

---

## Production Deploy

詳細: [DEPLOY_NOW.md](DEPLOY_NOW.md)（30分で完了）

### クイックスタート
```bash
# 1. Supabaseプロジェクト作成（10分）
# https://supabase.com/dashboard

# 2. GitHubにpush
git add .
git commit -m "Initial commit"
git push origin main

# 3. Vercelデプロイ（5分）
cd frontend
vercel --prod

# 4. 環境変数設定（Vercel Dashboard）
# NEXT_PUBLIC_SUPABASE_URL, GEMINI_API_KEY等

# 5. Stripeセットアップ（12分、オプション）
```

**コスト見積もり**:
- 0-100ユーザー: $0/月（全て無料枠）
- 100-1000ユーザー: $55/月（Vercel Pro + Supabase Pro）

---

## Important Docs

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - 30分デプロイガイド
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Week 1-5実装サマリー
- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - 技術仕様書（アーキテクチャ変更詳細）
- **[CLEANUP_PLAN.md](CLEANUP_PLAN.md)** - クリーンアップ計画

---

## Troubleshooting

### 開発サーバーが起動しない
```bash
# Node.jsバージョン確認（18+必須）
node --version

# 依存関係再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Supabase接続エラー
```bash
# 環境変数確認
echo $NEXT_PUBLIC_SUPABASE_URL

# .env.local存在確認
ls -la frontend/.env.local

# Supabase Dashboard → Settings → API で再確認
```

### Gemini API エラー
```bash
# APIキー確認
echo $GEMINI_API_KEY

# Google AI Studioでクォータ確認
# https://makersuite.google.com/app/apikey
```

---

## Architecture Decision Records

### ADR-001: FastAPI削除（2025-01-10）
**決定**: FastAPIを削除し、Next.js API Routesのみ使用

**理由**:
1. MVPではシンプルなRAGで十分
2. Gemini APIはNext.jsから直接呼び出し可能
3. 単一コードベースで開発速度向上
4. デプロイ簡略化（Vercel 1箇所）
5. コスト削減（$5-95 → $0-45/月）

**影響**:
- コード行数 -500行
- デプロイ時間 20分 → 5分
- 学習コスト減（TypeScriptのみ）

### ADR-002: pgvectorでChromatDB代替（2025-01-10）
**決定**: ChromaDBをSupabase pgvectorに置き換え

**理由**:
1. ChromaDBはローカルファイル→本番デプロイ不可
2. pgvectorはPostgreSQLネイティブ→Supabaseで即利用可能
3. ベクトル検索性能はほぼ同等
4. RLSでセキュリティ強化

**性能**: <50ms for 10k documents（コサイン類似度）

---

**Status**: ✅ Week 1-5完了。本番デプロイ準備完了。
**Last Updated**: 2025-01-10
