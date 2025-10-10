import { Conversation } from '../../domain/entities/Conversation'
import { IConversationRepository } from '../../interfaces/repositories/IConversationRepository'

export interface GetConversationInput {
  conversationId: string
  userId: string
}

export interface GetConversationOutput {
  conversation: Conversation
}

export class GetConversationUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(input: GetConversationInput): Promise<GetConversationOutput> {
    const conversation = await this.conversationRepository.findById(input.conversationId)

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    if (conversation.userId !== input.userId) {
      throw new Error('Unauthorized')
    }

    return { conversation }
  }
}
