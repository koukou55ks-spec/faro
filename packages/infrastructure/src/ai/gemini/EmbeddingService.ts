import { GoogleGenerativeAI } from '@google/generative-ai'
import { IEmbeddingService, EmbeddingResult } from '@faro/core'

export class GeminiEmbeddingService implements IEmbeddingService {
  private genAI: GoogleGenerativeAI
  private readonly model: string = 'text-embedding-004'

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const model = this.genAI.getGenerativeModel({ model: this.model })
    const result = await model.embedContent(text)

    return {
      embedding: result.embedding.values,
      model: this.model,
    }
  }

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const model = this.genAI.getGenerativeModel({ model: this.model })

    const results = await Promise.all(
      texts.map(async (text) => {
        const result = await model.embedContent(text)
        return {
          embedding: result.embedding.values,
          model: this.model,
        }
      })
    )

    return results
  }
}
