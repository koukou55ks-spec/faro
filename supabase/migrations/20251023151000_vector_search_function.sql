-- ==========================================
-- ベクトル検索関数の作成
-- pgvectorを使った類似度検索
-- ==========================================

-- pgvector拡張を有効化（まだの場合）
CREATE EXTENSION IF NOT EXISTS vector;

-- ベクトル検索関数
DROP FUNCTION IF EXISTS vector_search(vector, uuid, int, float);
CREATE OR REPLACE FUNCTION vector_search(
  query_embedding vector(768),
  filter_user_id uuid,
  match_count int DEFAULT 5,
  match_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  conversation_id uuid,
  created_at timestamptz
)
LANGUAGE sql STABLE
AS $$
  SELECT
    m.id,
    m.content,
    1 - (m.embedding <=> query_embedding) as similarity,
    m.conversation_id,
    m.created_at
  FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  WHERE
    c.user_id = filter_user_id
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ユーザーコンテキスト検索（user_context_vectorsテーブル用）
DROP FUNCTION IF EXISTS search_user_context(vector, uuid, int, float);
CREATE OR REPLACE FUNCTION search_user_context(
  query_embedding vector(768),
  filter_user_id uuid,
  match_count int DEFAULT 5,
  match_threshold float DEFAULT 0.5
)
RETURNS TABLE (
  id uuid,
  content text,
  content_type text,
  similarity float,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    content_type,
    1 - (embedding <=> query_embedding) as similarity,
    metadata,
    created_at
  FROM user_context_vectors
  WHERE
    user_id = filter_user_id
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 統計情報の更新（パフォーマンス向上）
ANALYZE messages;
ANALYZE user_context_vectors;

COMMENT ON FUNCTION vector_search IS 'メッセージからベクトル類似検索を実行';
COMMENT ON FUNCTION search_user_context IS 'ユーザーコンテキストからベクトル類似検索を実行';

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ ベクトル検索関数の作成が完了しました';
  RAISE NOTICE '  - vector_search: メッセージ検索';
  RAISE NOTICE '  - search_user_context: コンテキスト検索';
  RAISE NOTICE '  - インデックスとの統計情報更新完了';
END $$;