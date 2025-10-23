-- ==========================================
-- 既存テーブルの確認スクリプト
-- Supabase SQL Editorで実行してください
-- ==========================================

-- 1. user_context_vectors テーブルの構造を確認
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_context_vectors'
ORDER BY ordinal_position;

-- 2. すべての関連テーブルが存在するか確認
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'user_life_events', 'user_question_history', 'user_context_vectors')
ORDER BY table_name;

-- 3. RPC関数が存在するか確認
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'match_user_context_vectors';
