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
claude.mdファイルを更新する際は、周りの形式に合わせること、実装の報告ではなく、普遍的なことに絞ること。


＃実装前の強制チェックリスト（新機能・新API実装時は必ず実行）
以下を全て確認してからコードを書き始めること。1つでもスキップしたら実装を中止すること。

□ 1. 既存の類似実装を確認（例：新しいAPI → /api/chat, /api/documents/upload を読む）
□ 2. CLAUDE.mdの該当セクションを確認
    - 新しいAPI実装 → 「開発モード時の認証スキップ」セクションを読む
    - 新しいUI → 「UI、UXの思想」セクションを読む
    - エラー処理 → 「エラー対応の絶対原則」セクションを読む
□ 3. 既存パターンを踏襲（車輪の再発明をしない）
□ 4. 不明点があれば必ず質問（推測で実装しない）
□ 5. 変更前に必ずローカルでテスト（pnpm dev → 動作確認 → コミット）
□ 6. git コミット前の必須確認
    - ビルドエラーがないか（pnpm build）
    - TypeScript型エラーがないか（pnpm type-check）
    - 変更したページがブラウザで正常に表示されるか

このチェックリストを無視して実装した場合、CLAUDE.mdの意味がなくなる。
AIは毎回ゼロからスタートするため、「気をつけます」という意識では不十分。
構造的にルールを守る仕組みが必要。

＃バージョン管理の絶対原則（最重要）
**問題**: 安定版を失ってしまう、デプロイ後に動かないコードになる

**解決策**: タグベースのバージョン管理を徹底

1. **安定版には必ずタグを付ける**
   ```bash
   # 本番デプロイ成功後、必ず実行
   git tag -a v1.0.0 -m "安定版: Gemini風UI完成"
   git push origin v1.0.0
   ```

2. **新機能開発前の必須手順**
   ```bash
   # 現在の安定版を確認
   git tag -l

   # 新機能用ブランチを作成（masterから直接変更しない）
   git checkout -b feature/new-chat-ui
   ```

3. **問題が起きた時の復旧手順**
   ```bash
   # 最新の安定版タグを確認
   git tag -l

   # 安定版に戻す
   git checkout v1.0.0
   git checkout -b fix/rollback-to-stable
   git push origin fix/rollback-to-stable --force
   ```

4. **デプロイ前の必須チェック**
   - [ ] ローカルで `pnpm build` が成功する
   - [ ] ローカルで `pnpm dev` → ブラウザで全機能が動作する
   - [ ] TypeScript型エラーがない（`pnpm type-check`）
   - [ ] 404エラーが出ていない（開発サーバーログを確認）
   - [ ] 上記すべてクリアしたらタグを作成してデプロイ

5. **タグ命名規則**
   - `v1.0.0` - メジャーバージョン（大きな機能追加）
   - `v1.1.0` - マイナーバージョン（小さな機能追加）
   - `v1.1.1` - パッチバージョン（バグ修正）
   - `stable-YYYY-MM-DD` - 日付ベースの安定版

6. **緊急時のセーフティネット**
   ```bash
   # masterを壊してしまった場合
   git reflog  # 履歴を確認
   git reset --hard HEAD@{3}  # 3つ前の状態に戻す

   # または最新の安定版タグから復旧
   git reset --hard v1.0.0
   git push origin master --force
   ```

7. **禁止事項（絶対厳守）**
   - ❌ masterブランチで直接実験的な変更をしない
   - ❌ 動作確認なしでコミット・プッシュしない
   - ❌ 安定版にタグを付けずにデプロイしない
   - ❌ 複数の機能を1つのコミットに含めない

