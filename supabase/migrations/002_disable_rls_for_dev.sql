-- Temporary: Disable RLS for development
-- This allows guest users (unauthenticated) to use the chat feature
-- TODO: Re-enable RLS in production with proper policies

ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
