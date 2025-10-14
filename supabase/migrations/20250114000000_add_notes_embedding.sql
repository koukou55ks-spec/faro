-- Add embedding column to notes table for AI context understanding
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for vector similarity search on notes
CREATE INDEX IF NOT EXISTS idx_notes_embedding ON public.notes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to search similar notes (like match_messages for messages)
CREATE OR REPLACE FUNCTION public.match_notes(
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    user_id_filter uuid
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    tags text[],
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        notes.id,
        notes.title,
        notes.content,
        notes.tags,
        1 - (notes.embedding <=> query_embedding) as similarity
    FROM notes
    WHERE notes.user_id = user_id_filter
        AND notes.embedding IS NOT NULL
        AND 1 - (notes.embedding <=> query_embedding) > match_threshold
    ORDER BY notes.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Add comment for documentation
COMMENT ON COLUMN public.notes.embedding IS 'Gemini text-embedding-004 vector (768 dimensions) for semantic search';
