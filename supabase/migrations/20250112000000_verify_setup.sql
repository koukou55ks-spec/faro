-- Verification migration - ensures all necessary components exist
-- This migration is safe to run on existing databases

-- Ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Add missing columns if they don't exist (safe operations)
DO $$
BEGIN
    -- Add embedding column to messages if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'messages'
        AND column_name = 'embedding'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN embedding vector(768);
    END IF;

    -- Add timestamp column to messages if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'messages'
        AND column_name = 'timestamp'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    -- Messages embedding index
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'messages'
        AND indexname = 'idx_messages_embedding'
    ) THEN
        CREATE INDEX idx_messages_embedding ON public.messages
        USING ivfflat (embedding vector_cosine_ops);
    END IF;

    -- Messages timestamp index
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'messages'
        AND indexname = 'idx_messages_timestamp'
    ) THEN
        CREATE INDEX idx_messages_timestamp ON public.messages(timestamp DESC);
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database verification complete!';
END $$;
