// カスタムタブ（NotebookLM風）の型定義

export interface CustomTab {
  id: string
  user_id: string
  name: string
  description?: string
  icon?: string // lucide-react icon name
  color?: string // blue, purple, green, etc.
  display_order: number
  created_at: string
  updated_at: string
}

export interface CustomTabItem {
  id: string
  tab_id: string
  user_id: string
  item_type: 'file' | 'text' | 'link' | 'image'
  title: string
  content?: string // テキストの本文、またはメタデータJSON
  file_url?: string // Supabase Storage URL
  file_type?: string // PDF, CSV, XLSX, PNG, JPEG
  file_size?: number // bytes
  display_order: number
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CustomTabCreateRequest {
  name: string
  description?: string
  icon?: string
  color?: string
  display_order?: number
}

export interface CustomTabUpdateRequest {
  name?: string
  description?: string
  icon?: string
  color?: string
  display_order?: number
}

export interface CustomTabItemCreateRequest {
  tab_id: string
  item_type: 'file' | 'text' | 'link' | 'image'
  title: string
  content?: string
  file_url?: string
  file_type?: string
  file_size?: number
  display_order?: number
  metadata?: Record<string, any>
}

export interface CustomTabItemUpdateRequest {
  title?: string
  content?: string
  display_order?: number
  metadata?: Record<string, any>
}