＃ワークフローファイル構造（重要）
.workflow/ディレクトリにすべてのワークフロー管理ファイルを集約

  WORKFLOW.md: メタ管理（全ワークフローの一覧・目的・効果）
  STATUS.md: 現状スナップショット（AI自動生成）
  NEXT.md: 次のタスクTop 3（AI自動管理）
  SESSION_LOG.md: セッション記録（詳細履歴）
  DECISIONS.md: 技術的決定ログ（重要決定のみ）
  DEBT.md: 技術的負債追跡（TODO/FIXME/HACK）
  README.md: 各ファイルの役割説明

詳細は .workflow/README.md を参照



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

＃Faroの本質的価値（最重要）
Context is everything - すべてのデータをAIが理解
  Faroの差別化要因:
    - ノート、家計簿、取引履歴、会話履歴すべてをAIが把握
    - ユーザーの金融プロファイルを完全理解した上でアドバイス
    - 単なるチャットボットではなく、真のパーソナルCFO

  技術的実現方法:
    - すべてのユーザーデータをベクトル化（Gemini Embeddings）
    - セマンティック検索で関連情報を自動取得
    - 統合コンテキストをAIに渡してパーソナライズ回答生成


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
  モニタリング: Sentry（エラー追跡）+ Axiom（ログ・パフォーマンス）


＃プロジェクト構造
apps/web: Next.js 15 + App Router
apps/mobile: React Native + Expo（計画中）
packages/core: ビジネスロジック（Clean Architecture、外部依存ゼロ）
packages/infrastructure: Supabase/Gemini統合
packages/ui: デザインシステム（Web/Mobile共通）
supabase/migrations: DBスキーマ（RLS + pgvector）


＃UI、UXの思想
世界トップレベルのモダンな設計
アクセシビリティを核に据えるい
新機能や新しいデザインの導入時には、pc,モバイルの両方に対応するuiにすること







＃機能

コア機能
  AIチャット: 自然言語による金融相談（Gemini 2.0）
  ノート: Notion風ドキュメント（AI強化）
  家計簿: AIパワード家計簿管理
  ワークスペース: 統合3パネルワークスペース

ルート構造（✅ 統一アプリ設計）

パブリックルート
  / - ランディングページ
  /auth/login - ログイン
  /auth/signup - サインアップ
  /terms, /privacy, /refund - 法的ページ

保護されたルート（認証必須）
  /app - メインアプリ（統合UI）
    ├─ チャット機能（デフォルト表示）
    ├─ サイドバー（新規チャット、履歴、ノート、家計簿）
    ├─ ダーク/ライトモード切り替え
    └─ リアルタイム時刻表示

  ※ 他のURL（/chat、/faro、/workspace等）は廃止
  ※ 全機能を /app に統合（Notion、Linear方式）


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


＃開発ワークフロー（最重要）

ワークフロー管理の原則
  ワークフローは常に進化する:
    - 現在のベストが将来のベストではない
    - 新しいワークフローは必ずWORKFLOW.mdに言語化
    - 月1回レビュー、不要なものは廃止
    - すべてのワークフローに「廃止条件」を設定

  WORKFLOW.mdの役割:
    - 現在採用しているワークフロー一覧
    - 各ワークフローの目的・フロー・効果を記録
    - 進化履歴を追跡
    - 廃止済みワークフローも記録（学びとして）

  更新タイミング:
    - 新規ワークフロー追加時: 即座にWORKFLOW.mdに記録
    - 既存改善時: 該当セクションを更新
    - 廃止時: 「廃止済み」セクションに移動

自動ステータス管理（AI完全自動化）
  セッション開始時の必須アクション:
    1. SESSION_LOG.mdの最新エントリを読む（前回の続きを把握）
    2. STATUS.md自動生成（git log + git status + サーバー状態 + NEXT.mdを統合）
    3. ユーザーに前回の続きを確認

  セッション終了時の必須アクション:
    1. SESSION_LOG.mdに今日のセッションを記録
       - Goal（何を達成しようとしたか）
       - What happened（実際に何が起きたか）
       - Decisions made（技術的決定）
       - Blockers（妨げになったこと）
       - Time breakdown（時間配分）
       - Next session（次回やること）
       - Learnings（学び：✅成功、❌失敗）
       - Code changes（変更ファイル）
    2. 未完了タスクをNEXT.mdに保存
    3. STATUS.md更新
    4. 全てコミット

  ルール: AIが全て自動管理、ユーザーは実装に集中

