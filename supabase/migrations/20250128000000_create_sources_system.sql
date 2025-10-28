-- Sources管理システム
-- ユーザーが自由に情報を追加・管理できるフラットなソース構造

-- カテゴリテーブル（カスタムカテゴリ用）
CREATE TABLE IF NOT EXISTS public.custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Sourcesテーブル
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本情報
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- プリセット or カスタムカテゴリ名
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'document', 'link', 'structured')),

  -- コンテンツ（JSONB で柔軟に）
  content JSONB NOT NULL DEFAULT '{}',

  -- メタデータ
  tags TEXT[] DEFAULT '{}',
  ai_priority TEXT NOT NULL DEFAULT 'on_demand' CHECK (ai_priority IN ('always', 'on_demand', 'manual')),

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_sources_user_id ON public.sources(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_category ON public.sources(category);
CREATE INDEX IF NOT EXISTS idx_sources_tags ON public.sources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_sources_created_at ON public.sources(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON public.custom_categories(user_id);

-- RLS (Row Level Security) の有効化
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: sources
CREATE POLICY "Users can view their own sources"
  ON public.sources
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sources"
  ON public.sources
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
  ON public.sources
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
  ON public.sources
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS ポリシー: custom_categories
CREATE POLICY "Users can view their own categories"
  ON public.custom_categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON public.custom_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.custom_categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.custom_categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_categories_updated_at
  BEFORE UPDATE ON public.custom_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
