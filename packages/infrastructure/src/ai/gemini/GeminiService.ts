import { GoogleGenerativeAI } from '@google/generative-ai'
import { IAIService, GenerateResponseOptions, GenerateResponseResult, Message } from '@faro/core'

export class GeminiService implements IAIService {
  private genAI: GoogleGenerativeAI
  private readonly model: string = 'gemini-2.0-flash-exp'

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateResponse(options: GenerateResponseOptions): Promise<GenerateResponseResult> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: {
        parts: [{ text: options.systemPrompt }],
        role: "user"
      }
    })

    const history = this.convertMessagesToHistory(options.conversationHistory)
    const lastMessage = options.conversationHistory[options.conversationHistory.length - 1]

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    })

    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    const content = response.text()

    return {
      content,
      tokensUsed: 0, // Gemini doesn't provide token count in the same way
      model: this.model,
    }
  }

  async *streamResponse(options: GenerateResponseOptions): AsyncGenerator<string, void, unknown> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: {
        parts: [{ text: options.systemPrompt }],
        role: "user"
      }
    })

    const history = this.convertMessagesToHistory(options.conversationHistory)
    const lastMessage = options.conversationHistory[options.conversationHistory.length - 1]

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    })

    const result = await chat.sendMessageStream(lastMessage.content)

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      yield chunkText
    }
  }

  private convertMessagesToHistory(messages: Message[]) {
    // Exclude the last message as it will be sent separately
    return messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))
  }
}
