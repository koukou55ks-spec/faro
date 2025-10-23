-- ==========================================
-- Phase 1: 外部キー制約の修正
-- すべてのテーブルをauth.users直接参照に変更
-- ==========================================

-- 1. conversationsテーブルの修正
ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 2. messagesテーブルの修正
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 3. notesテーブルの修正
ALTER TABLE public.notes
  DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

ALTER TABLE public.notes
  ADD CONSTRAINT notes_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 4. transactionsテーブルの修正
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 5. profilesテーブルをシンプル化（既存データを保持）
-- 外部キー制約はすでにauth.usersを参照しているので変更不要

-- 6. ベクトル検索用のインデックスを最適化
CREATE INDEX IF NOT EXISTS idx_messages_embedding
  ON public.messages
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100)
  WHERE embedding IS NOT NULL;

-- 7. パフォーマンス向上のためのインデックス追加
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
  ON public.conversations(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages(conversation_id, created_at DESC);

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ 外部キー制約の修正が完了しました';
  RAISE NOTICE '  - conversations: auth.users参照に変更';
  RAISE NOTICE '  - messages: auth.users参照に変更';
  RAISE NOTICE '  - notes: auth.users参照に変更';
  RAISE NOTICE '  - transactions: auth.users参照に変更';
  RAISE NOTICE '  - パフォーマンスインデックス追加完了';
END $$;