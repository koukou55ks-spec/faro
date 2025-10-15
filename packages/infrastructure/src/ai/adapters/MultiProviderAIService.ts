import { IAIService } from '@faro/core'
import { IAIProviderAdapter } from './IAIProviderAdapter'

/**
 * Multi-Provider AI Service
 * プライマリプロバイダーが失敗した場合、自動的にフォールバックプロバイダーに切り替える
 */
export class MultiProviderAIService implements IAIService {
  private primaryProvider: IAIProviderAdapter
  private fallbackProviders: IAIProviderAdapter[]

  constructor(primaryProvider: IAIProviderAdapter, fallbackProviders: IAIProviderAdapter[] = []) {
    this.primaryProvider = primaryProvider
    this.fallbackProviders = fallbackProviders
  }

  async generateResponse(prompt: string, conversationHistory?: Array<{role: string, content: string}>): Promise<string> {
    // Convert to new format for adapters
    const options = {
      conversationHistory: [...(conversationHistory || []), { role: 'user' as const, content: prompt }],
    }
    const result = await this.generateResponseWithOptions(options)
    return result.content
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // For now, return a dummy embedding
    // TODO: Implement proper embedding generation
    return new Array(768).fill(0).map(() => Math.random())
  }

  private async generateResponseWithOptions(options: any) {
    // Try primary provider first
    try {
      console.log(`[AI] Using primary provider: ${this.primaryProvider.name}`)
      return await this.primaryProvider.generateResponse(options)
    } catch (primaryError) {
      console.error(`[AI] Primary provider (${this.primaryProvider.name}) failed:`, primaryError)

      // Try fallback providers
      for (const fallbackProvider of this.fallbackProviders) {
        try {
          console.log(`[AI] Trying fallback provider: ${fallbackProvider.name}`)
          const isAvailable = await fallbackProvider.isAvailable()

          if (!isAvailable) {
            console.warn(`[AI] Fallback provider (${fallbackProvider.name}) is not available`)
            continue
          }

          return await fallbackProvider.generateResponse(options)
        } catch (fallbackError) {
          console.error(`[AI] Fallback provider (${fallbackProvider.name}) failed:`, fallbackError)
          // Continue to next fallback
        }
      }

      // All providers failed
      throw new Error(
        `All AI providers failed. Primary: ${this.primaryProvider.name}, Fallbacks: ${this.fallbackProviders.map((p) => p.name).join(', ')}`
      )
    }
  }

  async *streamResponse(options: any): AsyncGenerator<string, void, unknown> {
    // Try primary provider first
    try {
      console.log(`[AI] Streaming with primary provider: ${this.primaryProvider.name}`)
      yield* this.primaryProvider.streamResponse(options)
      return
    } catch (primaryError) {
      console.error(`[AI] Primary provider (${this.primaryProvider.name}) stream failed:`, primaryError)

      // Try fallback providers
      for (const fallbackProvider of this.fallbackProviders) {
        try {
          console.log(`[AI] Streaming with fallback provider: ${fallbackProvider.name}`)
          const isAvailable = await fallbackProvider.isAvailable()

          if (!isAvailable) {
            console.warn(`[AI] Fallback provider (${fallbackProvider.name}) is not available`)
            continue
          }

          yield* fallbackProvider.streamResponse(options)
          return
        } catch (fallbackError) {
          console.error(`[AI] Fallback provider (${fallbackProvider.name}) stream failed:`, fallbackError)
          // Continue to next fallback
        }
      }

      // All providers failed
      throw new Error(
        `All AI providers failed for streaming. Primary: ${this.primaryProvider.name}, Fallbacks: ${this.fallbackProviders.map((p) => p.name).join(', ')}`
      )
    }
  }
}
