import { Conversation } from '../../domain/entities/Conversation'
import { IConversationRepository } from '../../interfaces/repositories/IConversationRepository'

export interface CreateConversationInput {
  id: string
  userId: string
  title: string
}

export interface CreateConversationOutput {
  conversation: Conversation
}

export class CreateConversationUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(input: CreateConversationInput): Promise<CreateConversationOutput> {
    const conversation = Conversation.create({
      id: input.id,
      userId: input.userId,
      title: input.title,
    })

    await this.conversationRepository.save(conversation)

    return { conversation }
  }
}
