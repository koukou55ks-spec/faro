import { Conversation } from '../../domain/entities/Conversation'

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>
  findByUserId(userId: string): Promise<Conversation[]>
  save(conversation: Conversation): Promise<void>
  delete(id: string): Promise<void>
}
