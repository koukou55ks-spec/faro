// ソース管理システムの型定義

export type SourceType = 'required' | 'document' | 'note'

export type SourceStatus = 'empty' | 'partial' | 'complete'

// ソースアイテム
export interface Source {
  id: string
  name: string
  type: SourceType
  status: SourceStatus
  completion?: number // 0-100%
  usage: string // どこで使われるか
  value?: string // ユーザーへの価値提示
  createdAt: string
  updatedAt: string
}

// 必須ソース（基本プロファイル）
export interface RequiredSource extends Source {
  type: 'required'
  fields: RequiredField[]
  missingFields: RequiredField[]
  impact: string[] // 完成時のメリット
}

export interface RequiredField {
  key: string
  label: string
  value: any
  required: boolean
  missing: boolean
  impact?: string // このフィールドによる効果
  type: 'text' | 'number' | 'select' | 'date'
  options?: string[]
  unit?: string
}

// ドキュメントソース
export interface DocumentSource extends Source {
  type: 'document'
  fileName: string
  fileUrl: string
  fileType: string
  extractedData: ExtractedField[]
  uploadedAt: string
}

export interface ExtractedField {
  key: string
  label: string
  value: any
  confidence: number // 0-1
}

// ノートソース
export interface NoteSource extends Source {
  type: 'note'
  content: string
  tags: string[]
  itemCount?: number
}

// チャットで参照されたソース
export interface SourceReference {
  sourceId: string
  sourceName: string
  sourceType: SourceType
  fieldsUsed: string[]
  timestamp: string
}

// コンテキスト解析結果
export interface ContextAnalysis {
  requiredFields: string[]
  availableSources: Source[]
  missingSources: MissingSource[]
  confidence: number // 0-1
}

export interface MissingSource {
  name: string
  reason: string
  impact: string
}

// プロファイル完成度
export interface ProfileCompletion {
  percentage: number
  completedFields: number
  totalFields: number
  nextStep: {
    field: string
    reason: string
    value: string
  }
  potentialValue: string // "年10万円の節税可能性"
}
