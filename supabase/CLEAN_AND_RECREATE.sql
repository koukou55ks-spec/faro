-- ==========================================
-- クリーンアップ＆再作成スクリプト
-- 既存のテーブルを削除してから作り直します
-- ⚠️ 注意: 既存データは削除されます！
-- ==========================================

-- Step 1: 既存のテーブルとRPC関数を削除
-- ==========================================

-- RPC関数削除
DROP FUNCTION IF EXISTS match_user_context_vectors;

-- テーブル削除（CASCADE で依存関係も削除）
DROP TABLE IF EXISTS user_context_vectors CASCADE;
DROP TABLE IF EXISTS user_question_history CASCADE;
DROP TABLE IF EXISTS user_life_events CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- トリガー関数削除
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Step 2: 再作成
-- ==========================================

-- 1. ユーザープロフィールのメインテーブル
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本情報
  age INT,
  birth_year INT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  occupation TEXT,
  industry TEXT,

  -- 経済情報
  annual_income BIGINT,
  household_income BIGINT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'freelance', 'self_employed', 'student', 'retired', 'unemployed')),

  -- 家族構成
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  num_dependents INT DEFAULT 0,
  has_children BOOLEAN DEFAULT false,
  num_children INT DEFAULT 0,

  -- 居住情報
  prefecture TEXT,
  city TEXT,
  residence_type TEXT CHECK (residence_type IN ('owned', 'rented', 'family_owned', 'company_housing')),

  -- 金融状況
  has_mortgage BOOLEAN DEFAULT false,
  has_savings BOOLEAN DEFAULT false,
  has_investments BOOLEAN DEFAULT false,

  -- 関心事・目標（AIが参照）
  interests TEXT[],
  life_goals TEXT[],
  concerns TEXT[],

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 2. ライフイベント履歴テーブル
CREATE TABLE user_life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL CHECK (event_type IN (
    'birth', 'marriage', 'divorce', 'child_birth',
    'job_change', 'promotion', 'retirement',
    'house_purchase', 'house_sale', 'relocation',
    'inheritance', 'business_start', 'business_close',
    'illness', 'accident', 'other'
  )),

  event_date DATE,
  event_year INT,
  description TEXT,

  metadata JSONB,

  auto_detected BOOLEAN DEFAULT false,
  confidence_score FLOAT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ユーザーの質問履歴
CREATE TABLE user_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  question TEXT NOT NULL,
  category TEXT,
  keywords TEXT[],

  detected_life_event TEXT,
  detected_concerns TEXT[],

  asked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ユーザーコンテキストのベクトル検索用
CREATE TABLE user_context_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('chat', 'note', 'profile', 'life_event')),
  source_id UUID,

  embedding VECTOR(768),

  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_life_events_user_id ON user_life_events(user_id);
CREATE INDEX idx_user_life_events_date ON user_life_events(event_date);
CREATE INDEX idx_user_question_history_user_id ON user_question_history(user_id);
CREATE INDEX idx_user_context_vectors_user_id ON user_context_vectors(user_id);

-- ベクトル検索用のインデックス（IVFFlat）
CREATE INDEX idx_user_context_vectors_embedding
ON user_context_vectors
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Row Level Security (RLS) 有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context_vectors ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own life events"
  ON user_life_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own life events"
  ON user_life_events FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own question history"
  ON user_question_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own context vectors"
  ON user_context_vectors FOR SELECT
  USING (auth.uid() = user_id);

-- トリガー: updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_life_events_updated_at
  BEFORE UPDATE ON user_life_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE user_profiles IS 'ユーザーの基本プロフィール情報。AIがパーソナライズされた回答を生成するために参照';
COMMENT ON TABLE user_life_events IS 'ユーザーのライフイベント履歴。AIが能動的な提案を行うために使用';
COMMENT ON TABLE user_question_history IS 'ユーザーの過去の質問履歴。関心事や悩みを自動抽出するために使用';
COMMENT ON TABLE user_context_vectors IS 'ユーザーコンテキストのベクトルデータ。RAG（検索拡張生成）に使用';

-- pgvector拡張を有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- ベクトル類似検索用のRPC関数
CREATE OR REPLACE FUNCTION match_user_context_vectors(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  content_type text,
  source_id uuid,
  metadata jsonb,
  similarity float,
  created_at timestamptz
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    user_id,
    content,
    content_type,
    source_id,
    metadata,
    1 - (embedding <=> query_embedding) as similarity,
    created_at
  FROM user_context_vectors
  WHERE user_id = filter_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION match_user_context_vectors IS 'ユーザーのコンテキストベクトルから類似検索を実行する関数。コサイン類似度を使用。';

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ クリーンアップ＆再作成完了！';
  RAISE NOTICE '';
  RAISE NOTICE '削除されたテーブル:';
  RAISE NOTICE '  - user_profiles (旧)';
  RAISE NOTICE '  - user_life_events (旧)';
  RAISE NOTICE '  - user_question_history (旧)';
  RAISE NOTICE '  - user_context_vectors (旧)';
  RAISE NOTICE '';
  RAISE NOTICE '作成されたテーブル:';
  RAISE NOTICE '  - user_profiles (新)';
  RAISE NOTICE '  - user_life_events (新)';
  RAISE NOTICE '  - user_question_history (新)';
  RAISE NOTICE '  - user_context_vectors (新)';
  RAISE NOTICE '';
  RAISE NOTICE 'pgvector拡張が有効化されました。';
  RAISE NOTICE 'ベクトル検索関数 match_user_context_vectors() が利用可能です。';
END $$;
