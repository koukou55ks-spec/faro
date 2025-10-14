-- ============================================================================
-- NESTED COLLECTIONS: NotebookLM-style nested folder structure
-- ============================================================================

-- Add parent_id for nested structure
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES collections(id) ON DELETE CASCADE;

-- Add order field for custom sorting
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add is_expanded for UI state (whether folder is open/closed)
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS is_expanded BOOLEAN DEFAULT true;

-- Create index for parent_id lookups
CREATE INDEX IF NOT EXISTS idx_collections_parent_id ON collections(parent_id);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_collections_sort_order ON collections(user_id, parent_id, sort_order);

-- ============================================================================
-- HELPER FUNCTIONS for nested collections
-- ============================================================================

-- Function to get all descendant collection IDs (recursive)
CREATE OR REPLACE FUNCTION get_descendant_collection_ids(collection_id UUID)
RETURNS TABLE (id UUID)
LANGUAGE SQL
AS $$
  WITH RECURSIVE descendants AS (
    -- Base case: the collection itself
    SELECT id FROM collections WHERE id = collection_id
    UNION ALL
    -- Recursive case: children of descendants
    SELECT c.id
    FROM collections c
    INNER JOIN descendants d ON c.parent_id = d.id
  )
  SELECT id FROM descendants WHERE id != collection_id;
$$;

-- Function to prevent circular references (triggers on INSERT/UPDATE)
CREATE OR REPLACE FUNCTION prevent_circular_collection_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- If parent_id is NULL, it's a root collection - allow
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if new parent would create a circular reference
  -- (i.e., the new parent is a descendant of this collection)
  IF EXISTS (
    SELECT 1 FROM get_descendant_collection_ids(NEW.id) WHERE id = NEW.parent_id
  ) THEN
    RAISE EXCEPTION 'Circular reference detected: Cannot set parent to a descendant collection';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to prevent circular references
DROP TRIGGER IF EXISTS check_circular_collection_reference ON collections;
CREATE TRIGGER check_circular_collection_reference
  BEFORE INSERT OR UPDATE OF parent_id ON collections
  FOR EACH ROW
  EXECUTE FUNCTION prevent_circular_collection_reference();

-- ============================================================================
-- UPDATE match_document_chunks to support collection filtering
-- ============================================================================

-- Enhanced version that can filter by collection (including nested)
CREATE OR REPLACE FUNCTION match_document_chunks_in_collections(
  query_embedding vector(768),
  collection_ids uuid[] DEFAULT NULL,
  include_nested boolean DEFAULT true,
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5,
  user_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_title text,
  content text,
  page_number int,
  similarity float,
  collection_id uuid,
  collection_name text
)
LANGUAGE plpgsql
AS $$
DECLARE
  expanded_collection_ids uuid[];
BEGIN
  -- If include_nested is true, expand collection_ids to include all descendants
  IF include_nested AND collection_ids IS NOT NULL THEN
    SELECT ARRAY_AGG(DISTINCT descendant_id)
    INTO expanded_collection_ids
    FROM (
      SELECT id AS descendant_id FROM collections WHERE id = ANY(collection_ids)
      UNION ALL
      SELECT g.id FROM collections c
      CROSS JOIN LATERAL get_descendant_collection_ids(c.id) g
      WHERE c.id = ANY(collection_ids)
    ) sub;
  ELSE
    expanded_collection_ids := collection_ids;
  END IF;

  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    d.title as document_title,
    dc.content,
    dc.page_number,
    1 - (dc.embedding <=> query_embedding) as similarity,
    cd.collection_id,
    col.name as collection_name
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  LEFT JOIN collection_documents cd ON d.id = cd.document_id
  LEFT JOIN collections col ON cd.collection_id = col.id
  WHERE
    (user_id_filter IS NULL OR d.user_id = user_id_filter)
    AND (expanded_collection_ids IS NULL OR cd.collection_id = ANY(expanded_collection_ids))
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN collections.parent_id IS 'Parent collection ID for nested structure (NULL = root level)';
COMMENT ON COLUMN collections.sort_order IS 'Custom sort order within same parent';
COMMENT ON COLUMN collections.is_expanded IS 'UI state: whether folder is expanded in tree view';
COMMENT ON FUNCTION get_descendant_collection_ids IS 'Returns all descendant collection IDs (recursive)';
COMMENT ON FUNCTION prevent_circular_collection_reference IS 'Prevents circular references in collection hierarchy';
COMMENT ON FUNCTION match_document_chunks_in_collections IS 'Semantic search with collection filtering (supports nested)';
