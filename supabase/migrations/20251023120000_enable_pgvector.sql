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

-- RPC関数の説明コメント
COMMENT ON FUNCTION match_user_context_vectors IS 'ユーザーのコンテキストベクトルから類似検索を実行する関数。コサイン類似度を使用。';
