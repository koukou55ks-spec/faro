export interface VectorDocument {
  id: string
  content: string
  embedding: number[]
  metadata?: Record<string, unknown>
}

export interface SearchResult {
  id: string
  content: string
  similarity: number
  metadata?: Record<string, unknown>
}

export interface IVectorStore {
  upsert(documents: VectorDocument[]): Promise<void>
  search(queryEmbedding: number[], limit: number, filter?: Record<string, unknown>): Promise<SearchResult[]>
  delete(ids: string[]): Promise<void>
}
