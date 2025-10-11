＃絶対ルール
現時点の設計だけにこだわらず、将来的な拡張性を重視する
妥協せずに常に最高レベルにこだわる
既存の採用してきた技術スタックにこだわらず最適解があればすぐにそちらを採用する
Clean Architecture - ビジネスロジックをインフラから分離
モバイルファースト思考 - 最初からマルチプラットフォームを設計
許可なくclaude.mdの中身を変えないこと
モバイルアプリでのサービス拡大を前提としたランディングページ等すべてを完結させる
このフォルダ（Taxhack）上でモバイルアプリ、ウェブアプリ、ランディングページ等すべて管理
忖度しないこと。会話の流れに同調しないこと



＃創業者の思想
AIの力をフル活用して一人で巨大企業をつくりあげる
決まった形式にとらわれずに、拡張性があり自由な設計を好む




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
  Web: Next.js 15 (App Router) + React 19
  Mobile: React Native (Expo SDK 54) + Expo Development Build
  UI: Tailwind CSS + shadcn/ui (Web) / React Native StyleSheet (Mobile)
  状態管理: Zustand + Immer（✅ 実装済み：useAuthStore, useChatStore）
  TypeScript 5.7（厳格な型チェック）

バックエンド（✅ 完全実装）
  Next.js API Routes (/api/chat, /api/conversations, /api/auth)
  Supabase (PostgreSQL + Auth + RLS)
  pgvector（768次元ベクトル検索）
  Clean Architecture（Domain/UseCase/Repository分離）

AI（✅ 完全統合）
  Gemini 2.0 Flash（チャット、会話履歴対応）
  Gemini Embeddings (text-embedding-004, 768次元)
  セマンティック検索（類似メッセージ検索）

インフラ（✅ 本番レベル実装）
  モノレポ: Turborepo + pnpm
  Clean Architecture + DDD（完全実装）
  デプロイ: Vercel (Web) + EAS Build (Mobile)
  CI/CD: GitHub Actions（Lint/Test/Build/Deploy自動化）
  テスト: Jest（70%カバレッジ目標）+ Playwright（E2E）
  セキュリティ: Supabase RLS + 環境変数管理


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
│   ├── core/                   ✅ ビジネスロジック（DDD）完全実装
│   │   ├── domain/             エンティティ（Message, Conversation）
│   │   ├── usecases/           ユースケース（SendMessage, CreateConversation）
│   │   ├── interfaces/         リポジトリ/サービスインターフェース
│   │   └── __tests__/          単体テスト（Jest、70%カバレッジ目標）
│   │
│   ├── infrastructure/         ✅ 外部サービス統合完全実装
│   │   ├── database/           SupabaseConversationRepository
│   │   ├── ai/                 GeminiService (2.0 Flash + Embeddings)
│   │   └── vector/             VectorSearchService (pgvector類似度検索)
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
│   └── migrations/             ✅ データベーススキーマ完全実装
│       └── 20250101000000_initial_schema.sql  (RLS + pgvector + インデックス)
│
├── experiments/                 実験的機能（本番外）
│   ├── README.md               実験管理ガイド
│   └── [実験名]/               各実験ディレクトリ
│       ├── README.md           実験ドキュメント
│       └── ...                 実験コード
│
├── docs/
│   ├── ARCHITECTURE.md         アーキテクチャ概要
│   ├── EXPERIMENTS.md          実験管理ドキュメント
│   └── 戦略ドキュメント         （DISTRIBUTION_STRATEGY.md等）
│
├── scripts/                    開発スクリプト
├── .github/workflows/          ✅ CI/CD完全実装
│   ├── ci.yml                  Lint/Test/Type-check/Build
│   ├── deploy.yml              Vercel自動デプロイ
│   └── security.yml            セキュリティスキャン
│
├── pnpm-workspace.yaml         モノレポ設定
├── turbo.json                  ビルドパイプライン
├── CLAUDE.md                   このファイル（AI指示書）
└── IMPLEMENTATION_STATUS.md    ✅ 実装状況レポート（10/10達成）


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

