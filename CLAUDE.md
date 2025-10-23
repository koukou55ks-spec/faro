# Faro 開発ガイド

**このファイルは、AI（Claude）が一貫した開発を行うための唯一の真実の情報源です。**

---

## 🎯 絶対ルール（最重要）

1. **実装前に必ずローカルでテスト** - `pnpm dev` で動作確認してからコミット
2. **コミット前に必ずチェック** - `pnpm pre-deploy` を実行
3. **安定版には必ずタグを付ける** - `git tag -a v1.0.0 -m "説明"`
4. **推測で実装しない** - 不明点があれば必ず質問
5. **既存コードを読んでから修正** - 新ファイル作成より既存修正を優先
6. **CLAUDE.mdの内容を勝手に変更しない**
7. **一時的なファイルを作らない** - セットアップ用SQL、手順書、確認スクリプトはチャットで提示。ファイル化するのはマイグレーションファイル(`supabase/migrations/`の日付付き.sql)のみ

---

✅ 最適アーキテクチャ（v3.0実装完了）
ディレクトリ構造（シンプル＆拡張可能）
apps/web/
├── app/ # Next.js App Router
│ ├── (auth)/ # 認証 ✅
│ ├── api/ # API一元化 ✅
│ │ └── v1/ # バージョニング ✅
│ │   └── chat/ # チャットAPI ✅
│ ├── connect/ # アフィリエイト ✅
│ ├── mypage/ # マイページ ✅
│ ├── search/ # 検索 ✅
│ └── tools/ # ツール ✅
│
├── components/ # UIコンポーネント ✅
│ ├── ui/ # 共通UIコンポーネント ✅
│ │ ├── editor/ # エディター ✅
│ │ ├── ErrorBoundary.tsx ✅
│ │ ├── LoadingSkeleton.tsx ✅
│ │ └── AffiliateLink.tsx ✅
│ └── features/ # 機能別コンポーネント ✅
│   ├── chat/ # チャット機能 ✅
│   ├── notes/ # ノート機能 ✅
│   ├── quiz/ # クイズ機能 ✅
│   ├── simulator/ # シミュレーター ✅
│   └── subscription/ # サブスク管理 ✅
│
├── lib/ # コアロジック ✅
│ ├── ai/ # AI統合 ✅
│ │ ├── gemini.ts # Gemini 1.5 Flash ✅
│ │ ├── rag.ts # RAGシステム ✅
│ │ └── agents.ts # エージェント ✅
│ ├── hooks/ # カスタムフック ✅
│ ├── store/ # Zustand ストア ✅
│ ├── supabase/ # Supabase クライアント ✅
│ ├── monitoring/ # Sentry/Axiom ✅
│ └── recommendations/ # レコメンドエンジン ✅
│
├── public/ # 静的ファイル ✅
└── types/ # TypeScript型定義 ✅

なぜこの構造か：
✅ シンプルで迷わない（認知負荷: 低）
✅ 保守性が高い（6ヶ月後も理解可能）
✅ オンボーディング時間: 半日
✅ モノレポ不要（YAGNI原則）
✅ 必要に応じて拡張可能
💻 技術スタック（現実的最適解）
コア技術
必須:
Framework: Next.js 15.1.x # 安定版、Turbopack対応（49秒ビルド）
Language: TypeScript 5.7.2 # 最新安定版
Styling: Tailwind CSS + CSS Modules # shadcn/uiは部分的
Database: PostgreSQL (Supabase)
ORM: Prisma # Drizzleは未成熟

AI/LLM:
Primary: Gemini 1.5 Flash # コスト最優先
Embedding: Gemini text-embedding-004
Vector: pgvector → Pinecone（10万ユーザー後）

状態管理:
Client: Zustand # Reduxは過剰
Server: React Query # SWRより機能豊富
Form: React Hook Form

認証:
Supabase Auth # Auth.jsは複雑

決済:（将来）
Stripe # 一択

