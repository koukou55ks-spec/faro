import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAIService } from '@faro/core';

export interface SearchResult {
  id: string;
  conversationId: string;
  content: string;
  similarity: number;
}

export class VectorSearchService {
  private supabase: SupabaseClient;
  private aiService: IAIService;

  constructor(supabaseUrl: string, supabaseKey: string, aiService: IAIService) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.aiService = aiService;
  }

  async searchSimilarMessages(
    query: string,
    userId: string,
    threshold: number = 0.7,
    limit: number = 5
  ): Promise<SearchResult[]> {
    // Generate embedding for query
    const queryEmbedding = await this.aiService.generateEmbedding(query);

    // Search using pgvector
    const { data, error } = await this.supabase.rpc('match_messages', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      user_id_filter: userId,
    });

    if (error) {
      console.error('Vector search error:', error);
      throw new Error('Failed to search messages');
    }

    return data.map((item: any) => ({
      id: item.id,
      conversationId: item.conversation_id,
      content: item.content,
      similarity: item.similarity,
    }));
  }

  async storeMessageEmbedding(messageId: string, content: string): Promise<void> {
    const embedding = await this.aiService.generateEmbedding(content);

    const { error } = await this.supabase
      .from('messages')
      .update({ embedding })
      .eq('id', messageId);

    if (error) {
      console.error('Store embedding error:', error);
      throw new Error('Failed to store embedding');
    }
  }
}
