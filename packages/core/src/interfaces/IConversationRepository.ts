import { ConversationEntity } from '../domain/Conversation';
import { MessageEntity } from '../domain/Message';

export interface IConversationRepository {
  create(conversation: ConversationEntity): Promise<ConversationEntity>;
  findById(id: string): Promise<ConversationEntity | null>;
  findByUserId(userId: string): Promise<ConversationEntity[]>;
  update(conversation: ConversationEntity): Promise<ConversationEntity>;
  delete(id: string): Promise<void>;
  addMessage(conversationId: string, message: MessageEntity): Promise<void>;
}
