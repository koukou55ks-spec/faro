import { SupabaseClient } from '@supabase/supabase-js'
import { IVectorStore, VectorDocument, SearchResult } from '@faro/core'

export class PgVectorStore implements IVectorStore {
  constructor(private readonly client: SupabaseClient) {}

  async upsert(documents: VectorDocument[]): Promise<void> {
    const data = documents.map((doc) => ({
      id: doc.id,
      content: doc.content,
      embedding: doc.embedding,
      metadata: doc.metadata,
    }))

    const { error } = await this.client.from('documents').upsert(data)

    if (error) {
      throw new Error(`Failed to upsert documents: ${error.message}`)
    }
  }

  async search(queryEmbedding: number[], limit: number, filter?: Record<string, unknown>): Promise<SearchResult[]> {
    // Use pgvector's cosine similarity search
    const { data, error } = await this.client.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
      filter_metadata: filter || {},
    })

    if (error) {
      throw new Error(`Failed to search documents: ${error.message}`)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      content: row.content,
      similarity: row.similarity,
      metadata: row.metadata,
    }))
  }

  async delete(ids: string[]): Promise<void> {
    const { error } = await this.client.from('documents').delete().in('id', ids)

    if (error) {
      throw new Error(`Failed to delete documents: ${error.message}`)
    }
  }
}
