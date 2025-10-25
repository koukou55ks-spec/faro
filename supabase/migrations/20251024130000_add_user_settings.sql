-- ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 表示設定
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'ja' CHECK (language IN ('ja', 'en')),
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  color_scheme TEXT DEFAULT 'purple' CHECK (color_scheme IN ('purple', 'blue', 'green', 'orange')),

  -- 通知設定
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  notification_digest BOOLEAN DEFAULT true, -- ダイジェスト通知
  notify_ai_response BOOLEAN DEFAULT true, -- AI回答通知
  notify_new_features BOOLEAN DEFAULT true, -- 新機能通知
  notify_tax_deadline BOOLEAN DEFAULT true, -- 税金締切通知
  notify_tips BOOLEAN DEFAULT true, -- 節税Tips通知

  -- プライバシー設定
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private')),
  data_sharing BOOLEAN DEFAULT false, -- データ共有（統計目的）
  analytics_enabled BOOLEAN DEFAULT true, -- アクセス解析

  -- セキュリティ設定
  two_factor_enabled BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 7200, -- セッションタイムアウト（秒）

  -- アプリ設定
  auto_save BOOLEAN DEFAULT true, -- 自動保存
  show_onboarding BOOLEAN DEFAULT true, -- オンボーディング表示
  compact_view BOOLEAN DEFAULT false, -- コンパクト表示

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS有効化
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ポリシー: 自分の設定のみ参照可能
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: 自分の設定のみ更新可能
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ポリシー: 自分の設定のみ挿入可能
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: 自分の設定のみ削除可能
CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- ユーザー登録時に自動でデフォルト設定を作成するトリガー
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_user_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- ログイン履歴テーブル
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  login_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  location TEXT, -- 推定地域
  success BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- ポリシー: 自分のログイン履歴のみ参照可能
CREATE POLICY "Users can view own login history"
  ON login_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_login_at ON login_history(login_at DESC);

-- アクティブセッションテーブル
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  session_token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  device_type TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- ポリシー: 自分のセッションのみ参照可能
CREATE POLICY "Users can view own sessions"
  ON active_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: 自分のセッションのみ削除可能（ログアウト）
CREATE POLICY "Users can delete own sessions"
  ON active_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX idx_active_sessions_expires_at ON active_sessions(expires_at);

-- 期限切れセッションを自動削除する関数
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM active_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE user_settings IS 'ユーザーの設定情報を保存';
COMMENT ON TABLE login_history IS 'ユーザーのログイン履歴を保存';
COMMENT ON TABLE active_sessions IS 'アクティブなセッション情報を保存';
