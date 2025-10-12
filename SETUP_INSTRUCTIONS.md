# Faro セットアップ手順
# Setup Instructions

**最終更新**: 2025-10-12

---

## 🚀 クイックスタート

### 前提条件
- [x] Node.js 18以上
- [x] pnpm（`npm install -g pnpm`）
- [ ] Supabase CLI

---

## 1. Supabase CLI インストール

### Windows（推奨: Scoop）

```powershell
# Scoopをインストール（まだの場合）
iwr -useb get.scoop.sh | iex

# Supabase CLIをインストール
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Windows（代替: npm）

```bash
npm install -g supabase
```

### macOS

```bash
brew install supabase/tap/supabase
```

### Linux

```bash
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

### インストール確認

```bash
supabase --version
# 期待出力: supabase 1.200.3 または最新版
```

---

## 2. 環境変数設定

### 既存の .env.local を確認

すでに `.env.local` が存在し、必須項目が設定されています：

```bash
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_KEY
✅ GEMINI_API_KEY
```

追加で設定したい場合は `.env.local.example` を参照してください。

---

## 3. データベースマイグレーション実行

### Windows

```powershell
# PowerShellスクリプト実行
.\scripts\setup-database.ps1
```

### macOS/Linux

```bash
# 実行権限付与
chmod +x scripts/setup-database.sh

# スクリプト実行
./scripts/setup-database.sh
```

### 期待される出力

```
🚀 Faro Database Setup Script
======================================
[1/5] Checking Supabase CLI...
✅ Supabase CLI found (v1.200.3)

[2/5] Checking environment variables...
✅ .env.local loaded

[3/5] Linking Supabase project...
✅ Project linked

[4/5] Running database migrations...
   Found 4 migration files
✅ Migrations applied successfully

[5/5] Verifying pgvector extension...
✅ pgvector extension enabled

======================================
✅ Database Setup Complete!
======================================
```

### マイグレーション手動実行（スクリプトが使えない場合）

```bash
# 1. Supabaseプロジェクトにリンク
supabase link --project-ref tckfgrxuxkxysmpemplj

# 2. マイグレーション実行
supabase db push

# 3. pgvector有効化確認
supabase db execute --sql "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

---

## 4. 依存パッケージインストール

```bash
# ルートディレクトリで実行
pnpm install
```

---

## 5. 開発サーバー起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開く

---

## 6. ビルド確認

```bash
# 型チェック
pnpm type-check

# Lint
pnpm lint

# ビルド
pnpm build
```

すべてエラーなく完了すればOK。

---

## 7. テスト実行（オプション）

```bash
# 単体テスト
pnpm test

# カバレッジ確認
pnpm test:coverage
```

---

## 8. Vercelデプロイ（本番環境）

### 初回デプロイ

```bash
# Vercel CLIインストール（まだの場合）
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel --prod
```

### 環境変数設定（Vercel Dashboard）

1. https://vercel.com/dashboard にアクセス
2. プロジェクト → Settings → Environment Variables
3. 以下を設定：

**必須項目**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`

**推奨項目（本番環境）**:
- `SENTRY_DSN`
- `AXIOM_TOKEN`
- `UPSTASH_REDIS_REST_URL`

---

## トラブルシューティング

### Supabase CLI が見つからない

```bash
# パス確認
where supabase  # Windows
which supabase  # macOS/Linux

# 再インストール
scoop uninstall supabase
scoop install supabase
```

### マイグレーション失敗

```bash
# エラー内容確認
supabase db push --debug

# Supabase接続確認
curl https://tckfgrxuxkxysmpemplj.supabase.co/rest/v1/

# 環境変数確認
echo $SUPABASE_SERVICE_KEY  # macOS/Linux
echo %SUPABASE_SERVICE_KEY%  # Windows cmd
$env:SUPABASE_SERVICE_KEY   # Windows PowerShell
```

### ビルドエラー

```bash
# キャッシュクリア
pnpm clean
rm -rf node_modules
pnpm install

# 再ビルド
pnpm build
```

---

## 次のステップ

1. [DEPLOY_CHECKLIST.md](./docs/DEPLOY_CHECKLIST.md) に従って本番デプロイ
2. [MOBILE_ROADMAP.md](./docs/MOBILE_ROADMAP.md) でモバイル開発開始
3. [SCALING_STRATEGY.md](./docs/SCALING_STRATEGY.md) でスケール対応計画確認

---

## サポート

問題が発生した場合:
- GitHub Issues: https://github.com/[your-repo]/issues
- ドキュメント: [docs/](./docs/)
- CLAUDE.md: プロジェクト全体の設計思想

---

**セットアップ完了！開発を始めましょう！** 🎉
