＃サービス名
Faro

由来：faroとはスペイン語で灯台を意味する言葉である。灯台は船が荒波を安全に航海できるよう周りを明るく照らす。Faroは、より多くの人々にとって、人生の金融航海における灯台のような存在でありたい。


＃ミッション
"Increase humanity's financial wellbeing" （人類の金融ウェルビーイングを向上させる）


＃ビジョン
"Your lifelong financial thinking partner" （一生涯の金融思考パートナー）


＃バリュー
1. Context is everything
2. Intelligence, not automation
3. Accessible excellence
4. Privacy first

＊補足
Context is everything （コンテキストがすべて）
パーソナライゼーションを最優先

Intelligence, not automation （効率化ではなく思考拡張）
従来の金融アプリとの差別化

Accessible excellence （卓越性を万人に）
専門家レベルの金融アドバイスを民主化

Privacy first （プライバシーは基本）
金融データを扱う上での絶対条件


＃サービス内容
専門家から受けるようなアドバイスや金融知識をfaroとの対話を通して受けることができる。
従来の家計簿アプリなどをはじめとする金融アプリの機能をすべて1つのアプリ上に搭載することで、ユーザーのコンテキストを理解したうえでパーソナルAIであるfaroがユーザーの質問に答えたり、能動的にユーザーにアドバイスを行う。


＃技術スタック

フロントエンド（マルチプラットフォーム）
  Next.js 15 (App Router) - Webアプリケーション
  React 19
  Tailwind CSS + shadcn/ui
  Zustand（状態管理）
  TypeScript 5

バックエンド
  Next.js API Routes
  Supabase (PostgreSQL + Auth)
  pgvector（ベクトル検索）

AI
  Gemini 2.0 Flash（チャット）
  Gemini Embeddings (text-embedding-004)

インフラ
  モノレポ: Turborepo + pnpm
  Clean Architecture + DDD
  デプロイ: Vercel + Supabase Cloud


＃プロジェクト構造

faro/
├── apps/
│   ├── web/                    Next.js 15 Webアプリ
│   │   ├── app/                App Router
│   │   │   ├── api/            バックエンドAPIルート
│   │   │   ├── (app)/          保護されたページ（認証必須）
│   │   │   ├── (auth)/         ログイン/サインアップ
│   │   │   ├── (legal)/        利用規約、プライバシーポリシー
│   │   │   └── (marketing)/    ランディングページ
│   │   ├── components/         UIコンポーネント
│   │   ├── lib/                アプリ固有ロジック
│   │   └── types/              型定義
│   │
│   └── mobile/                 React Native（計画中）
│
├── packages/
│   ├── core/                   ビジネスロジック（DDD）
│   │   ├── domain/             エンティティ、値オブジェクト、イベント
│   │   ├── usecases/           ユースケース
│   │   └── interfaces/         リポジトリ/サービスインターフェース
│   │
│   ├── infrastructure/         外部サービス統合
│   │   ├── database/           Supabaseリポジトリ
│   │   ├── ai/                 Gemini統合
│   │   └── vector/             pgvector
│   │
│   ├── ui/                     デザインシステム（Web/Mobile共通）
│   │   └── design-system/      トークン（色、スペーシング、タイポグラフィ）
│   │
│   ├── shared/                 共有ユーティリティ
│   │   ├── utils/              通貨、日付、バリデーション
│   │   ├── types/              共通型定義
│   │   └── constants/          アプリ定数
│   │
│   └── ai-agent/               AIエージェント
│       ├── agents/             FinancialAdvisor、TaxAdvisor
│       ├── prompts/            プロンプトテンプレート
│       └── tools/              エージェントツール
│
├── supabase/
│   └── migrations/             データベーススキーマ
│
├── docs/
│   └── ARCHITECTURE.md         アーキテクチャ概要
│
├── scripts/                    開発スクリプト
├── pnpm-workspace.yaml         モノレポ設定
├── turbo.json                  ビルドパイプライン
└── CLAUDE.md                   このファイル（AI指示書）


