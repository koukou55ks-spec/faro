import { Message, MessageRole } from '../../domain/entities/Message'
import { Conversation } from '../../domain/entities/Conversation'
import { IConversationRepository } from '../../interfaces/repositories/IConversationRepository'
import { IAIService } from '../../interfaces/services/IAIService'

export interface SendMessageInput {
  conversationId: string
  userId: string
  content: string
  role?: MessageRole
}

export interface SendMessageOutput {
  userMessage: Message
  assistantMessage: Message
  conversation: Conversation
}

export class SendMessageUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly aiService: IAIService
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    // Get or create conversation
    let conversation = await this.conversationRepository.findById(input.conversationId)
    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = Conversation.create({
        id: input.conversationId,
        userId: input.userId,
        title: 'New Conversation',
        messages: [],
      })
      await this.conversationRepository.save(conversation)
    }

    // Verify user owns the conversation
    if (conversation.userId !== input.userId) {
      throw new Error('Unauthorized')
    }

    // Create user message
    const userMessage = Message.create({
      id: this.generateId(),
      conversationId: input.conversationId,
      role: input.role || 'user',
      content: input.content,
    })

    // Add user message to conversation
    let updatedConversation = conversation.addMessage(userMessage)

    // Generate AI response
    const aiResponse = await this.aiService.generateResponse({
      conversationHistory: updatedConversation.messages as Message[],
      systemPrompt: this.getSystemPrompt(),
    })

    // Create assistant message
    const assistantMessage = Message.create({
      id: this.generateId(),
      conversationId: input.conversationId,
      role: 'assistant',
      content: aiResponse.content,
    })

    // Add assistant message to conversation
    updatedConversation = updatedConversation.addMessage(assistantMessage)

    // Save conversation
    await this.conversationRepository.save(updatedConversation)

    return {
      userMessage,
      assistantMessage,
      conversation: updatedConversation,
    }
  }

  private generateId(): string {
    // Generate UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  private getSystemPrompt(): string {
    return `You are Faro, an AI-powered financial operating system. You help users manage their personal finances, provide expert financial advice, and answer questions about money management, taxes, and investments. Always be helpful, accurate, and professional.`
  }
}
