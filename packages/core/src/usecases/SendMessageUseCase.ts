import { MessageEntity } from '../domain/Message';
import { IConversationRepository } from '../interfaces/IConversationRepository';
import { IAIService } from '../interfaces/IAIService';

export class SendMessageUseCase {
  constructor(
    private conversationRepo: IConversationRepository,
    private aiService: IAIService
  ) {}

  async execute(conversationId: string, userId: string, content: string): Promise<MessageEntity> {
    // Create user message
    const userMessage = MessageEntity.create({
      userId,
      content,
      role: 'user'
    });

    // Add to conversation
    await this.conversationRepo.addMessage(conversationId, userMessage);

    // Get conversation for context
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Prepare history for AI
    const history = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate AI response
    const aiResponse = await this.aiService.generateResponse(content, history);

    // Create assistant message
    const assistantMessage = MessageEntity.create({
      userId,
      content: aiResponse,
      role: 'assistant'
    });

    // Add assistant response to conversation
    await this.conversationRepo.addMessage(conversationId, assistantMessage);

    return assistantMessage;
  }
}
