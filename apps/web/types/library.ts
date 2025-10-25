// ライブラリ機能の型定義

export type ContentType = 'article' | 'quiz' | 'simulation' | 'video' | 'infographic'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface LibraryContent {
  id: string
  content_type: ContentType
  title: string
  description?: string
  content: string // 記事本文、クイズJSON、シミュレーション設定
  thumbnail_url?: string
  category: string // "所得税", "住民税", "相続税", "NISA", "iDeCo"
  tags?: string[]
  difficulty?: Difficulty
  view_count: number
  completion_count: number
  average_score?: number
  author_id?: string
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface UserLibraryProgress {
  id: string
  user_id: string
  content_id: string
  status: ProgressStatus
  progress_percentage: number
  score?: number
  result_data?: Record<string, any>
  is_bookmarked: boolean
  user_rating?: number // 1-5
  started_at?: string
  completed_at?: string
  last_accessed_at: string
}

export interface LibraryContentWithProgress extends LibraryContent {
  user_progress?: UserLibraryProgress
}

export interface LibraryContentCreateRequest {
  content_type: ContentType
  title: string
  description?: string
  content: string
  thumbnail_url?: string
  category: string
  tags?: string[]
  difficulty?: Difficulty
  is_published?: boolean
}

export interface UserLibraryProgressUpdateRequest {
  status?: ProgressStatus
  progress_percentage?: number
  score?: number
  result_data?: Record<string, any>
  is_bookmarked?: boolean
  user_rating?: number
}

// ランキング用の型
export interface LibraryRanking {
  overall: LibraryContent[] // 総合ランキング
  by_category: Record<string, LibraryContent[]> // カテゴリ別
  trending: LibraryContent[] // トレンド（最近人気）
  recommended: LibraryContent[] // おすすめ（ユーザー属性ベース）
}

// クイズ用の型
export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number // 正解のインデックス
  explanation?: string
}

export interface QuizContent {
  questions: QuizQuestion[]
  passing_score?: number // 合格点（パーセンテージ）
}

export interface QuizResult {
  answers: number[] // ユーザーの回答
  score: number // スコア（0-100）
  correct_count: number
  total_count: number
  time_spent?: number // 秒
}

// シミュレーション用の型
export interface SimulationInput {
  annual_income?: number
  deductions?: Record<string, number>
  family_members?: number
  [key: string]: any
}

export interface SimulationResult {
  estimated_tax: number
  breakdown: Record<string, number>
  suggestions: string[]
  [key: string]: any
}
