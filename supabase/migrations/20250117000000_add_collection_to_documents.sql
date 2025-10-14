-- ============================================================================
-- ADD collection_id to documents table for direct relationship
-- ============================================================================

-- Add collection_id column to documents (optional, for direct assignment)
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Add content column to documents (store extracted text for quick access)
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS content TEXT;

-- Create index for collection_id lookups
CREATE INDEX IF NOT EXISTS idx_documents_collection_id ON documents(collection_id);

-- Update RLS policies to allow collection-based access
-- (Existing policies already cover user-based access)

-- ============================================================================
-- ENHANCED SEARCH FUNCTION: Search within a specific collection/project
-- ============================================================================

CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  p_collection_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
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
    (p_user_id IS NULL OR d.user_id = p_user_id)
    AND (p_collection_id IS NULL OR d.collection_id = p_collection_id)
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_document_chunks IS 'Semantic search within a specific collection/project for NotebookLM';
COMMENT ON COLUMN documents.collection_id IS 'Direct collection assignment (alternative to collection_documents table)';
COMMENT ON COLUMN documents.content IS 'Extracted text content from the document (first 10k chars for quick access)';
