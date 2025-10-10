import { BaseDomainEvent } from './DomainEvent'
import { MessageRole } from '../entities/Message'

export interface MessageSentPayload {
  messageId: string
  conversationId: string
  role: MessageRole
  content: string
}

export class MessageSent extends BaseDomainEvent {
  readonly eventType = 'message.sent'

  constructor(public readonly payload: MessageSentPayload) {
    super()
  }
}
