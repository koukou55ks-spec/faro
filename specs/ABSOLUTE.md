絶対優先 - 必ずCLAUDE.mdに反映

更新: 2025-01-10

========================================

プロジェクト
  名前: Faro
  目的: 知識格差を是正するパーソナルCFO AIアプリ
  状態: MVP開発中
  リリース: 2025年2月

========================================

技術スタック（絶対変更禁止！）

フロントエンド
  Next.js 15 (App Router)
  React 19
  Tailwind CSS + shadcn/ui
  Zustand
  TypeScript 5

バックエンド
  Next.js API Routes ← FastAPI使わない
  Supabase (PostgreSQL)
  pgvector ← ChromaDB使わない
  Supabase Auth

AI
  Gemini 2.0 Flash
  Gemini Embeddings

デプロイ
  Vercel + Supabase Cloud

========================================

絶対ルール

1. 技術スタック勝手に変えるな
   変える時は必ず聞いて、理由説明して

2. ファイル削除するな
   不要なら /archive/ に移動
   移動前に確認

3. MDファイル勝手に作るな
   作るなら specs/high/ か specs/low/ に
   CLAUDE.mdは自動生成のみ

4. .env.local 触るな
   新しい環境変数追加はOK
   Gitにコミットは絶対ダメ

5. データベース直接いじるな
   必ずマイグレーションファイル使え

========================================

今やること

今すぐ
  - テストカバレッジ80%
  - Sentryセットアップ

今週中
  - Stripe決済
  - ユーザーオンボーディング

いつか
  - PWA対応
  - 多言語対応
  - パフォーマンス最適化

========================================

禁止リスト

× FastAPI追加
× ChromaDB使用
× MongoDB等の他DB
× .env.local削除
× CLAUDE.md手動編集
× ルートにMDファイル乱立

========================================

これが全ての真実。矛盾があったらこのファイル優先。
