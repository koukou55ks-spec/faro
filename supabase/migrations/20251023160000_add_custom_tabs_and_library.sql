-- マイページのカスタムタブ機能（NotebookLM風）とライブラリ機能の追加

-- 1. カスタムタブテーブル（ユーザーが自由に作成できるタブ）
CREATE TABLE IF NOT EXISTS user_custom_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- タブ情報
  name TEXT NOT NULL, -- "2024年医療費", "投資記録"
  description TEXT,
  icon TEXT, -- アイコン名（lucide-react）
  color TEXT, -- テーマカラー（blue, purple, green など）

  -- 表示順序
  display_order INT DEFAULT 0,

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 複合ユニーク制約（同じユーザーで同じタブ名は作れない）
  UNIQUE(user_id, name)
);

-- 2. カスタムタブのアイテムテーブル（ファイル、テキスト、リンク）
CREATE TABLE IF NOT EXISTS user_custom_tab_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID NOT NULL REFERENCES user_custom_tabs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- アイテムタイプ
  item_type TEXT NOT NULL CHECK (item_type IN ('file', 'text', 'link', 'image')),

  -- コンテンツ
  title TEXT NOT NULL,
  content TEXT, -- テキストの場合はここに本文、ファイルの場合はメタデータJSON
  file_url TEXT, -- Supabase Storageへのパス
  file_type TEXT, -- PDF, CSV, XLSX, PNG, JPEG など
  file_size BIGINT, -- バイト数

  -- RAG用の埋め込みベクトル（検索可能にする）
  embedding VECTOR(768), -- Gemini embedding dimension

  -- 表示順序
  display_order INT DEFAULT 0,

  -- メタデータ
  metadata JSONB, -- {originalFileName: "receipt.pdf", pages: 10}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ライブラリコンテンツテーブル（全ユーザー共通の学習コンテンツ）
CREATE TABLE IF NOT EXISTS library_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- コンテンツタイプ
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'quiz', 'simulation', 'video', 'infographic')),

  -- コンテンツ情報
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- 記事本文、クイズJSON、シミュレーション設定など
  thumbnail_url TEXT, -- サムネイル画像

  -- 分類
  category TEXT NOT NULL, -- "所得税", "住民税", "相続税", "NISA", "iDeCo"
  tags TEXT[], -- ["確定申告", "控除", "節税"]
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')), -- 難易度

  -- 統計情報（ランキング用）
  view_count INT DEFAULT 0,
  completion_count INT DEFAULT 0, -- クイズやシミュレーションの完了回数
  average_score FLOAT, -- クイズの平均スコア

  -- メタデータ
  author_id UUID, -- 管理者ユーザーのID
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ライブラリコンテンツのユーザー進捗テーブル
CREATE TABLE IF NOT EXISTS user_library_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES library_content(id) ON DELETE CASCADE,

  -- 進捗状況
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage INT DEFAULT 0, -- 0-100

  -- クイズ・シミュレーション結果
  score FLOAT, -- クイズのスコア
  result_data JSONB, -- 詳細な結果データ

  -- お気に入り・評価
  is_bookmarked BOOLEAN DEFAULT false,
  user_rating INT CHECK (user_rating >= 1 AND user_rating <= 5), -- 1-5の評価

  -- メタデータ
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, content_id)
);

