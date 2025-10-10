import { Message, MessageProps } from './Message'

export interface ConversationProps {
  id: string
  userId: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

export class Conversation {
  private constructor(private readonly props: ConversationProps) {}

  static create(props: Omit<ConversationProps, 'createdAt' | 'updatedAt' | 'messages'>): Conversation {
    const now = new Date()
    return new Conversation({
      ...props,
      messages: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstruct(props: ConversationProps): Conversation {
    return new Conversation(props)
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get title(): string {
    return this.props.title
  }

  get messages(): readonly Message[] {
    return this.props.messages
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata
  }

  addMessage(message: Message): Conversation {
    return new Conversation({
      ...this.props,
      messages: [...this.props.messages, message],
      updatedAt: new Date(),
    })
  }

  updateTitle(title: string): Conversation {
    return new Conversation({
      ...this.props,
      title,
      updatedAt: new Date(),
    })
  }

  getLastMessage(): Message | undefined {
    return this.props.messages[this.props.messages.length - 1]
  }

  toJSON(): Omit<ConversationProps, 'messages'> & { messages: MessageProps[] } {
    return {
      ...this.props,
      messages: this.props.messages.map(m => m.toJSON()),
    }
  }
}
