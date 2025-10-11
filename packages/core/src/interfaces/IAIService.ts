export interface IAIService {
  generateResponse(prompt: string, conversationHistory?: Array<{role: string, content: string}>): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}
