-- Fix messages table schema
-- Run this in Supabase SQL Editor

-- Check if user_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'messages'
        AND column_name = 'user_id'
    ) THEN
        -- Add user_id column if it doesn't exist
        ALTER TABLE public.messages
        ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL;

        RAISE NOTICE 'Added user_id column to messages table';
    ELSE
        RAISE NOTICE 'user_id column already exists in messages table';
    END IF;
END $$;

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'messages'
ORDER BY ordinal_position;
