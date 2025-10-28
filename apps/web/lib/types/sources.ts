// Sources管理システムの型定義 v5.0

// プリセットカテゴリ
export const PRESET_CATEGORIES = [
  '収入',
  '控除',
  '医療費',
  '保険',
  '資産',
  '負債',
  'その他'
] as const

export type PresetCategory = typeof PRESET_CATEGORIES[number]

// ソースのタイプ
export type SourceType = 'text' | 'number' | 'document' | 'link' | 'structured'

// AI参照優先度
export type AIPriority = 'always' | 'on_demand' | 'manual'

// ソースのコンテンツ型
export interface SourceContent {
  // text type
  text?: string

  // number type
  number?: {
    value: number
    unit?: string
  }

  // document type
  document?: {
    file_name: string
    file_url: string
    file_type: string
    extracted_data?: Record<string, any>
  }

  // link type
  link?: {
    url: string
    title?: string
    description?: string
  }

  // structured type (フィールド・バリューのペア)
  structured?: Record<string, any>
}

// ソース
export interface Source {
  id: string
  user_id: string
  title: string
  category: string // PresetCategory or custom category name
  type: SourceType
  content: SourceContent
  tags: string[]
  ai_priority: AIPriority
  created_at: string
  updated_at: string
}

// カスタムカテゴリ
export interface CustomCategory {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
  updated_at: string
}

// ソース作成用の型
export interface CreateSourceInput {
  title: string
  category: string
  type: SourceType
  content: SourceContent
  tags?: string[]
  ai_priority?: AIPriority
}

// ソース更新用の型
export interface UpdateSourceInput {
  title?: string
  category?: string
  type?: SourceType
  content?: SourceContent
  tags?: string[]
  ai_priority?: AIPriority
}

// カスタムカテゴリ作成用の型
export interface CreateCustomCategoryInput {
  name: string
  color?: string
  icon?: string
}

// 基本プロファイル（最小限の固定項目）
export interface BasicProfile {
  annual_income: number | null      // 年収
  age: number | null                // 年齢
  prefecture: string | null         // 都道府県
  family_size: number | null        // 家族人数
  employment_type: string | null    // 雇用形態
}

// フィルター設定
export interface SourceFilters {
  categories?: string[]
  tags?: string[]
  types?: SourceType[]
  search?: string
}
