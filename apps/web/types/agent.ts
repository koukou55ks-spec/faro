// エージェント機能の型定義

export type SuggestionType =
  | 'tax_deadline' // 税金の期限
  | 'deduction_opportunity' // 控除のチャンス
  | 'life_event_reminder' // ライフイベントの注意喚起
  | 'optimization_tip' // 最適化のヒント
  | 'document_reminder' // 書類の準備提案
  | 'news_alert' // 税制改正などのニュース

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type SuggestionStatus = 'pending' | 'viewed' | 'acted' | 'dismissed'

export interface AgentSuggestion {
  id: string
  user_id: string
  suggestion_type: SuggestionType
  title: string
  message: string
  action_url?: string // アクション先のURL
  priority: Priority
  status: SuggestionStatus
  confidence_score?: number // AIの確信度 (0-1)
  reasoning?: string // 提案理由
  metadata?: Record<string, any>
  created_at: string
  expires_at?: string
  acted_at?: string
  dismissed_at?: string
}

export interface AgentSuggestionCreateRequest {
  suggestion_type: SuggestionType
  title: string
  message: string
  action_url?: string
  priority?: Priority
  confidence_score?: number
  reasoning?: string
  metadata?: Record<string, any>
  expires_at?: string
}

export interface AgentSuggestionUpdateRequest {
  status?: SuggestionStatus
  acted_at?: string
  dismissed_at?: string
}

// エージェント分析結果の型
export interface AgentAnalysisResult {
  user_context: {
    profile_completeness: number
    recent_concerns: string[]
    upcoming_events: string[]
    financial_status: string
  }
  suggestions: AgentSuggestion[]
  insights: {
    tax_savings_potential: number
    recommended_actions: string[]
    risk_alerts: string[]
  }
}

// エージェントが生成する提案のテンプレート
export interface SuggestionTemplate {
  type: SuggestionType
  title_template: string
  message_template: string
  condition: (user: any) => boolean // ユーザー情報から判定
  priority: Priority
}
