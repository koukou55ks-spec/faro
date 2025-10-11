import { GenerateResponseOptions, GenerateResponseResult, Message } from '@faro/core'
import { IAIProviderAdapter } from './IAIProviderAdapter'

export class ClaudeAdapter implements IAIProviderAdapter {
  readonly name = 'claude'
  private readonly apiKey: string
  private readonly model: string = 'claude-3-5-haiku-20241022'
  private readonly baseURL: string = 'https://api.anthropic.com/v1'
  private readonly apiVersion: string = '2023-06-01'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  async generateResponse(options: GenerateResponseOptions): Promise<GenerateResponseResult> {
    const messages = this.convertMessages(options.conversationHistory)

    const requestBody: any = {
      model: this.model,
      messages,
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
    }

    if (options.systemPrompt) {
      requestBody.system = options.systemPrompt
    }

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': this.apiVersion,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.content[0].text,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens ?? 0,
      model: this.model,
    }
  }

  async *streamResponse(options: GenerateResponseOptions): AsyncGenerator<string, void, unknown> {
    const messages = this.convertMessages(options.conversationHistory)

    const requestBody: any = {
      model: this.model,
      messages,
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
      stream: true,
    }

    if (options.systemPrompt) {
      requestBody.system = options.systemPrompt
    }

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': this.apiVersion,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((line) => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta') {
              const content = parsed.delta?.text
              if (content) {
                yield content
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  private convertMessages(messages: Message[]) {
    return messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))
  }
}
