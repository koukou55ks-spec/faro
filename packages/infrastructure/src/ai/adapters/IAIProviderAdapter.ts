import { GenerateResponseOptions, GenerateResponseResult } from '@faro/core'

/**
 * AI Provider Adapter Interface
 * すべてのAIプロバイダーはこのインターフェースを実装する
 */
export interface IAIProviderAdapter {
  /**
   * プロバイダー名（例: 'gemini', 'openai', 'claude'）
   */
  readonly name: string

  /**
   * 非ストリーミングレスポンス生成
   */
  generateResponse(options: GenerateResponseOptions): Promise<GenerateResponseResult>

  /**
   * ストリーミングレスポンス生成
   */
  streamResponse(options: GenerateResponseOptions): AsyncGenerator<string, void, unknown>

  /**
   * プロバイダーが利用可能かチェック
   */
  isAvailable(): Promise<boolean>
}
