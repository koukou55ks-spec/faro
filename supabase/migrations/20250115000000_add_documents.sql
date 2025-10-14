-- Enable vector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- DOCUMENTS SYSTEM: NotebookLM-style document management
-- ============================================================================

-- 1. Documents table - stores metadata about uploaded files
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'txt', 'md', 'csv', 'docx')),
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  word_count INTEGER,
  page_count INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Document chunks - for vector search (pgvector)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  page_number INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_chunk UNIQUE (document_id, chunk_index)
);

-- 3. Collections - folders for organizing documents
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Collection-Document mapping (many-to-many)
CREATE TABLE IF NOT EXISTS collection_documents (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, document_id)
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_documents_collection ON collection_documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_documents_document ON collection_documents(document_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_documents ENABLE ROW LEVEL SECURITY;

-- Documents policies
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Document chunks policies (inherit from documents)
DROP POLICY IF EXISTS "Users can view chunks of their documents" ON document_chunks;
CREATE POLICY "Users can view chunks of their documents"
  ON document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert chunks for their documents" ON document_chunks;
CREATE POLICY "Users can insert chunks for their documents"
  ON document_chunks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete chunks of their documents" ON document_chunks;
CREATE POLICY "Users can delete chunks of their documents"
  ON document_chunks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Collections policies
DROP POLICY IF EXISTS "Users can manage their own collections" ON collections;
CREATE POLICY "Users can manage their own collections"
  ON collections FOR ALL
  USING (auth.uid() = user_id);

-- Collection-Documents policies
DROP POLICY IF EXISTS "Users can manage their collection documents" ON collection_documents;
CREATE POLICY "Users can manage their collection documents"
  ON collection_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_documents.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- ============================================================================
-- VECTOR SEARCH FUNCTION for documents
-- ============================================================================

CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5,
  user_id_filter uuid DEFAULT NULL,
  document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_title text,
  content text,
  page_number int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    d.title as document_title,
    dc.content,
    dc.page_number,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE
    (user_id_filter IS NULL OR d.user_id = user_id_filter)
    AND (document_ids IS NULL OR d.id = ANY(document_ids))
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS for documentation
-- ============================================================================

COMMENT ON TABLE documents IS 'Stores metadata about user-uploaded documents (PDF, TXT, MD, CSV)';
COMMENT ON TABLE document_chunks IS 'Stores text chunks with embeddings for semantic search';
COMMENT ON TABLE collections IS 'Folders for organizing documents (like NotebookLM notebooks)';
COMMENT ON TABLE collection_documents IS 'Many-to-many relationship between collections and documents';

COMMENT ON FUNCTION match_document_chunks IS 'Semantic search across document chunks using vector similarity';
