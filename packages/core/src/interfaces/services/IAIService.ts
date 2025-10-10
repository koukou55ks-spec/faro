import { Message } from '../../domain/entities/Message'

export interface GenerateResponseOptions {
  conversationHistory: Message[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface GenerateResponseResult {
  content: string
  tokensUsed: number
  model: string
}

export interface IAIService {
  generateResponse(options: GenerateResponseOptions): Promise<GenerateResponseResult>
  streamResponse(options: GenerateResponseOptions): AsyncGenerator<string, void, unknown>
}
