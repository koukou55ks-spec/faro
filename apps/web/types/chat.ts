export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  streaming?: boolean
  expertMode?: boolean
}

export interface ChatResponse {
  response: string
  answer: string
  expert_mode?: boolean
  sources?: Source[]
  confidence?: number
  processing_time?: number
  timestamp?: string
}

export interface Source {
  title: string
  url: string
  relevance: number
}
