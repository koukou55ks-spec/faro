export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  tags?: string[]
  category?: string
  created_at: string
  updated_at: string
}

export interface NoteCreateRequest {
  user_id: string
  title: string
  content: string
  tags?: string[]
  category?: string
}
