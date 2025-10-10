import { BaseDomainEvent } from './DomainEvent'

export interface ConversationCreatedPayload {
  conversationId: string
  userId: string
  title: string
}

export class ConversationCreated extends BaseDomainEvent {
  readonly eventType = 'conversation.created'

  constructor(public readonly payload: ConversationCreatedPayload) {
    super()
  }
}
