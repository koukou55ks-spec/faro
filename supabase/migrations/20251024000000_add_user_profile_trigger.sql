-- 新規ユーザー登録時に自動でuser_profilesレコードを作成するトリガー
-- これにより、全ユーザーが自動的にプロフィール情報を持つようになる

-- トリガー関数: 新規ユーザー作成時にuser_profilesレコードを自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, created_at, updated_at, last_accessed_at)
  VALUES (NEW.id, NOW(), NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー: auth.usersに新規ユーザーが追加されたときに発火
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- コメント
COMMENT ON FUNCTION public.handle_new_user() IS '新規ユーザー登録時にuser_profilesテーブルに空のプロフィールを自動作成';
