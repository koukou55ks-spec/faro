/**
 * User Knowledge Base - Claude Code-level Vector RAG Implementation
 *
 * ユーザーの膨大な情報（プロフィール、税務書類、チャット履歴など）を
 * ベクトル埋め込みとして保存し、必要な情報だけを選択的に取得する。
 *
 * Features:
 * - Vector embeddings using Gemini text-embedding-004
 * - Metadata filtering (type, category, year)
 * - Semantic similarity search
 * - Automatic indexing on data updates
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

export interface KnowledgeDocument {
  id: string
  content: string
  metadata: DocumentMetadata
  similarity?: number
  created_at: string
}

export interface DocumentMetadata {
  type: DocumentType
  category?: string
  year?: number
  source?: string
  importance?: 'critical' | 'high' | 'medium' | 'low'
  tags?: string[]
}

export type DocumentType =
  | 'profile'           // プロフィール情報
  | 'tax_doc'          // 税務書類
  | 'qa_history'       // 過去の質問・回答
  | 'simulation'       // シミュレーション結果
  | 'custom_tab'       // カスタムタブ
  | 'uploaded_file'    // アップロードファイル
  | 'system'           // システム情報

export interface SearchFilters {
  types?: DocumentType[]
  category?: string
  year?: number
  limit?: number
  similarityThreshold?: number
}

export class UserKnowledgeBase {
  private supabase: SupabaseClient
  private genAI: GoogleGenerativeAI
  private embedModel: GenerativeModel

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY not found')
    }

    this.genAI = new GoogleGenerativeAI(geminiKey)
    this.embedModel = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    })
  }

  /**
   * Add a document to the knowledge base
   *
   * @param userId - User ID
   * @param content - Text content to embed
   * @param metadata - Document metadata
   * @returns Document ID
   */
  async addDocument(
    userId: string,
    content: string,
    metadata: DocumentMetadata
  ): Promise<string> {
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(content)

      // Insert into database
      const { data, error } = await this.supabase
        .from('user_knowledge_base')
        .insert({
          user_id: userId,
          content,
          embedding,
          metadata,
        })
        .select('id')
        .single()

      if (error) {
        console.error('[KnowledgeBase] Insert error:', error)
        throw error
      }

      console.log(`[KnowledgeBase] Added document: ${data.id}`)
      return data.id
    } catch (error) {
      console.error('[KnowledgeBase] addDocument error:', error)
      throw error
    }
  }

  /**
   * Add multiple documents in batch
   *
   * @param userId - User ID
   * @param documents - Array of content and metadata
   */
  async addDocuments(
    userId: string,
    documents: Array<{ content: string; metadata: DocumentMetadata }>
  ): Promise<string[]> {
    try {
      // バッチサイズを制限してレート制限を回避（10件ずつ処理）
      const BATCH_SIZE = 10
      const allIds: string[] = []

      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE)

        // バッチ内では並列実行
        const records = await Promise.all(
          batch.map(async (doc) => ({
            user_id: userId,
            content: doc.content,
            embedding: await this.generateEmbedding(doc.content),
            metadata: doc.metadata,
          }))
        )

        const { data, error } = await this.supabase
          .from('user_knowledge_base')
          .insert(records)
          .select('id')

        if (error) {
          console.error('[KnowledgeBase] Batch insert error:', error)
          throw error
        }

        allIds.push(...data.map((d) => d.id))
        console.log(`[KnowledgeBase] Added ${data.length} documents (batch ${Math.floor(i / BATCH_SIZE) + 1})`)
      }

      console.log(`[KnowledgeBase] Total added: ${allIds.length} documents`)
      return allIds
    } catch (error) {
      console.error('[KnowledgeBase] addDocuments error:', error)
      throw error
    }
  }

  /**
   * Search knowledge base using vector similarity
   *
   * @param userId - User ID
   * @param query - Search query
   * @param filters - Search filters
   * @returns Relevant documents sorted by similarity
   */
  async search(
    userId: string,
    query: string,
    filters: SearchFilters = {}
  ): Promise<KnowledgeDocument[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query)

      // Call search function
      const { data, error } = await this.supabase.rpc('search_user_knowledge', {
        p_user_id: userId,
        p_query_embedding: queryEmbedding,
        p_filter_types: filters.types || null,
        p_filter_category: filters.category || null,
        p_filter_year: filters.year || null,
        p_match_count: filters.limit || 5,
        p_similarity_threshold: filters.similarityThreshold || 0.5,
      })

      if (error) {
        console.error('[KnowledgeBase] Search error:', error)
        throw error
      }

      console.log(`[KnowledgeBase] Found ${data?.length || 0} documents for query: "${query}"`)

      return (data || []).map((d: any) => ({
        id: d.id,
        content: d.content,
        metadata: d.metadata,
        similarity: d.similarity,
        created_at: d.created_at,
      }))
    } catch (error) {
      console.error('[KnowledgeBase] search error:', error)
      throw error
    }
  }

  /**
   * Update a document
   *
   * @param documentId - Document ID
   * @param content - New content
   * @param metadata - New metadata (optional)
   */
  async updateDocument(
    documentId: string,
    content: string,
    metadata?: Partial<DocumentMetadata>
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content)

      const updates: any = {
        content,
        embedding,
      }

      if (metadata) {
        updates.metadata = metadata
      }

      const { error } = await this.supabase
        .from('user_knowledge_base')
        .update(updates)
        .eq('id', documentId)

      if (error) {
        console.error('[KnowledgeBase] Update error:', error)
        throw error
      }

      console.log(`[KnowledgeBase] Updated document: ${documentId}`)
    } catch (error) {
      console.error('[KnowledgeBase] updateDocument error:', error)
      throw error
    }
  }

  /**
   * Delete a document
   *
   * @param documentId - Document ID
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_knowledge_base')
        .delete()
        .eq('id', documentId)

      if (error) {
        console.error('[KnowledgeBase] Delete error:', error)
        throw error
      }

      console.log(`[KnowledgeBase] Deleted document: ${documentId}`)
    } catch (error) {
      console.error('[KnowledgeBase] deleteDocument error:', error)
      throw error
    }
  }

  /**
   * Delete all documents for a user matching filters
   *
   * @param userId - User ID
   * @param filters - Filters to match documents
   */
  async deleteDocuments(
    userId: string,
    filters: Omit<SearchFilters, 'limit' | 'similarityThreshold'>
  ): Promise<void> {
    try {
      let query = this.supabase
        .from('user_knowledge_base')
        .delete()
        .eq('user_id', userId)

      if (filters.types) {
        query = query.in('metadata->>type', filters.types)
      }

      if (filters.category) {
        query = query.eq('metadata->>category', filters.category)
      }

      if (filters.year) {
        query = query.eq('metadata->>year', filters.year.toString())
      }

      const { error } = await query

      if (error) {
        console.error('[KnowledgeBase] Batch delete error:', error)
        throw error
      }

      console.log(`[KnowledgeBase] Deleted documents for user: ${userId}`)
    } catch (error) {
      console.error('[KnowledgeBase] deleteDocuments error:', error)
      throw error
    }
  }

  /**
   * Generate embedding for text using Gemini
   *
   * @param text - Text to embed
   * @returns Embedding vector
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embedModel.embedContent(text)
      return result.embedding.values
    } catch (error) {
      console.error('[KnowledgeBase] Embedding generation error:', error)
      throw error
    }
  }

  /**
   * Get statistics for a user's knowledge base
   *
   * @param userId - User ID
   */
  async getStats(userId: string): Promise<{
    total: number
    byType: Record<DocumentType, number>
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_knowledge_base')
        .select('metadata')
        .eq('user_id', userId)

      if (error) {
        console.error('[KnowledgeBase] Stats error:', error)
        throw error
      }

      const byType: Record<string, number> = {}
      data?.forEach((doc: any) => {
        const type = doc.metadata.type
        byType[type] = (byType[type] || 0) + 1
      })

      return {
        total: data?.length || 0,
        byType: byType as Record<DocumentType, number>,
      }
    } catch (error) {
      console.error('[KnowledgeBase] getStats error:', error)
      throw error
    }
  }
}
