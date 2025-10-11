export interface Message {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class MessageEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly content: string,
    public readonly role: 'user' | 'assistant',
    public readonly timestamp: Date,
    public readonly metadata?: Record<string, unknown>
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (!this.userId) {
      throw new Error('User ID is required');
    }
  }

  static create(data: Omit<Message, 'id' | 'timestamp'>): MessageEntity {
    return new MessageEntity(
      crypto.randomUUID(),
      data.userId,
      data.content,
      data.role,
      new Date(),
      data.metadata
    );
  }
}
