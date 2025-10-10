export type MessageRole = 'user' | 'assistant' | 'system'

export interface MessageProps {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: Date
  metadata?: Record<string, unknown>
}

export class Message {
  private constructor(private readonly props: MessageProps) {}

  static create(props: Omit<MessageProps, 'createdAt'>): Message {
    return new Message({
      ...props,
      createdAt: new Date(),
    })
  }

  static reconstruct(props: MessageProps): Message {
    return new Message(props)
  }

  get id(): string {
    return this.props.id
  }

  get conversationId(): string {
    return this.props.conversationId
  }

  get role(): MessageRole {
    return this.props.role
  }

  get content(): string {
    return this.props.content
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata
  }

  isUser(): boolean {
    return this.props.role === 'user'
  }

  isAssistant(): boolean {
    return this.props.role === 'assistant'
  }

  toJSON(): MessageProps {
    return {
      ...this.props,
    }
  }
}
