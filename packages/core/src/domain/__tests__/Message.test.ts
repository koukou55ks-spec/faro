import { MessageEntity } from '../Message';

describe('MessageEntity', () => {
  it('should create a message with valid data', () => {
    const message = MessageEntity.create({
      userId: 'user123',
      content: 'Hello, world!',
      role: 'user'
    });

    expect(message.userId).toBe('user123');
    expect(message.content).toBe('Hello, world!');
    expect(message.role).toBe('user');
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeInstanceOf(Date);
  });

  it('should throw error for empty content', () => {
    expect(() => {
      new MessageEntity('id', 'user123', '', 'user', new Date());
    }).toThrow('Message content cannot be empty');
  });

  it('should throw error for missing userId', () => {
    expect(() => {
      new MessageEntity('id', '', 'content', 'user', new Date());
    }).toThrow('User ID is required');
  });
});