-- 5. エージェント提案履歴テーブル（能動的提案の記録）
CREATE TABLE IF NOT EXISTS agent_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 提案内容
  suggestion_type TEXT NOT NULL, -- "tax_deadline", "deduction_opportunity", "life_event_reminder"
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- 提案に対するアクションURL

  -- 優先度・ステータス
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'viewed', 'acted', 'dismissed')) DEFAULT 'pending',

  -- AI関連情報
  confidence_score FLOAT, -- AIの確信度 (0-1)
  reasoning TEXT, -- 提案理由

  -- メタデータ
  metadata JSONB, -- 提案の詳細データ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- 提案の有効期限
  acted_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_custom_tabs_user_id ON user_custom_tabs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_tabs_display_order ON user_custom_tabs(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_user_custom_tab_items_tab_id ON user_custom_tab_items(tab_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_tab_items_user_id ON user_custom_tab_items(user_id);
CREATE INDEX IF NOT EXISTS idx_library_content_category ON library_content(category);
CREATE INDEX IF NOT EXISTS idx_library_content_type ON library_content(content_type);
CREATE INDEX IF NOT EXISTS idx_library_content_view_count ON library_content(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_library_progress_user_id ON user_library_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_progress_content_id ON user_library_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_agent_suggestions_user_id ON agent_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_suggestions_status ON agent_suggestions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_suggestions_priority ON agent_suggestions(user_id, priority, created_at DESC);

-- ベクトル検索用のインデックス（カスタムタブアイテム）
CREATE INDEX IF NOT EXISTS idx_user_custom_tab_items_embedding
ON user_custom_tab_items
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Row Level Security (RLS) 有効化
ALTER TABLE user_custom_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_tab_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_suggestions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: カスタムタブ
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_custom_tabs' AND policyname = 'Users can manage their own custom tabs'
  ) THEN
    CREATE POLICY "Users can manage their own custom tabs"
      ON user_custom_tabs FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_custom_tab_items' AND policyname = 'Users can manage their own tab items'
  ) THEN
    CREATE POLICY "Users can manage their own tab items"
      ON user_custom_tab_items FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  -- RLSポリシー: ライブラリコンテンツ（全員が閲覧可能）
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'library_content' AND policyname = 'Anyone can view published library content'
  ) THEN
    CREATE POLICY "Anyone can view published library content"
      ON library_content FOR SELECT
      USING (is_published = true);
  END IF;

  -- 管理者のみが編集可能（後で実装）
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'library_content' AND policyname = 'Service role can manage library content'
  ) THEN
    CREATE POLICY "Service role can manage library content"
      ON library_content FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  -- RLSポリシー: ユーザー進捗
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_library_progress' AND policyname = 'Users can manage their own library progress'
  ) THEN
    CREATE POLICY "Users can manage their own library progress"
      ON user_library_progress FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  -- RLSポリシー: エージェント提案
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_suggestions' AND policyname = 'Users can view their own agent suggestions'
  ) THEN
    CREATE POLICY "Users can view their own agent suggestions"
      ON agent_suggestions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'agent_suggestions' AND policyname = 'Users can update their own agent suggestions'
  ) THEN
    CREATE POLICY "Users can update their own agent suggestions"
      ON agent_suggestions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- トリガー: updated_atの自動更新
DROP TRIGGER IF EXISTS update_user_custom_tabs_updated_at ON user_custom_tabs;
CREATE TRIGGER update_user_custom_tabs_updated_at
  BEFORE UPDATE ON user_custom_tabs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_custom_tab_items_updated_at ON user_custom_tab_items;
CREATE TRIGGER update_user_custom_tab_items_updated_at
  BEFORE UPDATE ON user_custom_tab_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_library_content_updated_at ON library_content;
CREATE TRIGGER update_library_content_updated_at
  BEFORE UPDATE ON library_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- トリガー: ライブラリコンテンツの閲覧カウント自動更新
CREATE OR REPLACE FUNCTION increment_library_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.last_accessed_at IS NULL OR
     NEW.last_accessed_at > OLD.last_accessed_at + INTERVAL '1 hour' THEN
    UPDATE library_content
    SET view_count = view_count + 1
    WHERE id = NEW.content_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_library_view_count ON user_library_progress;
CREATE TRIGGER update_library_view_count
  AFTER UPDATE OF last_accessed_at ON user_library_progress
  FOR EACH ROW
  EXECUTE FUNCTION increment_library_view_count();

-- トリガー: ライブラリコンテンツの完了時にカウント更新
CREATE OR REPLACE FUNCTION increment_library_completion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    UPDATE library_content
    SET completion_count = completion_count + 1
    WHERE id = NEW.content_id;

    -- 平均スコアも更新（クイズの場合）
    IF NEW.score IS NOT NULL THEN
      UPDATE library_content
      SET average_score = (
        SELECT AVG(score)
        FROM user_library_progress
        WHERE content_id = NEW.content_id AND score IS NOT NULL
      )
      WHERE id = NEW.content_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_library_completion_count ON user_library_progress;
CREATE TRIGGER update_library_completion_count
  AFTER UPDATE OF status ON user_library_progress
  FOR EACH ROW
  EXECUTE FUNCTION increment_library_completion_count();

-- コメント追加（ドキュメント化）
COMMENT ON TABLE user_custom_tabs IS 'NotebookLM風のカスタムタブ。ユーザーが自由に名前を付けて情報を整理できる';
COMMENT ON TABLE user_custom_tab_items IS 'カスタムタブ内のアイテム（ファイル、テキスト、リンクなど）。RAG検索対象';
COMMENT ON TABLE library_content IS 'ライブラリのコンテンツ（記事、クイズ、シミュレーションなど）';
COMMENT ON TABLE user_library_progress IS 'ユーザーのライブラリコンテンツ進捗状況';
COMMENT ON TABLE agent_suggestions IS 'AIエージェントからの能動的提案（確定申告期限、控除機会など）';