質問駆動開発（QDD: Question-Driven Development）
  実装前の必須確認フロー:
    1. ユーザーからタスクを受け取る
    2. 不明点・曖昧な点をリストアップ
    3. 具体的な質問を作成（5W1H）
    4. ユーザーに質問して回答を得る
    5. 全回答を確認してから実装開始
    6. 実装中に新たな不明点が出たら即座に質問

  質問の例:
    - このデータはどこに保存する？（DB/localStorage/メモリ）
    - ゲストユーザーも使える？（Y/N）
    - エラー時のUXは？（アラート/トースト/インライン）
    - モバイルでも動く必要がある？（Y/N）
    - 既存の機能との関係は？（独立/統合/置き換え）

  禁止事項（絶対厳守）:
    - 推測で実装（「たぶんこうだろう」は禁止）
    - ユーザーの承認なしで実装開始
    - 質問をスキップ
    - 曖昧な要件のまま進める

URL設計原則
  統一アプリアプローチ: 全機能を /app に集約
  理由:
    - 一人開発に最適（1つのファイルを完璧に磨く）
    - 世界トップアプリの標準（Notion、Linear、Figma）
    - ページ遷移なし、サクサク動く
    - 保守性が高い（バグ修正も機能追加も1箇所）

  現在のURL構造:
    / → ランディングページ
    /app → メインアプリ（チャット、家計簿、ノート統合）
    /auth/* → 認証ページ

  禁止事項:
    - 新しいページを無闇に作らない
    - URLを増やさない（/chat、/v2/chat など）
    - 既存の /app を修正・拡張する

開発の黄金ルール
  1. 80%ルール: 80%の完成度で次へ進む（完璧主義を避ける）
  2. 既存ファイル優先: 新規作成より既存ページを改善
  3. 速度重視: PMF達成が最優先、細部は後で磨く
  4. 1つずつ完璧に: 複数の機能を中途半端に作らない

開発モード時の認証スキップ（開発効率化）
  原則: 開発環境では認証を必須としない
  理由:
    - 毎回ログインする手間を省き、開発速度を最大化
    - 機能テストに集中できる
    - 一人開発では認証フローのテストは後回しでOK

  実装方針（最優先: ゲストモード + localStorage）:
    - **新機能実装時は必ずゲストモード優先で実装**
    - データベース不要、即座にテスト可能
    - localStorage + Zustand + persist middleware で永続化
    - 認証後も同じUIで動作するように設計
    - マイグレーションやDB設定を待たずに機能開発できる
    - 開発環境（NODE_ENV=development）で認証をスキップ
    - 本番環境では厳格な認証を維持
    - モックユーザーを使用してSupabase操作を可能にする

  実装パターン（API Routes）:
    ```typescript
    const isDevelopment = process.env.NODE_ENV === 'development'
    let user: any = null

    if (!isDevelopment) {
      // Production: strict auth required
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const { data: { user: authUser } } = await supabase.auth.getUser(token)
      if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      user = authUser
    } else {
      // Development: allow guest with mock user
      if (token) {
        const { data: { user: authUser } } = await supabase.auth.getUser(token)
        user = authUser
      }
      if (!user) {
        user = { id: 'dev-guest-user', email: 'guest@localhost' }
      }
    }
    ```

  動的インポートの活用:
    - pdf-parse, mammothなどのNode.js専用パッケージは動的インポート
    - 理由: モジュール初期化時のファイルシステムエラーを回避
    - パターン: `const pdfParse = (await import('pdf-parse')).default`

  適用機能:
    - ドキュメント機能: localStorageに保存（guestDocumentsStore） ✅
    - ノート機能: localStorageに保存（guestNotesStore） ✅
    - チャット機能: ゲスト対応済み ✅

  ゲストモードの実装パターン（新機能実装時の必須手順）:
    1. ゲスト用ストアを作成:
       - ファイル名: `useGuestXXXStore.ts`
       - Zustand + persist middleware使用
       - localStorage に永続化
       - 例: `useGuestDocumentsStore`, `useGuestNotesStore`

    2. フロントエンドで認証トークンの有無で分岐:
       ```typescript
       const authToken = useAuthStore(state => state.token)
       const { items: authItems } = useXXXStore()
       const { items: guestItems } = useGuestXXXStore()
       const items = authToken ? authItems : guestItems
       ```

    3. 操作も同様に分岐:
       ```typescript
       const handleCreate = async () => {
         if (authToken) {
           await createAuthItem(authToken, data)
         } else {
           createGuestItem(data)  // 即座に完了
         }
       }
       ```

    4. 実装順序（必ず守る）:
       ① ゲスト用ストア作成（localStorage）
       ② ゲストモードでUIを実装・テスト
       ③ 完璧に動作したら、認証モードを追加
       ④ APIとDB連携は最後

    5. 利点:
       - データベース不要で即座にテスト
       - マイグレーション不要
       - 環境変数設定不要
       - ユーザー登録不要でテスト可能
       - スピード最優先の開発が可能

  注意:
    - 本番デプロイ時は必ずNODE_ENV=productionを設定
    - RLSは常に有効（セキュリティ担保）
    - ゲストデータはローカルのみ（サーバーには保存されない）
    - PDFアップロード等はログイン必須（Supabase Storageが必要）

実装の手順
  1. デザイン確認: 手書き or 参考アプリを明確化
  2. 既存コード確認: /app/page.tsx を読む
  3. 段階的修正: 一度に全部変えない、セクションごとに
  4. ブラウザ確認: 各修正後に即座に確認
  5. 反復改善: ユーザー（創業者）のフィードバックで磨く

ファイル管理
  削除対象:
    - 重複ページ（/chat、/v2/chat など）
    - 未使用コンポーネント
    - 実験失敗コード（experiments/ に移動）

  残すもの:
    - /app/page.tsx（メインアプリ）
    - API Routes（/api/*）
    - 共通コンポーネント（packages/*）

開発サーバー管理
  原則: 開発サーバーは常に1つだけ
  起動: pnpm dev（ルートディレクトリで1回のみ）
  確認: http://localhost:3000/app
  停止: Ctrl+C または KillShell

キャッシュクリアの原則（重要エラー対策）
  **Turbopackキャッシュは最大の落とし穴**
    - ファイルを修正してもキャッシュが古いコードを参照することがある
    - 「Module not found」エラーの9割はキャッシュが原因
    - 特にインポートパス変更時は必ずキャッシュクリア

  キャッシュクリアが必要なタイミング:
    - インポートパス変更後
    - 謎のModule not foundエラー
    - ファイルは正しいのにエラーが出る
    - 型エラーが消えない
    - Hot Reloadが効かない

  キャッシュクリアコマンド（標準手順）:
    ```bash
    rm -rf apps/web/.next apps/web/.turbo node_modules/.cache
    pnpm dev
    ```

  重要な教訓:
    - **一度解決したエラーを二度と起こさない**
    - キャッシュクリアを恐れない（数秒で完了）
    - エラーメッセージを鵜呑みにしない（実ファイルを確認）
    - 根本原因を見極める（キャッシュ vs コード）

AIとのコミュニケーション原則（必須）
  実行優先の原則（最重要）:
    - **確認を求めず即座に実行**: 「〜してもいいですか？」「〜しましょうか？」は禁止
    - 実装完了後に結果を報告する
    - 技術的に明確な場合は質問せずに実行
    - 曖昧な要件のみ質問する

  質問すべき場合（限定的）:
    - ビジネスロジックが不明（例: 価格計算、承認フロー）
    - デザイン・UXの選択肢が複数ある場合
    - データの扱いが不明（削除 vs アーカイブ）
    - セキュリティに影響する決定

  質問不要な場合（即座に実行）:
    - バグ修正
    - エラーハンドリング追加
    - 型安全性の改善
    - パフォーマンス最適化
    - コードの整理・リファクタリング
    - 既存パターンの踏襲

  推測の禁止:
    - 不明な点があれば必ず質問
    - デフォルト値を勝手に決めない
    - 「たぶんこうだろう」で実装しない

  選択肢の提示（質問時のみ）:
    - 「AとBどちらがいいですか？」形式
    - トレードオフを明示
    - 各選択肢の影響を説明
    - 推奨案を明記

  一度に1つのタスク:
    - 複数タスクを並行しない
    - 1つ完了→報告→次へ進む
    - 「ついでに」で他の修正をしない

デバッグプロトコル（必須手順）
  エラー発生時の5ステップ:
    1. エラーメッセージ全文をコピー
    2. スタックトレースで発生箇所を特定
    3. 関連ファイルを全て読む（推測しない）
    4. 根本原因を特定（表面的な症状ではなく）
    5. 構造的な解決策を実装

  並行確認（エラー時は必ず全て実行）:
    - サーバーログ（BashOutput）
    - ブラウザコンソール
    - ネットワークタブ（APIレスポンス）
    - データベース状態（Supabase Dashboard）
    - 環境変数（.env.local）

  エラー修正後の必須確認:
    - 同じエラーケースで再テスト
    - 関連する他の機能も確認
    - ゲスト/認証両方で確認
    - DECISIONS.mdに原因と解決策を記録

  禁止事項:
    - 「とりあえず」の修正
    - エラーを握りつぶす（try-catch で無視）
    - 推測での修正（必ずコードを読む）

技術的負債の管理
  DEBT.md記録: TODO/FIXME/HACK発見時に自動記録（Location/Issue/Impact/Estimated）
  基準: High（セキュリティ・パフォーマンス）/Medium（重複・型安全性）/Low（命名・コメント）
  タイミング: 3回目の重複でリファクタ、500行超えで分割、週1レビュー
  禁止: コピペコード、any型乱用

パフォーマンス予算（絶対遵守）
  フロントエンド:
    - 初回ロード: < 2秒（3G回線）
    - ページサイズ: < 200KB（JS + CSS）
    - 画像: WebP必須、< 100KB/枚
    - Lighthouse Score: > 90点

  バックエンド:
    - API応答: < 500ms（p95）
    - データベースクエリ: < 100ms
    - AI応答: < 3秒（Gemini）

  計測ルール:
    - 新機能実装時に必ず計測
    - Chrome DevTools Performance タブ
    - Lighthouseレポート生成
    - 基準を超えたら改善してからマージ

  最適化の優先順位:
    1. 不要なネットワークリクエスト削減
    2. 画像最適化
    3. コード分割（dynamic import）
    4. キャッシング戦略

セキュリティチェックリスト（デプロイ前必須）
  認証・認可:
    ✅ RLSが全テーブルで有効
    ✅ APIキーは環境変数のみ
    ✅ JWTトークン検証
    ✅ CSRF対策（SameSite Cookie）

  データ保護:
    ✅ パスワードはハッシュ化（Supabase Auth）
    ✅ 個人情報はログに出力しない
    ✅ SQLインジェクション対策（Prepared Statement）
    ✅ XSS対策（dangerouslySetInnerHTML禁止）

  API セキュリティ:
    ✅ レート制限（Upstash Redis）
    ✅ CORS設定（許可ドメインのみ）
    ✅ HTTPSのみ（HSTSヘッダー）
    ✅ 機密データはPOSTのみ（GETに含めない）

  環境変数チェック:
    ✅ .env.local は .gitignore に含む
    ✅ 本番環境変数はVercelで設定
    ✅ API キーのローテーション計画

  デプロイ前の最終確認:
    1. git grep "TODO.*security" でセキュリティTODO確認
    2. git grep "password.*=.*\".*\"" でハードコード確認
    3. Supabase Dashboard でRLS有効確認
    4. Vercel環境変数の二重確認


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


＃エラー対応の絶対原則（最重要）

一度解決したエラーは二度と発生させない
  実装時の心構え:
    - 根本原因を完全に理解してから修正する
    - 表面的な対処療法ではなく、構造的な解決を行う
    - 同じ種類のエラーが他の箇所で発生しないか確認する

エラーハンドリングの必須実装パターン
  1. try-catchでラップ
  2. エラーステート管理（useState<string | null>）
  3. 視覚的フィードバック（エラーUI、AlertCircle）
  4. ローディング状態管理（isSaving, isLoading）
  5. デバッグログ（console.error with prefix）

型安全性の徹底
  - any型は極力避ける（エラー型は any でも catch内のみOK）
  - undefined/null チェックを必ず行う
  - オプショナルチェーン(?.)を活用
  - 型ガードを使用して実行時エラーを防ぐ

名前衝突の回避（必須）
  ブラウザネイティブAPIとライブラリの名前衝突を防ぐ:
    - File, Blob, Event, Error等のグローバルオブジェクトに注意
    - lucide-reactなどのアイコンライブラリをインポートする際は別名を使う
    - 例: `import { File as FileIcon } from 'lucide-react'`
    - new演算子を使う場合、同名のインポートがないか確認する
    - VSCodeの型エラーを見逃さない（赤い波線を放置しない）

依存関係の完全性チェック（新機能実装時）
  新しいパッケージを使用する際の必須手順:
    1. package.jsonに依存関係が含まれているか確認
    2. 実装後、必ずブラウザで動作確認（ビルドエラーを見逃さない）
    3. "Module not found"エラーが出たら即座にpnpm installを実行
    4. API Routesで外部パッケージを使う場合、runtime設定を確認
    5. Node.js専用パッケージ（pdf-parse, mammoth等）はruntimeを'nodejs'に設定

ゲストユーザー対応パターン
  認証が不要な機能は必ずゲスト対応を実装:
    - API層: ゲストユーザーを特別扱い（uuid検証をスキップ）
    - フロントエンド: localStorage永続化（Zustand + Persist）
    - 条件分岐: `const isGuest = userId === 'guest'`
    - データ分離: 認証ユーザーとゲストで別のストアを使用

エラーUI実装の必須要素
  - AlertCircle アイコン
  - 赤いアラート（border-l-4 border-red-500）
  - エラーメッセージの表示
  - 閉じるボタン（✕）
  - エラー発生箇所の近くに配置

デバッグ時の確認事項
  1. サーバーログを必ず確認（BashOutput tool使用）
  2. ブラウザのDevToolsコンソールを確認
  3. APIレスポンスのステータスコード確認（200, 400, 500等）
  4. ネットワークタブでリクエスト/レスポンスの詳細確認
  5. 開発サーバーの再起動が必要か判断

エラーログの書き方
  - プレフィックスを付ける: `[Feature API]`, `[Component]`
  - エラー内容を明確に: `console.error('[Notes API] Error fetching notes:', error)`
  - 成功ログも残す: `console.log('[Notes API] Successfully created note:', data)`

修正後の必須確認
  - すべてのエラーケースをテスト（成功、失敗、空データ等）
  - モバイルサイズでも動作確認
  - ゲストユーザーと認証ユーザー両方で確認
  - ブラウザリロード後もデータが残るか確認（localStorage使用時）


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


＃実装状況
詳細な実装状況は IMPLEMENTATION_STATUS.md を参照