🏗️ インフラ（段階的拡張）
Stage 1: MVP（0-1000ユーザー）
月額: ¥0
Hosting: Vercel Hobby
Database: Supabase Free (500MB)
AI: Gemini Free (1500req/min)
Monitor: Vercel Analytics
Stage 2: Growth（1000-10000ユーザー）
月額: ¥8,000
Hosting: Vercel Pro (¥2,500)
Database: Supabase Pro (¥2,500)
AI: Gemini Paid (¥3,000)
Cache: Vercel KV (¥0)
Stage 3: Scale（10000-100000ユーザー）
月額: ¥50,000
Hosting: Vercel Enterprise (¥20,000)
Database: Supabase Team (¥15,000)
Vector: Pinecone (¥7,000)
AI: Gemini + Claude (¥8,000)
📱 マルチプラットフォーム戦略
現実的な展開順序
graph LR
A[1. Web App] -->|1週間| B[2. PWA]
B -->|収益化後| C[3. React Native]
C -->|必要なら| D[4. Desktop]
API設計（最初から考慮）
// app/api/v1/base.ts
// どのクライアントからも使える設計
export async function handler(req: Request) {
const auth = await validateAuth(req)
const data = await processRequest(req)

return NextResponse.json({
success: true,
data,
timestamp: Date.now()
})
}

## 🛠️ 開発ワークフロー

### 標準手順

```bash
# 1. 安定版タグ作成
git tag -a v1.0.0 -m "現在の安定版"
git push origin v1.0.0

# 2. コード変更

# 3. ローカルテスト
pnpm dev
# http://localhost:3000 で動作確認

# 4. デプロイ前チェック
pnpm pre-deploy

# 5. コミット & プッシュ
git add .
git commit -m "feat: 新機能"
git push origin master

# 6. 新タグ作成
git tag -a v1.1.0 -m "新機能追加"
git push origin v1.1.0
```

### 復旧手順

```bash
# 最新の安定版に戻す
git tag -l
git reset --hard v1.0.0
git push origin master --force
```

---

## 🚫 よくある間違い

### 1. ルートパスの誤り

```typescript
// ❌ 間違い - /app は存在しない
window.location.href = '/app'

// ✅ 正しい
window.location.href = '/'
```

### 2. キャッシュ問題

```bash
# ファイル変更後にエラーが出る場合
rm -rf apps/web/.next apps/web/.turbo node_modules/.cache
pnpm dev
```

### 4. 404ソースマップエラー

開発環境で大量の404エラー（`GET /_next/src/helper.ts 404`等）が出る場合:

```
これは無害です - ブラウザのDevToolsがSupabaseライブラリの
ソースマップを要求しているだけで、アプリの動作には影響しません。

本番環境では出ません（next.config.jsで無効化済み）。

完全に消すには: ブラウザのDevTools設定で
「Enable JavaScript source maps」をオフにしてください。
```

### 3. 環境変数

```typescript
// ❌ モジュールレベルで読み込まない
const key = process.env.GEMINI_API_KEY

// ✅ 関数内で読み込む
export async function POST(req) {
  const key = process.env.GEMINI_API_KEY
}
```

---

## 📝 コーディング規約

### ファイル編集

- 新ファイル作成より既存修正を優先
- 相対パスでインポート（`@/` エイリアスは使わない）
- 必ず型を明示（`any` 禁止）

### エラーハンドリング

```typescript
// 全ての非同期処理を try-catch でラップ
try {
  const response = await fetch('/api/chat')
  if (!response.ok) throw new Error('Failed')
} catch (error) {
  console.error('[Component] Error:', error)
  // ユーザーにエラー表示
}
```

---

## 🎨 UI/UX 原則

1. **Gemini風モダンデザイン**
   - 大きな入力エリア、グラデーションボタン
2. **モバイルファースト**
   - タップターゲット 44px以上
3. **アクセシビリティ**
   - aria-label必須、キーボード対応

---

## 🚀 デプロイ

### Vercel環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
NODE_ENV=production
```

詳細は [DEPLOY.md](./DEPLOY.md) 参照。

---

## 💡 ベストプラクティス

### コミットメッセージ

```bash
# ✅ 良い
feat: Gemini風UIに改善
fix: ログイン後404エラー修正

# ❌ 悪い
update
fix bug
```

---

**このガイドを守れば、一貫性のある高品質なコードが書けます。**
