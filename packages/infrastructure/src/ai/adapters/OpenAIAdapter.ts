import { GenerateResponseOptions, GenerateResponseResult, AIMessage } from '@faro/core'
import { IAIProviderAdapter } from './IAIProviderAdapter'

export class OpenAIAdapter implements IAIProviderAdapter {
  readonly name = 'openai'
  private readonly apiKey: string
  private readonly model: string = 'gpt-4o-mini'
  private readonly baseURL: string = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async generateResponse(options: GenerateResponseOptions): Promise<GenerateResponseResult> {
    const messages = this.convertMessages(options.conversationHistory, options.systemPrompt)

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json() as any

    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens ?? 0,
      model: this.model,
    }
  }

  async *streamResponse(options: GenerateResponseOptions): AsyncGenerator<string, void, unknown> {
    const messages = this.convertMessages(options.conversationHistory, options.systemPrompt)

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
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
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  private convertMessages(messages: AIMessage[], systemPrompt?: string) {
    const result: Array<{ role: string; content: string }> = []

    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt })
    }

    for (const msg of messages) {
      result.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })
    }

    return result
  }
}
