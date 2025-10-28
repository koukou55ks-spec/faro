-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- User knowledge base table
CREATE TABLE IF NOT EXISTS user_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768),  -- Gemini text-embedding-004 dimension
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_knowledge_base_user_id ON user_knowledge_base(user_id);
CREATE INDEX idx_user_knowledge_base_metadata ON user_knowledge_base USING gin(metadata);
CREATE INDEX idx_user_knowledge_base_created_at ON user_knowledge_base(created_at DESC);

-- Vector similarity search index (IVFFlat for pgvector)
CREATE INDEX idx_user_knowledge_base_embedding ON user_knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RLS policies
ALTER TABLE user_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own knowledge base"
  ON user_knowledge_base
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge base"
  ON user_knowledge_base
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge base"
  ON user_knowledge_base
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base"
  ON user_knowledge_base
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function for vector similarity search with metadata filtering
CREATE OR REPLACE FUNCTION search_user_knowledge(
  p_user_id UUID,
  p_query_embedding vector(768),
  p_filter_types TEXT[] DEFAULT NULL,
  p_filter_category TEXT DEFAULT NULL,
  p_filter_year INT DEFAULT NULL,
  p_match_count INT DEFAULT 5,
  p_similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.content,
    k.metadata,
    1 - (k.embedding <=> p_query_embedding) AS similarity,
    k.created_at
  FROM user_knowledge_base k
  WHERE k.user_id = p_user_id
    AND k.embedding IS NOT NULL
    AND (p_filter_types IS NULL OR k.metadata->>'type' = ANY(p_filter_types))
    AND (p_filter_category IS NULL OR k.metadata->>'category' = p_filter_category)
    AND (p_filter_year IS NULL OR (k.metadata->>'year')::int = p_filter_year)
    AND (1 - (k.embedding <=> p_query_embedding)) >= p_similarity_threshold
  ORDER BY k.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_knowledge_base_updated_at
  BEFORE UPDATE ON user_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Metadata index categories for common queries
CREATE INDEX idx_metadata_type ON user_knowledge_base ((metadata->>'type'));
CREATE INDEX idx_metadata_category ON user_knowledge_base ((metadata->>'category'));
CREATE INDEX idx_metadata_year ON user_knowledge_base (((metadata->>'year')::int));

-- Comments for documentation
COMMENT ON TABLE user_knowledge_base IS 'Stores user information as vector embeddings for RAG-based AI responses';
COMMENT ON COLUMN user_knowledge_base.content IS 'Original text content';
COMMENT ON COLUMN user_knowledge_base.embedding IS 'Gemini text-embedding-004 vector (768 dimensions)';
COMMENT ON COLUMN user_knowledge_base.metadata IS 'Structured metadata: {type, category, year, source, importance}';
COMMENT ON FUNCTION search_user_knowledge IS 'Vector similarity search with metadata filtering for RAG';
