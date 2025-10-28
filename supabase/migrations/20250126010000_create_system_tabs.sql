-- ============================================================================
-- システムタブ機能: 構造化データ管理
-- ============================================================================
-- 目的: 必須情報を確実に取得し、Vector RAGの精度を最大化
-- 設計: 正規化 + パフォーマンス最適化 + RLS完備
-- ============================================================================

-- ============================================================================
-- 1. system_tab_data テーブル
-- ============================================================================
-- 各ユーザーのシステムタブフィールドデータを保存
CREATE TABLE IF NOT EXISTS system_tab_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tab_id TEXT NOT NULL,           -- 'basic_info', 'tax_deductions', 'documents'
  field_key TEXT NOT NULL,        -- 'annual_income', 'has_spouse', etc.
  value JSONB NOT NULL,           -- 柔軟な値保存（数値、文字列、ブール、ファイルURL等）
  year INT,                       -- 年度ごとのデータ管理（nullの場合は最新）
  metadata JSONB DEFAULT '{}',    -- 追加メタデータ（単位、重要度など）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ユニーク制約: 同一ユーザー・同一タブ・同一フィールド・同一年度は1レコードのみ
  CONSTRAINT unique_system_tab_field UNIQUE(user_id, tab_id, field_key, year)
);

-- インデックス
CREATE INDEX idx_system_tab_data_user_id ON system_tab_data(user_id);
CREATE INDEX idx_system_tab_data_tab_id ON system_tab_data(tab_id);
CREATE INDEX idx_system_tab_data_year ON system_tab_data(year) WHERE year IS NOT NULL;
CREATE INDEX idx_system_tab_data_field_key ON system_tab_data(field_key);
CREATE INDEX idx_system_tab_data_created_at ON system_tab_data(created_at DESC);

-- RLS有効化
ALTER TABLE system_tab_data ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own system tab data"
  ON system_tab_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own system tab data"
  ON system_tab_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own system tab data"
  ON system_tab_data
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own system tab data"
  ON system_tab_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_atトリガー
CREATE TRIGGER update_system_tab_data_updated_at
  BEFORE UPDATE ON system_tab_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. custom_tab_templates テーブル（改善版カスタムタブ）
-- ============================================================================
-- カスタムタブのテンプレート情報を管理
CREATE TABLE IF NOT EXISTS custom_tab_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                   -- テンプレート名（例: '投資管理', '経費管理'）
  description TEXT,                     -- テンプレートの説明
  icon TEXT DEFAULT '📝',               -- アイコン
  category TEXT,                        -- カテゴリ（Vector検索用）
  default_tags TEXT[] DEFAULT '{}',     -- デフォルトタグ
  fields JSONB NOT NULL DEFAULT '[]',   -- フィールド定義
  is_system BOOLEAN DEFAULT FALSE,      -- システム提供テンプレートかどうか
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- システム提供テンプレートを挿入
INSERT INTO custom_tab_templates (name, description, icon, category, default_tags, fields, is_system) VALUES
  (
    '自由記入',
    'メモや自由な情報を記録',
    '📝',
    'custom_tab',
    ARRAY['メモ'],
    '[{"key":"content","label":"内容","type":"textarea"}]'::jsonb,
    true
  ),
  (
    '投資管理',
    '株・投資信託の記録',
    '📈',
    'investment',
    ARRAY['投資', 'NISA', '株'],
    '[
      {"key":"asset_name","label":"銘柄名","type":"text","required":true},
      {"key":"asset_type","label":"種別","type":"select","options":["株式","投資信託","ETF","債券","その他"],"required":true},
      {"key":"purchase_price","label":"購入価格","type":"number","unit":"円"},
      {"key":"quantity","label":"数量","type":"number"},
      {"key":"purchase_date","label":"購入日","type":"date"},
      {"key":"current_value","label":"現在価値","type":"number","unit":"円"},
      {"key":"notes","label":"備考","type":"textarea"}
    ]'::jsonb,
    true
  ),
  (
    '経費管理',
    '自営業・フリーランス向け経費記録',
    '💼',
    'business_expense',
    ARRAY['経費', '確定申告', '青色申告'],
    '[
      {"key":"expense_type","label":"経費種別","type":"select","options":["交通費","通信費","消耗品費","広告費","接待交際費","外注費","その他"],"required":true},
      {"key":"amount","label":"金額","type":"number","unit":"円","required":true},
      {"key":"date","label":"日付","type":"date","required":true},
      {"key":"description","label":"内容","type":"text","required":true},
      {"key":"receipt","label":"領収書","type":"file"},
      {"key":"payment_method","label":"支払方法","type":"select","options":["現金","クレジットカード","銀行振込","電子マネー"]}
    ]'::jsonb,
    true
  ),
  (
    '医療費記録',
    '医療費控除のための記録',
    '🏥',
    'deduction',
    ARRAY['医療費控除', '確定申告'],
    '[
      {"key":"medical_institution","label":"医療機関","type":"text","required":true},
      {"key":"patient_name","label":"患者名","type":"text","required":true},
      {"key":"amount","label":"金額","type":"number","unit":"円","required":true},
      {"key":"date","label":"日付","type":"date","required":true},
      {"key":"treatment_type","label":"治療内容","type":"select","options":["診察","薬代","入院","手術","その他"]},
      {"key":"receipt","label":"領収書","type":"file"}
    ]'::jsonb,
    true
  ),
  (
    '不動産情報',
    '住宅ローン・賃貸等の不動産情報',
    '🏠',
    'housing',
    ARRAY['住宅ローン', '不動産'],
    '[
      {"key":"property_type","label":"種別","type":"select","options":["持ち家（ローンあり）","持ち家（ローンなし）","賃貸"],"required":true},
      {"key":"loan_balance","label":"ローン残高","type":"number","unit":"万円"},
      {"key":"monthly_payment","label":"月額支払","type":"number","unit":"円"},
      {"key":"loan_start_date","label":"ローン開始日","type":"date"},
      {"key":"interest_rate","label":"金利","type":"number","unit":"%"},
      {"key":"address","label":"住所","type":"text"}
    ]'::jsonb,
    true
  );

