-- 古いprofilesテーブルを削除（user_profilesを使用）
-- WARNING: このマイグレーションを実行する前に、既存データをバックアップしてください

-- 古いprofilesテーブルが存在する場合のみ削除
DROP TABLE IF EXISTS public.profiles CASCADE;

-- コメント: user_profilesテーブルを使用してください
COMMENT ON TABLE public.user_profiles IS 'ユーザープロファイル情報を格納するメインテーブル（profilesテーブルは廃止）';