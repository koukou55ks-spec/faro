# 🗑️ クリーンアップ計画

## 削除すべきファイル・フォルダ

### 1. FastAPIバックエンド（全削除）❌

```
app/
├── __init__.py
├── production_main.py          # FastAPIメインファイル
├── enhanced_chatbot.py         # 旧チャットボット
├── rag_system_gemini.py        # 旧RAGシステム
├── rag_system_v2.py
├── conversation_manager.py
├── conversation_prompts.py
├── notes_manager.py
├── data_flywheel.py
├── auth.py
├── monitoring.py
├── cost_optimized_apis.py
└── news_and_scraper.py
```

**理由**: Next.js API Routeで代替完了

---

### 2. 旧HTML UI（削除推奨）❌

```
static/
├── workspace.html             # → Next.js版に移行済み
├── cfo_app.html              # → 重複
├── notes_app.html            # → Next.js版に移行済み
├── expert_mode_demo.html     # → デモページ（不要）
├── auth.html                 # → Supabase Authに移行済み
├── dashboard.html            # → 未使用
└── admin_dashboard.html      # → 未使用
```

**保持するもの**:
- `index.html` - ランディングページ（Stripe設定時に必要）

---

### 3. ローカルデータベース（削除推奨）❌

```
chroma_db/                     # ChromaDB → pgvectorに移行済み
user_notes.db                  # SQLite → PostgreSQLに移行済み
unloq.log                      # 古いログファイル
```

---

### 4. 旧Python依存関係

```
requirements.txt               # Pythonバックエンド不要
start.py                      # FastAPI起動スクリプト不要
```

---

### 5. その他不要ファイル

```
frontend/app/chat/page.tsx     # エラーあり、workspace使用
BANK_API_RESEARCH.md          # リサーチ完了、保管は任意
DEPLOYMENT_GUIDE.md           # DEPLOY_NOW.mdに統合済み
```

---

## 保持すべきファイル ✅

### フロントエンド
```
frontend/
├── app/
│   ├── workspace/page.tsx    ✅ メインアプリ
│   ├── api/                  ✅ Next.js API Routes
│   ├── terms/page.tsx        ✅ 利用規約（Stripe必須）
│   ├── privacy/page.tsx      ✅ プライバシーポリシー
│   └── refund/page.tsx       ✅ 返金ポリシー
├── components/workspace/     ✅
├── lib/                      ✅
└── package.json             ✅
```

### データベース
```
supabase/
└── migrations/
    └── 001_initial_schema.sql ✅
```

### ドキュメント
```
CLAUDE.md                     ✅ プロジェクト指示
MIGRATION_COMPLETE.md         ✅ 技術仕様
DEPLOY_NOW.md                 ✅ デプロイガイド
IMPLEMENTATION_SUMMARY.md     ✅ 実装サマリー
README.md                     ✅ (要更新)
```

### その他
```
static/index.html             ✅ ランディングページ
.env.local                    ✅ 環境変数
.gitignore                    ✅
```

---

## クリーンアップ実行コマンド

```bash
# 1. FastAPIバックエンド削除
rm -rf app/

# 2. 旧HTML UI削除（index.html以外）
rm static/workspace.html
rm static/cfo_app.html
rm static/notes_app.html
rm static/expert_mode_demo.html
rm static/auth.html
rm static/dashboard.html
rm static/admin_dashboard.html

# 3. ローカルDB削除
rm -rf chroma_db/
rm user_notes.db
rm unloq.log

# 4. 旧Python依存削除
rm requirements.txt
rm start.py

# 5. 旧フロントエンドページ削除
rm -rf frontend/app/chat/

# 6. 旧ドキュメント削除（任意）
rm BANK_API_RESEARCH.md
rm DEPLOYMENT_GUIDE.md
```

---

## クリーンアップ後のフォルダ構成

```
Taxhack/
├── frontend/                  # Next.jsアプリケーション
│   ├── app/
│   │   ├── workspace/        # メインアプリ
│   │   ├── api/              # API Routes
│   │   ├── terms/            # 利用規約
│   │   ├── privacy/          # プライバシーポリシー
│   │   └── refund/           # 返金ポリシー
│   ├── components/           # Reactコンポーネント
│   ├── lib/                  # ユーティリティ
│   └── package.json
├── supabase/                 # データベース
│   └── migrations/
├── static/
│   └── index.html            # ランディングページのみ
├── CLAUDE.md                 # プロジェクト指示
├── MIGRATION_COMPLETE.md     # 技術仕様
├── DEPLOY_NOW.md             # デプロイガイド
├── IMPLEMENTATION_SUMMARY.md # 実装サマリー
└── README.md                 # プロジェクト概要
```

---

## 削除の影響

### ✅ 問題なし
- FastAPI削除 → Next.js API Routeで代替済み
- 旧HTML削除 → Next.js版で代替済み
- ChromaDB削除 → Supabase pgvectorで代替済み

### ⚠️ 注意
- `static/index.html` は削除しない（ランディングページ、Stripe設定で必要）
- `.env.local` は削除しない（環境変数）

### 📦 バックアップ推奨（任意）
削除前にバックアップフォルダ作成:

```bash
mkdir archive
mv app/ archive/
mv static/workspace.html archive/
mv chroma_db/ archive/
```

---

## クリーンアップ後のメリット

1. **シンプル化**: 不要なファイル削除 → プロジェクト見通し改善
2. **混乱防止**: workspace.html（旧）vs workspace/page.tsx（新）の混同なし
3. **ディスク節約**: ChromaDBなど不要なデータ削除
4. **デプロイ高速化**: 不要ファイルがデプロイされない

---

## 実行確認

クリーンアップ後、以下を確認:

```bash
# Next.js起動
cd frontend
npm run dev

# 動作確認
http://localhost:3000/workspace
```

すべて動作すれば、クリーンアップ成功！