-- インデックス
CREATE INDEX idx_custom_tab_templates_category ON custom_tab_templates(category);
CREATE INDEX idx_custom_tab_templates_is_system ON custom_tab_templates(is_system);

-- updated_atトリガー
CREATE TRIGGER update_custom_tab_templates_updated_at
  BEFORE UPDATE ON custom_tab_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. user_custom_tabs テーブル（拡張版）
-- ============================================================================
-- 既存のuser_custom_tabsを拡張（テンプレート参照を追加）
ALTER TABLE user_custom_tabs
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES custom_tab_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_user_custom_tabs_template_id ON user_custom_tabs(template_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_tabs_category ON user_custom_tabs(category);

-- ============================================================================
-- 4. ビュー: user_all_tabs（システムタブ + カスタムタブの統合ビュー）
-- ============================================================================
CREATE OR REPLACE VIEW user_all_tabs AS
SELECT
  'system' AS tab_type,
  id,
  user_id,
  tab_id AS identifier,
  NULL::UUID AS template_id,
  NULL::TEXT AS name,
  NULL::TEXT AS description,
  metadata,
  created_at,
  updated_at
FROM system_tab_data
UNION ALL
SELECT
  'custom' AS tab_type,
  id,
  user_id,
  id::TEXT AS identifier,
  template_id,
  name,
  description,
  '{}'::jsonb AS metadata,
  created_at,
  updated_at
FROM user_custom_tabs;

-- ============================================================================
-- 5. 関数: get_system_tab_completion（タブの入力完成度を取得）
-- ============================================================================
CREATE OR REPLACE FUNCTION get_system_tab_completion(
  p_user_id UUID,
  p_tab_id TEXT,
  p_required_fields TEXT[]  -- 必須フィールドのリスト
)
RETURNS TABLE (
  total_fields INT,
  filled_fields INT,
  completion_rate FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_filled_count INT;
  v_total_count INT;
BEGIN
  -- 必須フィールドの総数
  v_total_count := array_length(p_required_fields, 1);

  -- 入力済みフィールドの数
  SELECT COUNT(*)
  INTO v_filled_count
  FROM system_tab_data
  WHERE user_id = p_user_id
    AND tab_id = p_tab_id
    AND field_key = ANY(p_required_fields)
    AND value IS NOT NULL
    AND value::text != 'null'
    AND value::text != '""'
    AND value::text != '{}';

  RETURN QUERY SELECT
    v_total_count,
    v_filled_count,
    CASE
      WHEN v_total_count > 0 THEN (v_filled_count::FLOAT / v_total_count::FLOAT) * 100
      ELSE 0
    END;
END;
$$;

-- ============================================================================
-- 6. 関数: upsert_system_tab_field（システムタブフィールドの更新/挿入）
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_system_tab_field(
  p_user_id UUID,
  p_tab_id TEXT,
  p_field_key TEXT,
  p_value JSONB,
  p_year INT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- UPSERT
  INSERT INTO system_tab_data (user_id, tab_id, field_key, value, year, metadata)
  VALUES (p_user_id, p_tab_id, p_field_key, p_value, p_year, p_metadata)
  ON CONFLICT (user_id, tab_id, field_key, year)
  DO UPDATE SET
    value = EXCLUDED.value,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ============================================================================
-- コメント（ドキュメンテーション）
-- ============================================================================
COMMENT ON TABLE system_tab_data IS 'システム定義タブのフィールドデータ（構造化情報）';
COMMENT ON TABLE custom_tab_templates IS 'カスタムタブのテンプレート定義';
COMMENT ON COLUMN system_tab_data.tab_id IS 'システムタブID: basic_info, tax_deductions, documents';
COMMENT ON COLUMN system_tab_data.field_key IS 'フィールドキー（例: annual_income, has_spouse）';
COMMENT ON COLUMN system_tab_data.value IS 'フィールド値（JSONB形式で柔軟に保存）';
COMMENT ON COLUMN system_tab_data.year IS '年度（nullの場合は最新・年度無関係）';
COMMENT ON FUNCTION get_system_tab_completion IS 'システムタブの入力完成度を計算';
COMMENT ON FUNCTION upsert_system_tab_field IS 'システムタブフィールドの更新/挿入（重複時は更新）';
