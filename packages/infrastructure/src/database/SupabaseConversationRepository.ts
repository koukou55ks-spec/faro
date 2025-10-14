import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConversationEntity, MessageEntity, IConversationRepository } from '@faro/core';

export class SupabaseConversationRepository implements IConversationRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(conversation: ConversationEntity): Promise<ConversationEntity> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        id: conversation.id,
        user_id: conversation.userId,
        title: conversation.title,
        created_at: conversation.createdAt.toISOString(),
        updated_at: conversation.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create conversation: ${error.message}`);
    return this.toDomain(data);
  }

  async findById(id: string): Promise<ConversationEntity | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.toDomain(data);
  }

  async findByUserId(userId: string): Promise<ConversationEntity[]> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch conversations: ${error.message}`);
    return data.map(d => this.toDomain(d));
  }

  async update(conversation: ConversationEntity): Promise<ConversationEntity> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({
        title: conversation.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update conversation: ${error.message}`);
    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete conversation: ${error.message}`);
  }

  async addMessage(conversationId: string, message: MessageEntity): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .insert({
        id: message.id,
        conversation_id: conversationId,
        user_id: message.userId,
        content: message.content,
        role: message.role,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata,
      });

    if (error) throw new Error(`Failed to add message: ${error.message}`);
  }

  private toDomain(data: any): ConversationEntity {
    const conversation = new ConversationEntity(
      data.id,
      data.user_id,
      data.title,
      [],
      new Date(data.created_at),
      new Date(data.updated_at)
    );

    if (data.messages) {
      conversation.messages = data.messages.map((m: any) => 
        new MessageEntity(
          m.id,
          m.user_id,
          m.content,
          m.role,
          new Date(m.timestamp),
          m.metadata
        )
      );
    }

    return conversation;
  }
}
