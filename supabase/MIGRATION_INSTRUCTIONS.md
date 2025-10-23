# Supabaseマイグレーション適用手順

## 📋 概要

このドキュメントでは、ユーザープロフィールシステムとAI自動抽出機能のためのデータベーススキーマをSupabaseに適用する手順を説明します。

## 🚀 適用方法

### オプション1: Supabase Dashboard (推奨)

1. **Supabase Dashboardにアクセス**
   - https://app.supabase.com/ にアクセス
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから「SQL Editor」をクリック
   - 「New query」ボタンをクリック

3. **マイグレーションSQLを貼り付け**
   - `supabase/APPLY_MIGRATIONS.sql` の内容をコピー
   - SQL Editorに貼り付け

4. **実行**
   - 右下の「Run」ボタンをクリック
   - 完了メッセージが表示されることを確認

### オプション2: Supabase CLI（ローカル開発環境がある場合）

```bash
# Dockerが起動していることを確認
docker ps

# Supabaseを起動
cd supabase
npx supabase start

# マイグレーションを適用
npx supabase db push

# リモートにプッシュ（本番環境）
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --linked
```

## ✅ 適用後の確認

### 1. テーブルが作成されたか確認

Supabase Dashboard → Table Editor で以下のテーブルが表示されることを確認：

- ✅ `user_profiles`
- ✅ `user_life_events`
- ✅ `user_question_history`
- ✅ `user_context_vectors`

### 2. pgvector拡張が有効か確認

SQL Editorで以下を実行：

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

結果が返ってくればOK。

### 3. RPC関数が作成されたか確認

SQL Editorで以下を実行：

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'match_user_context_vectors';
```

`match_user_context_vectors` が表示されればOK。

## 📊 作成されるスキーマ

### user_profiles

ユーザーの基本情報、収入、家族構成、関心事などを格納。

**主要カラム:**
- `age`, `occupation`, `annual_income`
- `marital_status`, `num_children`
- `interests[]` - ["NISA", "iDeCo", "ふるさと納税"]
- `concerns[]` - ["税金対策", "年金不安", "医療費"]

### user_life_events

結婚、出産、転職、住宅購入などのライフイベント。

**主要カラム:**
- `event_type` - marriage, child_birth, house_purchase など
- `event_date`, `event_year`
- `auto_detected` - AIが自動検出したか
- `confidence_score` - AIの確信度

### user_question_history

ユーザーの過去の質問履歴。関心事の自動抽出に使用。

**主要カラム:**
- `question` - ユーザーの質問内容
- `keywords[]` - 抽出されたキーワード
- `detected_concerns[]` - 検出された悩み

### user_context_vectors

RAG（検索拡張生成）用のベクトルデータ。

**主要カラム:**
- `content` - 元のテキスト
- `embedding` - 768次元のGeminiベクトル
- `content_type` - chat, note, profile, life_event

## 🔒 セキュリティ

すべてのテーブルにRow Level Security (RLS)が適用されています。

- ユーザーは自分のデータのみアクセス可能
- サービスキーを使用するAPI経由でのみ書き込み可能
- クライアントから直接書き込みは不可

## 🧪 動作確認

マイグレーション適用後、以下でテスト：

```bash
# ローカルで開発サーバー起動
pnpm dev

# http://localhost:3000 にアクセス
# ログインしてチャットで「NISAについて教えて」と質問
# マイページ (/mypage) で関心事に「NISA」が追加されることを確認
```

## ❗ トラブルシューティング

### エラー: `extension "vector" does not exist`

pgvectorがSupabaseプロジェクトで有効化されていません。

**解決方法:**
Supabase Dashboard → Database → Extensions → 「vector」を検索してONにする

### エラー: `permission denied for schema public`

RLSポリシーの問題。

**解決方法:**
SQL Editorで以下を実行：

```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### エラー: `function match_user_context_vectors does not exist`

RPC関数が作成されていません。

**解決方法:**
`APPLY_MIGRATIONS.sql` の Part 2 のみを再実行。

## 📝 ロールバック方法

万が一問題があった場合、以下のSQLで削除できます：

```sql
-- テーブル削除
DROP TABLE IF EXISTS user_context_vectors CASCADE;
DROP TABLE IF EXISTS user_question_history CASCADE;
DROP TABLE IF EXISTS user_life_events CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 関数削除
DROP FUNCTION IF EXISTS match_user_context_vectors;
DROP FUNCTION IF EXISTS update_updated_at_column;

-- pgvector拡張削除（注意：他で使用していないか確認）
-- DROP EXTENSION IF EXISTS vector;
```

## 🎉 完了

マイグレーション適用が完了すると、以下の機能が利用可能になります：

1. **ユーザープロフィール管理** - My Pageでの情報入力・表示
2. **AI自動情報抽出** - チャット会話から関心事・不安を自動検出
3. **ライフイベント管理** - 重要なライフイベントの記録
4. **ベクトル検索** - 過去の会話からの類似コンテンツ検索（RAG）

次のステップ: [DEPLOY.md](../DEPLOY.md) を参照してVercelにデプロイ
