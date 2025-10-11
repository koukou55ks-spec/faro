import { ConversationEntity } from '../Conversation';
import { MessageEntity } from '../Message';

describe('ConversationEntity', () => {
  it('should create a conversation', () => {
    const conversation = ConversationEntity.create('user123', 'Test Conversation');

    expect(conversation.userId).toBe('user123');
    expect(conversation.title).toBe('Test Conversation');
    expect(conversation.messages).toEqual([]);
    expect(conversation.id).toBeDefined();
  });

  it('should add messages to conversation', () => {
    const conversation = ConversationEntity.create('user123');
    const message = MessageEntity.create({
      userId: 'user123',
      content: 'Hello',
      role: 'user'
    });

    conversation.addMessage(message);

    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]).toBe(message);
  });

  it('should update conversation title', () => {
    const conversation = ConversationEntity.create('user123', 'Old Title');
    conversation.updateTitle('New Title');

    expect(conversation.title).toBe('New Title');
  });

  it('should throw error for missing userId', () => {
    expect(() => {
      new ConversationEntity('id', '', 'title');
    }).toThrow('User ID is required');
  });
});
