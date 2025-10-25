-- usage_limits テーブル作成
CREATE TABLE IF NOT EXISTS public.usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 'YYYY-MM' 形式
  chat_count INTEGER DEFAULT 0,
  search_count INTEGER DEFAULT 0,
  tool_usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON public.usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_month ON public.usage_limits(month);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_month ON public.usage_limits(user_id, month);

-- RLS (Row Level Security) 有効化
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users can view their own usage limits"
  ON public.usage_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ挿入可能
CREATE POLICY "Users can insert their own usage limits"
  ON public.usage_limits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update their own usage limits"
  ON public.usage_limits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ削除可能
CREATE POLICY "Users can delete their own usage limits"
  ON public.usage_limits
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
