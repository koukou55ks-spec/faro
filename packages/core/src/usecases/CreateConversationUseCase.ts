import { ConversationEntity } from '../domain/Conversation';
import { IConversationRepository } from '../interfaces/IConversationRepository';

export class CreateConversationUseCase {
  constructor(private conversationRepo: IConversationRepository) {}

  async execute(userId: string, title?: string): Promise<ConversationEntity> {
    const conversation = ConversationEntity.create(userId, title);
    return await this.conversationRepo.create(conversation);
  }
}
