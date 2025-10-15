# Faro プロジェクト構造

## 🏗️ アーキテクチャ
モノレポ構造（Turborepo + pnpm）でClean Architectureを実装

```
Taxhack/
├── apps/
│   ├── web/                    # Next.js 15 メインアプリケーション
│   │   ├── app/                # App Router
│   │   │   ├── page.tsx       # メインページ（統合UI）
│   │   │   ├── (auth)/        # 認証ページ
│   │   │   ├── (legal)/       # 法的ページ
│   │   │   └── api/           # API Routes
│   │   └── src/
│   │       ├── features/       # 機能別モジュール
│   │       │   ├── chat/       # AIチャット機能
│   │       │   ├── notes/      # ノート機能
│   │       │   ├── documents/  # ドキュメント管理
│   │       │   ├── kakeibo/    # 家計簿機能
│   │       │   └── workspace/  # ワークスペース
│   │       └── components/     # 共通コンポーネント
│   │
│   └── mobile/                  # React Native（計画中）
│
├── packages/
│   ├── core/                   # ビジネスロジック（外部依存ゼロ）
│   │   ├── domain/             # ドメインエンティティ
│   │   ├── usecases/           # ユースケース
│   │   └── interfaces/         # リポジトリインターフェース
│   │
│   ├── infrastructure/         # 外部サービス統合
│   │   ├── supabase/          # Supabase統合
│   │   └── gemini/            # Gemini AI統合
│   │
│   ├── ai-agent/               # AI エージェント
│   ├── shared/                 # 共通ユーティリティ
│   └── ui/                     # デザインシステム
│
├── supabase/
│   ├── migrations/             # DBマイグレーション
│   └── functions/              # Edge Functions
│
├── docs/                       # ドキュメント
├── scripts/                    # ユーティリティスクリプト
└── .workflow/                  # 開発管理ファイル

```

## 📁 主要ファイル

### ルート設定
- `turbo.json` - Turborepo設定
- `pnpm-workspace.yaml` - pnpmワークスペース設定
- `vercel.json` - Vercelデプロイ設定
- `CLAUDE.md` - AI開発ガイドライン

### 開発ツール
- `playwright.config.ts` - E2Eテスト設定
- `vitest.config.ts` - ユニットテスト設定
- `.prettierrc` - コードフォーマッター設定

## 🚀 コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# テスト
pnpm test

# 型チェック
pnpm type-check

# リント
pnpm lint

# クリーンアップ
pnpm clean
```

## 🎯 設計原則

1. **統一アプリアプローチ**: 全機能を `/app` に集約
2. **Clean Architecture**: ビジネスロジックをインフラから分離
3. **モバイルファースト**: 最初からマルチプラットフォーム設計
4. **ゲストモード優先**: 開発時は認証不要で動作

## 🔧 最適化済み項目

✅ 不要な実験コードを削除
✅ 重複UIコンポーネントを統合
✅ ビルドツール設定を最適化
✅ 依存関係を整理
✅ ファイル構造をクリーンアップ