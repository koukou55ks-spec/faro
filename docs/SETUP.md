# Faro セットアップガイド

## 必須環境

- **Node.js**: 20.0.0以上
- **pnpm**: 9.0.0以上
- **Git**: 最新版

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/faro.git
cd faro
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して必要なAPIキーを設定：

- **Supabase**: Database & Auth
- **Gemini API**: Primary AI provider
- **OpenAI API**: Fallback AI provider (推奨)
- **Upstash Redis**: Rate limiting & Caching (推奨)
- **Axiom**: Structured logging (オプション)

### 4. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## 利用可能なコマンド

### 開発

```bash
pnpm dev          # 開発サーバー起動（Turbopack）
pnpm build        # 本番ビルド
pnpm start        # 本番サーバー起動
```

### テスト

```bash
pnpm test         # 単体テスト実行（Vitest）
pnpm test:watch   # テストウォッチモード
pnpm test:ui      # Vitest UI
pnpm test:e2e     # E2Eテスト実行（Playwright）
pnpm test:e2e:ui  # Playwright UI
pnpm test:ci      # CI用テスト（カバレッジ付き）
```

### コード品質

```bash
pnpm lint         # ESLint実行
pnpm type-check   # TypeScript型チェック
pnpm format       # Prettierでコード整形
pnpm format:check # Prettier整形チェック
pnpm validate     # 型チェック + Lint + テスト一括実行
pnpm security     # 脆弱性スキャン
```

### クリーンアップ

```bash
pnpm clean        # ビルド成果物とnode_modules削除
```

## 外部サービスセットアップ

### 1. Supabase

1. [Supabase](https://supabase.com/)でプロジェクト作成
2. プロジェクトURLとAnon Keyを `.env.local` に設定
3. Database migrationsを実行:
   ```bash
   cd supabase
   supabase db push
   ```

### 2. Upstash Redis (推奨)

1. [Upstash Console](https://console.upstash.com/redis) でRedisデータベース作成
2. REST URLとTokenを `.env.local` に設定
3. レート制限とキャッシュが自動的に有効化

### 3. Axiom (オプション - 構造化ログ)

1. [Axiom](https://app.axiom.co/) でアカウント作成
2. Dataset作成
3. API Tokenを `.env.local` に設定

### 4. AIプロバイダー

#### Gemini API (プライマリ)
1. [Google AI Studio](https://makersuite.google.com/app/apikey) でAPIキー取得
2. `GEMINI_API_KEY` に設定

#### OpenAI API (フォールバック - 推奨)
1. [OpenAI Platform](https://platform.openai.com/api-keys) でAPIキー取得
2. `OPENAI_API_KEY` に設定

#### Claude API (オプション)
1. [Anthropic Console](https://console.anthropic.com/settings/keys) でAPIキー取得
2. `ANTHROPIC_API_KEY` に設定

## CI/CDセットアップ

### GitHub Secrets

以下のシークレットをGitHub Actionsに設定：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SNYK_TOKEN (オプション)
```

### Vercelデプロイ

1. [Vercel](https://vercel.com/)でプロジェクトインポート
2. 環境変数を設定
3. `main`ブランチへのプッシュで自動デプロイ

## トラブルシューティング

### ポート3000が使用中

```bash
# ポート変更
PORT=3001 pnpm dev
```

### pnpmのインストールエラー

```bash
# キャッシュクリア
pnpm store prune
pnpm install
```

### Playwrightブラウザのインストール

```bash
npx playwright install
```

## 次のステップ

- [アーキテクチャ概要](./ARCHITECTURE.md)
- [セキュリティガイド](./SECURITY.md)
- [運用手順書](./RUNBOOK.md)
- [CLAUDE.md](../CLAUDE.md) - AI開発指示書
