// ユーザー設定の型定義
export interface UserSettings {
  id: string
  user_id: string

  // 表示設定
  theme: 'light' | 'dark' | 'system'
  language: 'ja' | 'en'
  font_size: 'small' | 'medium' | 'large'
  color_scheme: 'purple' | 'blue' | 'green' | 'orange'

  // 通知設定
  email_notifications: boolean
  push_notifications: boolean
  notification_digest: boolean
  notify_ai_response: boolean
  notify_new_features: boolean
  notify_tax_deadline: boolean
  notify_tips: boolean

  // プライバシー設定
  profile_visibility: 'public' | 'private'
  data_sharing: boolean
  analytics_enabled: boolean

  // セキュリティ設定
  two_factor_enabled: boolean
  session_timeout: number

  // アプリ設定
  auto_save: boolean
  show_onboarding: boolean
  compact_view: boolean

  created_at: string
  updated_at: string
}

// 設定の更新用部分型
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

// ログイン履歴の型定義
export interface LoginHistory {
  id: string
  user_id: string
  login_at: string
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
  location: string | null
  success: boolean
  created_at: string
}

// アクティブセッションの型定義
export interface ActiveSession {
  id: string
  user_id: string
  session_token: string
  device_name: string | null
  device_type: string | null
  ip_address: string | null
  user_agent: string | null
  last_activity: string
  expires_at: string
  created_at: string
}

// 設定セクション定義
export type SettingsSection =
  | 'account'       // アカウント設定
  | 'appearance'    // 表示設定
  | 'notifications' // 通知設定
  | 'privacy'       // プライバシー設定
  | 'security'      // セキュリティ設定
  | 'app'           // アプリ設定
  | 'about'         // アプリ情報

// テーマオプション
export const THEME_OPTIONS = [
  { value: 'light', label: 'ライトモード', icon: '☀️' },
  { value: 'dark', label: 'ダークモード', icon: '🌙' },
  { value: 'system', label: 'システム設定', icon: '⚙️' },
] as const

// 言語オプション
export const LANGUAGE_OPTIONS = [
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
] as const

// フォントサイズオプション
export const FONT_SIZE_OPTIONS = [
  { value: 'small', label: '小', size: 14 },
  { value: 'medium', label: '中', size: 16 },
  { value: 'large', label: '大', size: 18 },
] as const

// カラースキームオプション
export const COLOR_SCHEME_OPTIONS = [
  { value: 'purple', label: 'パープル', gradient: 'from-purple-500 to-blue-600' },
  { value: 'blue', label: 'ブルー', gradient: 'from-blue-500 to-cyan-600' },
  { value: 'green', label: 'グリーン', gradient: 'from-green-500 to-emerald-600' },
  { value: 'orange', label: 'オレンジ', gradient: 'from-orange-500 to-red-600' },
] as const

// デフォルト設定値
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'system',
  language: 'ja',
  font_size: 'medium',
  color_scheme: 'purple',
  email_notifications: true,
  push_notifications: true,
  notification_digest: true,
  notify_ai_response: true,
  notify_new_features: true,
  notify_tax_deadline: true,
  notify_tips: true,
  profile_visibility: 'private',
  data_sharing: false,
  analytics_enabled: true,
  two_factor_enabled: false,
  session_timeout: 7200,
  auto_save: true,
  show_onboarding: true,
  compact_view: false,
}