＃UI、UXの思想
世界トップレベルのモダンな設計
アクセシビリティを核に据える


＃機能

コア機能
  AIチャット: 自然言語による金融相談（Gemini 2.0）
  ノート: Notion風ドキュメント（AI強化）
  家計簿: AIパワード家計簿管理
  ワークスペース: 統合3パネルワークスペース

ルート構造

パブリックルート
  / - ランディングページ
  /auth/login - ログイン
  /auth/signup - サインアップ
  /terms, /privacy, /refund - 法的ページ

保護されたルート（認証必須）
  /chat - メインチャットインターフェース
  /workspace - 統合ワークスペース
  /faro - シンプルモバイルチャット
  /kakeibo - AI家計簿


＃開発

コマンド
  pnpm dev          全パッケージを開発モードで起動（Turbopack）
  pnpm build        全パッケージをビルド
  pnpm lint         全パッケージをLint
  pnpm type-check   TypeScript型チェック
  pnpm test         全テスト実行
  pnpm clean        ビルド成果物をクリーンアップ

パッケージ依存関係
  apps/web
    ↓ インポート
  @faro/ui, @faro/shared, @faro/ai-agent
    ↓ インポート
  @faro/core
    ↓ インポート
  @faro/infrastructure

依存関係ルール
  @faro/core - 外部依存ゼロ（純粋なビジネスロジック）
  @faro/infrastructure - @faro/coreのみに依存
  Apps/packagesは@faro/*エイリアスからインポート


＃モバイル展開（計画）

Phase 1: Web MVP（現在）
  Next.js 15 Webアプリケーション
  Clean Architectureの基盤
  モノレポセットアップ完了

Phase 2: モバイルローンチ
  apps/mobile/にReact Native / Expo
  packages/core/のビジネスロジックを再利用
  packages/ui/のデザイントークンを共有
  統一されたSupabaseバックエンド

Phase 3: 機能拡張
  銀行連携（Plaid）
  投資ポートフォリオ追跡
  確定申告自動化
  リアルタイム通知


＃環境設定

必須の環境変数

Supabase
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=

Gemini AI
  GEMINI_API_KEY=

オプション
  SENTRY_DSN=
  ENVIRONMENT=development


＃絶対ルール
現時点の設計だけにこだわらず、将来的な拡張性を重視する
妥協せずに常に最高レベルにこだわる
既存の採用してきた技術スタックにこだわらず最適解があればすぐにそちらを採用する
Clean Architecture - ビジネスロジックをインフラから分離
モバイルファースト思考 - 最初からマルチプラットフォームを設計


＃セキュリティ原則
SupabaseのRow-Level Security (RLS)
Supabase Authによる安全な認証
機密データは環境変数で管理
コードベースに認証情報を含めない


＃成功指標
ユーザーの金融ウェルビーイング向上
AIの正確性と関連性
ユーザーエンゲージメントと継続率
プラットフォームの拡張性（Web → モバイル → エコシステム）


＃開発指針

コード品質
  TypeScriptの型安全性を100%活用
  ESLintでコード品質を保証
  Prettierでフォーマット統一

テスト戦略
  単体テスト: Jest
  E2Eテスト: Playwright（将来）
  カバレッジ目標: 80%以上

パフォーマンス
  Next.js 15のTurbopack活用
  画像最適化（next/image）
  コード分割とLazy loading
  バンドルサイズ監視


＃学習リソース

参考アーキテクチャ
  Clean Architecture (Robert C. Martin)
  Domain-Driven Design (Eric Evans)
  Vertical Slice Architecture

技術ドキュメント
  Next.js 15 Documentation: https://nextjs.org/docs
  Supabase Documentation: https://supabase.com/docs
  Gemini API Documentation: https://ai.google.dev/docs
  Turborepo Documentation: https://turbo.build/repo/docs


最終更新: 2025-10-10
バージョン: 2.0（モノレポ + モバイル対応準備完了）
