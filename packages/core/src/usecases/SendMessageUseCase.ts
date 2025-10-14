import { MessageEntity } from '../domain/Message';
import { IConversationRepository } from '../interfaces/IConversationRepository';
import { IAIService } from '../interfaces/IAIService';
import { IContextService } from '../interfaces/IContextService';

export interface SourceSelectionOptions {
  selectedDocuments?: string[]
  selectedCollections?: string[]
  includeNotes?: boolean
  includeMessages?: boolean
}

export class SendMessageUseCase {
  constructor(
    private conversationRepo: IConversationRepository,
    private aiService: IAIService,
    private contextService?: IContextService // Optional for backward compatibility
  ) {}

  async execute(
    conversationId: string,
    userId: string,
    content: string,
    sourceSelection?: SourceSelectionOptions
  ): Promise<MessageEntity> {
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

    // Retrieve user context (notes, past messages, documents) if context service is available
    let contextPrompt = '';
    if (this.contextService) {
      try {
        const userContext = await this.contextService.retrieveContext(
          content,
          userId,
          0.6, // threshold
          3    // limit
        );
        // TODO: Use sourceSelection when IContextService is updated to support it
        contextPrompt = this.contextService.formatContextForPrompt(userContext);
      } catch (error) {
        console.warn('[SendMessageUseCase] Failed to retrieve context:', error);
        // Continue without context if retrieval fails
      }
    }

    // Generate AI response with context
    const promptWithContext = content + contextPrompt;
    const aiResponse = await this.aiService.generateResponse(promptWithContext, history);

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
