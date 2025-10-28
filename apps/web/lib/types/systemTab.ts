/**
 * システムタブの型定義
 *
 * 10点満点の型安全性を提供
 */

// ============================================================================
// フィールド型定義
// ============================================================================

export type FieldType =
  | 'text'       // 短いテキスト
  | 'textarea'   // 長いテキスト
  | 'number'     // 数値
  | 'boolean'    // はい/いいえ
  | 'select'     // 選択肢
  | 'date'       // 日付
  | 'file'       // ファイル
  | 'files'      // 複数ファイル

export type FieldImportance = 'critical' | 'high' | 'medium' | 'low'

export interface FieldDefinition {
  key: string                   // フィールドキー（例: annual_income）
  label: string                 // 表示ラベル（例: 年収）
  type: FieldType              // フィールドタイプ
  required?: boolean           // 必須フィールドかどうか
  placeholder?: string         // プレースホルダー
  unit?: string                // 単位（例: 万円、円、%）
  min?: number                 // 最小値（number型の場合）
  max?: number                 // 最大値（number型の場合）
  step?: number                // ステップ（number型の場合）
  options?: string[]           // 選択肢（select型の場合）
  accept?: string              // ファイル形式（file型の場合）
  multiple?: boolean           // 複数選択可能か
  helpText?: string            // ヘルプテキスト
  importance?: FieldImportance // 重要度（Vector検索用）
  validate?: (value: any) => string | null  // カスタムバリデーション
}

// ============================================================================
// システムタブ定義
// ============================================================================

export type SystemTabId = 'basic_info' | 'tax_deductions' | 'documents'

export interface SystemTabDefinition {
  id: SystemTabId
  name: string
  description: string
  icon: string
  locked: boolean  // ユーザーが削除・名前変更できないか
  fields: FieldDefinition[]
  metadata: {
    category: string
    importance: FieldImportance
    tags?: string[]
  }
}

// ============================================================================
// データ型定義
// ============================================================================

export interface SystemTabFieldData {
  id: string
  user_id: string
  tab_id: SystemTabId
  field_key: string
  value: any  // JSONB値
  year?: number
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SystemTabCompletion {
  total_fields: number
  filled_fields: number
  completion_rate: number  // 0-100
}

// ============================================================================
// カスタムタブテンプレート定義
// ============================================================================

export interface CustomTabTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  default_tags: string[]
  fields: FieldDefinition[]
  is_system: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// API リクエスト/レスポンス型
// ============================================================================

export interface UpsertSystemTabFieldRequest {
  tab_id: SystemTabId
  field_key: string
  value: any
  year?: number
  metadata?: Record<string, any>
}

export interface UpsertSystemTabFieldResponse {
  id: string
  success: boolean
}

export interface GetSystemTabDataRequest {
  tab_id: SystemTabId
  year?: number
}

export interface GetSystemTabDataResponse {
  data: Record<string, any>  // field_key → value のマップ
  completion: SystemTabCompletion
}

export interface BatchUpdateSystemTabRequest {
  tab_id: SystemTabId
  fields: Array<{
    field_key: string
    value: any
  }>
  year?: number
}

export interface BatchUpdateSystemTabResponse {
  updated_count: number
  success: boolean
}