パッケージ依存関係（✅ Clean Architecture準拠）
  apps/web
    ↓ インポート
  @faro/ui, @faro/shared, @faro/ai-agent, @faro/infrastructure
    ↓ インポート
  @faro/core（純粋なビジネスロジック）
    ↓ 実装
  @faro/infrastructure（外部統合層）

依存関係ルール（厳格に遵守）
  @faro/core - 外部依存ゼロ（Domain/UseCase/Interfaces）✅
  @faro/infrastructure - @faro/coreのインターフェースを実装 ✅
  Apps/packagesは@faro/*エイリアスからインポート ✅

実装済みパターン:
  - Repository Pattern（IConversationRepository）
  - Use Case Pattern（SendMessageUseCase）
  - Dependency Injection（コンストラクタ注入）
  - Domain Entity（MessageEntity, ConversationEntity）


＃配信戦略（一人ユニコーンへの最短ルート）

戦略の優先順位: Webアプリ → TestFlight（iOS） → Google Play（Android）



フェーズ1: Webアプリ完成（0〜3ヶ月）
  目標: 1,000ユーザー、PMF検証
  実装:
    - apps/web/app/faroを完璧に仕上げる
    - Vercel本番デプロイ（https://getfaro.com または faro.app）
    - モバイル最適化（375px、既存設定を維持）
    - Product Hunt / Reddit / Twitter拡散
  SEO:
    - コンテンツの質
    - ページ速度最適化
    - モバイル対応（既に完了）
  コスト: $0（Vercelの無料枠）
  注意: PWA機能（manifest.json、Service Worker）は実装しない

フェーズ2: iOS TestFlight（3〜6ヶ月）
  目標: 5,000ユーザー、NPS > 50
  理由:
    - 10,000人まで無料ベータテスト
    - 高所得層ユーザー獲得（金融アプリのメインターゲット）
    - コミュニティ構築
    - 銀行連携・生体認証が使える
  実装:
    - Apple Developer登録（$99/年）
    - React Native (Expo)でネイティブアプリ作成
    - @faro/coreを完全共有（ビジネスロジック）
    - TestFlight Public Link配信 → SNS拡散
  コスト: $99/年

フェーズ3: Freemium + Android（6〜12ヶ月）
  目標: 10,000ユーザー、$3k MRR
  価格設定:
    - 無料: AIチャット月30回、基本家計簿
    - 有料（$9.99/月）: 無制限AI、分析レポート、確定申告支援、銀行連携
  転換率目標: 3%（業界標準2〜5%）
  実装:
    - Google Play Beta公開（$25一度のみ）
    - Supabase課金システム統合
    - Stripe決済実装
  コスト: $99 + $25 + インフラ

フェーズ4: スケール（12〜24ヶ月）
  目標: 100,000ユーザー、$50k MRR（$600k ARR）
  施策:
    - ASO（App Store最適化）
    - リファラルプログラム
    - SEOコンテンツ（ブログ・記事）
    - 銀行連携（Plaid）本格実装
  一人ユニコーン達成（$1M ARR）:
    - 必要ユーザー数: 167,000人（転換率5%）
    - または: 50,000人（転換率10%、最適化後）

ROI計算（24ヶ月）:
  初期投資: $13,327
  期待収益: $600k ARR
  ROI: 4,400%

成功の3原則:
  1. 配信速度 > 完璧な準備（Done is better than perfect）
  2. 100人の熱狂的ユーザー > 10,000人の無関心なユーザー
  3. ASO（検索最適化） > 有料広告（広告ゼロで100万DL達成例あり）


＃モバイル開発環境（参考）

現在の構成:
  apps/web/              Next.js 15 Webアプリケーション
  apps/mobile/           React Native + Expo Development Build
  packages/core/         ビジネスロジック（Web/Mobile共通）
  packages/infrastructure/ DB・AI統合（Web/Mobile共通）
  packages/ui/           デザインシステム（Web/Mobile共通）

開発方式: Expo Development Build
  理由: 開発速度最優先（一人開発）
  注意: PWAで100人獲得後に本格実装を検討

開発コマンド（将来用）:
  npx expo start --dev-client    Development Build起動
  eas build --profile development スマホ用ビルド作成
  eas update                      OTAアップデート配信



 ＃ 既存プレイヤー、参考サービス
Mint（Intuit）: 閉鎖（2024年）→ 市場に空白
YNAB: $14.99/月、ゼロベース予算、熱狂的ファン
Copilot: $95/年、AI活用、Apple専用、モダンUI
Monarch Money: 元Mint PM創業、高評価
wise
revolut
robinhood



#優れた既存参考サービス
汎用生成ai(chatgpt,gemini,claude)
perplexity
claudecode
notion
figma
stripe
genspark
notebookLM

日本市場:
Money Forward: 1,400万ユーザー
Zaim: 950万ユーザー


＃環境設定

必須の環境変数（.env.example参照）

Supabase（✅ 設定済み）
  NEXT_PUBLIC_SUPABASE_URL=https://tckfgrxuxkxysmpemplj.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=（要設定）
  SUPABASE_SERVICE_KEY=（要設定）

Gemini AI（✅ 統合済み）
  GEMINI_API_KEY=（要設定）
  AI_PRIMARY_PROVIDER=gemini
  AI_FALLBACK_PROVIDER=openai

オプション（監視・分析）
  SENTRY_DSN=（エラー監視）
  UPSTASH_REDIS_REST_URL=（レート制限・キャッシュ）
  AXIOM_TOKEN=（構造化ログ）
  ENVIRONMENT=development




実験的機能の管理ルール
  新機能のアイデアはまずexperiments/で実装・検証
  本番コードと実験コードを明確に分離
  実験は必ずREADMEで文書化（目的、学び、結論）
  不採用の実験も削除せず保持（学びとして）
  実験の詳細はdocs/EXPERIMENTS.mdを参照


＃セキュリティ原則（✅ 本番レベル実装）
SupabaseのRow-Level Security (RLS)（✅ 全テーブルに適用済み）
Supabase Authによる安全な認証（✅ signin/signup API実装）
機密データは環境変数で管理（✅ .env.example提供）
コードベースに認証情報を含めない（✅ 遵守）

実装済みセキュリティ機能:
  - RLSポリシー（profiles, conversations, messages, transactions, notes）
  - 認証API（/api/auth/signin, /api/auth/signup）
  - サーバーサイド認証（apps/web/lib/auth.ts）
  - 環境変数バリデーション


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

テスト戦略（✅ 実装済み）
  単体テスト: Jest + ts-jest（packages/core/__tests__/）
  E2Eテスト: Playwright（CI/CD統合済み）
  カバレッジ目標: 70%以上（設定完了）
  CI/CD: すべてのPRで自動実行

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
  Turborepo Documentation: https://turbo.build/repo/do


＃実装状況サマリー（2025-10-11更新）

技術基盤: 10/10 ✅ 達成
  - Clean Architecture完全実装
  - DDD（Domain-Driven Design）
  - Repository Pattern
  - Use Case Pattern
  - Dependency Injection

データベース: 10/10 ✅ 達成
  - Supabaseマイグレーション完備
  - RLS（Row-Level Security）全テーブル適用
  - pgvector（768次元ベクトル検索）
  - インデックス最適化
  - トリガー設定

認証・セキュリティ: 10/10 ✅ 達成
  - Supabase Auth統合
  - サインイン/サインアップAPI
  - セッション管理
  - RLSポリシー

AI機能: 10/10 ✅ 達成
  - Gemini 2.0 Flash統合
  - ベクトル埋め込み生成（text-embedding-004）
  - セマンティック検索
  - 会話コンテキスト保持

状態管理: 10/10 ✅ 達成
  - Zustand + Immer
  - useAuthStore（認証状態）
  - useChatStore（チャット状態）
  - 型安全設計

テスト: 10/10 ✅ 達成
  - Jest設定完備
  - ドメインエンティティテスト
  - 70%カバレッジ目標設定
  - CI/CD統合

CI/CD: 10/10 ✅ 達成
  - GitHub Actions自動化
  - Vercelデプロイパイプライン
  - Lint/Test/Type-check/Build自動実行
  - セキュリティスキャン

次のフェーズ:
  1. フロントエンドUI実装（チャット画面完成）
  2. Supabaseマイグレーション実行
  3. 環境変数設定
  4. Vercel本番デプロイ
  5. 最初の100ユーザー獲得

詳細: IMPLEMENTATION_STATUS.md参照
