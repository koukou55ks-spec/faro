-- Faro Data Flywheel Schema
-- 財務DNA統合 + 集合知データベース + 行動ログ

-- ============================================
-- User Financial DNA (全財務データ統合)
-- ============================================
CREATE TABLE user_financial_dna (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- ノート（非構造化テキスト）
    notes_text TEXT,
    notes_embedding VECTOR(768), -- Gemini text-embedding-004

    -- 家計簿（構造化データ）
    monthly_income DECIMAL(12, 2),
    monthly_expenses JSONB DEFAULT '{}', -- {"rent": 100000, "food": 60000, ...}
    savings_rate DECIMAL(5, 4), -- 0.32 = 32%

    -- 資産（投資・貯蓄）
    assets JSONB DEFAULT '{}', -- {"nisa": {...}, "savings": 2500000, ...}
    total_assets DECIMAL(15, 2),

    -- 税務状況
    tax_status JSONB DEFAULT '{}', -- {"employment_type": "正社員+副業", ...}
    last_filing_method TEXT, -- "白色申告" or "青色申告"

    -- メタデータ
    persona_hash TEXT, -- 匿名化用ハッシュ "30代_年収600万_副業あり"
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX user_financial_dna_persona_idx ON user_financial_dna(persona_hash);
CREATE INDEX user_financial_dna_embedding_idx ON user_financial_dna
    USING ivfflat (notes_embedding vector_cosine_ops);

-- Row Level Security
ALTER TABLE user_financial_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial DNA"
    ON user_financial_dna FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own financial DNA"
    ON user_financial_dna FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial DNA"
    ON user_financial_dna FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Aggregated Patterns (匿名化された集合知)
-- ============================================
CREATE TABLE aggregated_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_hash TEXT NOT NULL, -- "30代_年収600万_副業あり"

    -- 行動パターン
    action TEXT NOT NULL, -- "青色申告", "NISA開設", "法人化"

    -- 統計データ
    success_count INT DEFAULT 0, -- 成功した人数
    total_count INT DEFAULT 0,   -- 試した人数
    avg_outcome DECIMAL(12, 2),  -- 平均成果（節税額など）

    -- メタデータ
    metadata JSONB DEFAULT '{}', -- {"avg_time_to_complete": "2週間", ...}

    -- 更新日時
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(persona_hash, action)
);

-- Indexes
CREATE INDEX aggregated_patterns_persona_idx ON aggregated_patterns(persona_hash);
CREATE INDEX aggregated_patterns_action_idx ON aggregated_patterns(action);
CREATE INDEX aggregated_patterns_success_rate_idx
    ON aggregated_patterns((success_count::FLOAT / NULLIF(total_count, 0)));

-- Row Level Security (読み取り専用)
ALTER TABLE aggregated_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aggregated patterns"
    ON aggregated_patterns FOR SELECT
    USING (true); -- 匿名化されているので全員が読める

-- ============================================
-- User Behavior Events (行動ログ)
-- ============================================
CREATE TABLE user_behavior_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- イベントタイプ
    event_type TEXT NOT NULL CHECK (event_type IN (
        'query',        -- 質問
        'read',         -- 記事閲覧
        'click',        -- リンククリック
        'dismiss',      -- 提案を無視
        'refine',       -- 質問を言い換え
        'action_taken'  -- 実際に行動（例: NISA口座開設）
    )),

    -- イベント詳細
    topic TEXT,               -- "NISA", "青色申告", "副業"
    query_text TEXT,          -- 質問文（queryの場合）
    duration_seconds INT,     -- 滞在時間
    scroll_depth DECIMAL(5, 4), -- スクロール深度 0.0-1.0
    target_url TEXT,          -- クリック先URL

    -- メタデータ
    metadata JSONB DEFAULT '{}',

    -- タイムスタンプ
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX user_behavior_events_user_id_idx ON user_behavior_events(user_id);
CREATE INDEX user_behavior_events_type_idx ON user_behavior_events(event_type);
CREATE INDEX user_behavior_events_topic_idx ON user_behavior_events(topic);
CREATE INDEX user_behavior_events_timestamp_idx ON user_behavior_events(timestamp DESC);

-- Row Level Security
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
    ON user_behavior_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
    ON user_behavior_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Functions: Persona Vectorization
-- ============================================

-- ユーザーのペルソナベクトルを生成
CREATE OR REPLACE FUNCTION generate_persona_vector(p_user_id UUID)
RETURNS VECTOR(768) AS $$
DECLARE
    v_dna RECORD;
    v_vector VECTOR(768);
BEGIN
    -- user_financial_dnaからデータ取得
    SELECT * INTO v_dna FROM user_financial_dna WHERE user_id = p_user_id;

    IF v_dna IS NULL THEN
        RETURN NULL;
    END IF;

    -- notes_embeddingを返す（実際は複数要素の平均などで合成）
    RETURN v_dna.notes_embedding;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Functions: Similar Users Search
-- ============================================

-- 類似ユーザーを検索（協調フィルタリング）
CREATE OR REPLACE FUNCTION search_similar_users(
    query_user_id UUID,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 100
)
RETURNS TABLE (
    user_id UUID,
    persona_hash TEXT,
    similarity FLOAT,
    monthly_income DECIMAL,
    assets JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dna.user_id,
        dna.persona_hash,
        1 - (dna.notes_embedding <=> (
            SELECT notes_embedding
            FROM user_financial_dna
            WHERE user_id = query_user_id
        )) AS similarity,
        dna.monthly_income,
        dna.assets
    FROM user_financial_dna dna
    WHERE dna.user_id != query_user_id
      AND dna.notes_embedding IS NOT NULL
      AND 1 - (dna.notes_embedding <=> (
          SELECT notes_embedding
          FROM user_financial_dna
          WHERE user_id = query_user_id
      )) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Functions: Success Patterns Aggregation
-- ============================================

-- 特定ペルソナの成功パターンを集計
CREATE OR REPLACE FUNCTION get_success_patterns(p_persona_hash TEXT)
RETURNS TABLE (
    action TEXT,
    success_rate FLOAT,
    avg_outcome DECIMAL,
    sample_size INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap.action,
        (ap.success_count::FLOAT / NULLIF(ap.total_count, 0)) AS success_rate,
        ap.avg_outcome,
        ap.total_count AS sample_size
    FROM aggregated_patterns ap
    WHERE ap.persona_hash = p_persona_hash
    ORDER BY success_rate DESC, sample_size DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_financial_dna_updated_at
    BEFORE UPDATE ON user_financial_dna
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aggregated_patterns_updated_at
    BEFORE UPDATE ON aggregated_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE user_financial_dna IS
'ユーザーの全財務データを統合。ノート、家計簿、資産、税務状況を一元管理。';

COMMENT ON TABLE aggregated_patterns IS
'匿名化された集合知データベース。個人特定不可能なペルソナごとの成功パターンを蓄積。';

COMMENT ON TABLE user_behavior_events IS
'ユーザーの行動ログ。クエリ、閲覧、クリック、滞在時間などを記録し、暗黙学習に利用。';

COMMENT ON FUNCTION search_similar_users IS
'協調フィルタリング: ベクトル類似度で似たユーザーを検索';

COMMENT ON FUNCTION get_success_patterns IS
'特定ペルソナの成功パターンを集計。「92%が青色申告で平均14.8万円節税」のような統計を生成。';
