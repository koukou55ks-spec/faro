// ユーザープロフィール関連の型定義
// Supabase migration: 20251023113248_add_user_profiles.sql に対応

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'freelance'
  | 'self_employed'
  | 'student'
  | 'retired'
  | 'unemployed'

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export type ResidenceType = 'owned' | 'rented' | 'family_owned' | 'company_housing'

export interface UserProfile {
  id: string
  user_id: string

  // 基本情報
  age?: number
  birth_year?: number
  gender?: Gender
  occupation?: string
  industry?: string

  // 経済情報
  annual_income?: number
  household_income?: number
  employment_type?: EmploymentType

  // 家族構成
  marital_status?: MaritalStatus
  num_dependents?: number
  has_children?: boolean
  num_children?: number

  // 居住情報
  prefecture?: string
  city?: string
  residence_type?: ResidenceType

  // 金融状況
  has_mortgage?: boolean
  has_savings?: boolean
  has_investments?: boolean

  // 関心事・目標（AIが参照）
  interests?: string[]  // ["iDeCo", "NISA", "相続", "副業"]
  life_goals?: string[]  // ["老後資金", "住宅購入", "子供の教育費"]
  concerns?: string[]  // ["税金対策", "年金不安", "医療費"]

  // メタデータ
  created_at: string
  updated_at: string
  last_accessed_at: string
}

export type LifeEventType =
  | 'birth'
  | 'marriage'
  | 'divorce'
  | 'child_birth'
  | 'job_change'
  | 'promotion'
  | 'retirement'
  | 'house_purchase'
  | 'house_sale'
  | 'relocation'
  | 'inheritance'
  | 'business_start'
  | 'business_close'
  | 'illness'
  | 'accident'
  | 'other'

export interface UserLifeEvent {
  id: string
  user_id: string
  event_type: LifeEventType
  event_date?: string  // ISO date string
  event_year?: number
  description?: string
  metadata?: Record<string, any>  // {amount: 5000000, property_type: "mansion"}
  auto_detected?: boolean
  confidence_score?: number  // 0-1
  created_at: string
  updated_at: string
}

export interface UserQuestionHistory {
  id: string
  user_id: string
  question: string
  category?: string  // "税金", "年金", "健康保険"
  keywords?: string[]
  detected_life_event?: string
  detected_concerns?: string[]
  asked_at: string
}

export type UserContextContentType = 'chat' | 'note' | 'profile' | 'life_event'

export interface UserContextVector {
  id: string
  user_id: string
  content: string
  content_type: UserContextContentType
  source_id?: string  // 元データのID（chat_id, note_idなど）
  embedding: number[]  // Gemini embedding (768次元)
  metadata?: Record<string, any>
  created_at: string
}

// API用の型

export interface CreateUserProfileRequest {
  age?: number
  birth_year?: number
  gender?: Gender
  occupation?: string
  industry?: string
  annual_income?: number
  household_income?: number
  employment_type?: EmploymentType
  marital_status?: MaritalStatus
  num_dependents?: number
  has_children?: boolean
  num_children?: number
  prefecture?: string
  city?: string
  residence_type?: ResidenceType
  has_mortgage?: boolean
  has_savings?: boolean
  has_investments?: boolean
  interests?: string[]
  life_goals?: string[]
  concerns?: string[]
  // システムタブから統合されたフィールド
  has_spouse?: boolean
  dependents_count?: number
  medical_expenses?: number
  insurance_premium?: number
  donation_amount?: number
}

export interface UpdateUserProfileRequest extends Partial<CreateUserProfileRequest> {}

export interface CreateLifeEventRequest {
  event_type: LifeEventType
  event_date?: string
  event_year?: number
  description?: string
  metadata?: Record<string, any>
}

export interface UpdateLifeEventRequest extends Partial<CreateLifeEventRequest> {}
