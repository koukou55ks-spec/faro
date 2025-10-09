# Faro プロジェクトコンテキスト

> **最終更新**: 2025-10-09
> **ステータス**: MVP開発中（Step 2完了）
> **評価スコア**: 5.5/10

---

## 🎯 プロジェクト概要

**Faro** - 知識格差を是正するパーソナルCFO AIアプリ

### コアバリュー
- 税務・会計の専門知識を誰でもアクセス可能に
- AI（Gemini 2.0）による24/7相談対応
- ユーザーの学習履歴から最適なアドバイス

### 目標KPI
- **1ヶ月後**: 100ユーザー獲得
- **3ヶ月後**: MRR $1,000達成
- **6ヶ月後**: 有料会員500人

---

## 🏗️ 技術スタック

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Markdown**: marked

### Backend
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth (email/password)
- **AI**: Google Gemini 2.0 Flash

### Deployment
- **Frontend**: Vercel
- **Database**: Supabase Cloud
- **CI/CD**: GitHub Actions（予定）

### 削除済み技術
- ❌ FastAPI → Next.js API Routesで代替
- ❌ ChromaDB → Supabase pgvectorで代替
- ❌ SQLite → PostgreSQLで代替

---

## 📁 プロジェクト構造

```
frontend/
├── app/
│   ├── workspace/page.tsx         # ★メインアプリ
│   ├── api/chat/route.ts          # Gemini直接呼び出し
│   └── apps/                      # マイクロアプリ群
│       ├── kakeibo/               # 家計簿
│       ├── shiwake/               # 仕訳帳
│       └── notes/                 # ノート
│
├── components/
│   ├── workspace/                 # Workspaceコンポーネント
│   └── ui/                        # shadcn/ui
│
└── lib/
    ├── supabase/                  # Supabase Client
    └── hooks/                     # カスタムHooks

supabase/
└── migrations/
    ├── 001_initial_schema.sql     # pgvector + RLS
    └── 002_data_flywheel_schema.sql

.claude/
├── commands/                      # Slash Commands
│   ├── ship.md                    # /ship - 本番デプロイ
│   ├── test.md                    # /test - テスト実行
│   ├── fix.md                     # /fix - エラー修正
│   └── status.md                  # /status - 状況レポート
└── mcp.json                       # MCP設定
```

---

## ✅ 実装完了機能

### Week 1-3: 基盤構築
- [x] Next.js 15 + Supabase セットアップ
- [x] Gemini 2.0統合
- [x] 認証機能（ログイン・サインアップ）
- [x] Workspaceベースレイアウト

### Week 4-5: コア機能
- [x] Chat機能（エキスパートモード対応）
- [x] ノート機能（Notion風エディタ）
- [x] 法令検索パネル
- [x] pgvectorベクトル検索

### 最近の改善（2025-10-09）
- [x] セキュリティ対応（環境変数化）
- [x] Git初期化
- [x] Slash Commands作成
- [x] MCP設定簡素化

---

## 🚧 未実装・課題

### 高優先度
1. **テストカバレッジ0%** → 80%目標
   - Chat API テスト
   - Auth テスト
   - コンポーネントテスト

2. **Stripe決済未実装**
   - サブスクリプション機能
   - 決済フロー

3. **エラーハンドリング不足**
   - Sentry導入
   - エラーバウンダリ実装

### 中優先度
4. RAG精度向上（ベクトル検索最適化）
5. ユーザーオンボーディングフロー
6. レスポンシブデザイン改善

### 低優先度
7. PWA対応
8. 多言語対応
9. ダークモード

---

## 🛠️ 開発フロー

### 日常的なコマンド
```bash
# 開発サーバー起動
cd frontend && npm run dev

# コード品質チェック
npm run type-check && npm run lint

# ビルド確認
npm run build
```

### Slash Commands（Claude Code専用）
```bash
/ship      # 本番デプロイ（型チェック→ビルド→Git→Vercel）
/test      # テスト実行とカバレッジ確認
/fix       # エラー自動修正
/status    # プロジェクト状況レポート
```

### Git フロー
```bash
# 機能開発
git checkout -b feature/new-feature
# 開発...
git add .
git commit -m "feat: Add new feature"
git push

# Claude Codeに「PRつくって」と依頼 → GitHub MCPで自動作成
```

---

## 🔐 環境変数

### 必須
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# AI
GEMINI_API_KEY=AIza...

# MCP
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...
VERCEL_ACCESS_TOKEN=xxx...
NOTION_API_KEY=ntn_...
```

### オプション
```bash
SENTRY_DSN=
BRAVE_API_KEY=  # Web検索用
```

---

## 📊 現在の課題と次のアクション

### 技術的負債
1. `archive/`フォルダが巨大（未整理）
2. テストが存在しない
3. エラーログが散在

### 次の3つのアクション

#### 1. 最優先（今すぐ）
**テスト環境構築**
- Jest + React Testing Library セットアップ
- Chat API の統合テスト
- カバレッジ30%達成

#### 2. 重要（今週中）
**Stripe決済実装**
- Stripe Checkout統合
- サブスクリプション管理
- Webhook設定

#### 3. 改善（時間があれば）
**パフォーマンス最適化**
- 画像最適化（Next.js Image）
- コード分割
- キャッシュ戦略

---

## 💡 AI開発のベストプラクティス

### Claude Codeへの指示例

**❌ 悪い例:**
```
「テスト書いて」
```

**✅ 良い例:**
```
「frontend/app/api/chat/route.tsのテストを作成してください。
- Jest + Supertest使用
- 正常系・異常系を網羅
- エキスパートモードのテストも含める
- カバレッジ80%以上を目指す」
```

### コンテキスト共有のコツ
- このCONTEXT.mdを常に最新に保つ
- 新機能追加時は「実装完了機能」を更新
- 課題が解決したら「未実装・課題」から削除

---

## 📚 参考資料

- [CLAUDE.md](../CLAUDE.md) - プロジェクト全体仕様
- [DEPLOY_NOW.md](../DEPLOY_NOW.md) - デプロイガイド
- [SECURITY_CHECKLIST.md](../SECURITY_CHECKLIST.md) - セキュリティ対応
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

---

**Last Updated**: 2025-10-09 by Claude Code
**Next Review**: 機能追加時または週1回
