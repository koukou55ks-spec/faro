export interface EmbeddingResult {
  embedding: number[]
  model: string
}

export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<EmbeddingResult>
  generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>
}
