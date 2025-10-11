import { MessageEntity } from './Message';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: MessageEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public messages: MessageEntity[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.userId) {
      throw new Error('User ID is required');
    }
  }

  addMessage(message: MessageEntity): void {
    this.messages.push(message);
    this.updatedAt = new Date();
  }

  updateTitle(title: string): void {
    if (title && title.trim().length > 0) {
      this.title = title;
      this.updatedAt = new Date();
    }
  }

  static create(userId: string, title: string = 'New Conversation'): ConversationEntity {
    return new ConversationEntity(
      crypto.randomUUID(),
      userId,
      title
    );
  }
}
