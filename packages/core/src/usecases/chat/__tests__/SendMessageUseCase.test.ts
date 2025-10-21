// Test imports are globally available via Jest
// No need to import describe, it, expect, beforeEach, jest
import { SendMessageUseCase } from '../SendMessageUseCase'
import { Conversation } from '../../../domain/entities/Conversation'
import { IConversationRepository } from '../../../interfaces/repositories/IConversationRepository'
import { IAIService } from '../../../interfaces/services/IAIService'

// Mock implementations
class MockConversationRepository implements IConversationRepository {
  private conversations = new Map<string, Conversation>()

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null
  }

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation)
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conv) => conv.userId === userId
    )
  }

  async delete(id: string): Promise<void> {
    this.conversations.delete(id)
  }

  async update(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation)
  }
}

class MockAIService implements IAIService {
  async generateResponse(): Promise<{
    content: string
    tokensUsed: number
    model: string
  }> {
    return {
      content: 'This is a mock AI response',
      tokensUsed: 100,
      model: 'mock-model',
    }
  }

  async *streamResponse(): AsyncGenerator<string, void, unknown> {
    yield 'Mock stream response'
  }
}

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase
  let repository: MockConversationRepository
  let aiService: MockAIService

  beforeEach(() => {
    repository = new MockConversationRepository()
    aiService = new MockAIService()
    useCase = new SendMessageUseCase(repository, aiService)
  })

  it('should create new conversation if it does not exist', async () => {
    const input = {
      conversationId: 'new-conversation-id',
      userId: 'user-123',
      content: 'Hello, Faro!',
    }

    const result = await useCase.execute(input)

    expect(result.userMessage.content).toBe('Hello, Faro!')
    expect(result.userMessage.role).toBe('user')
    expect(result.assistantMessage.content).toBe('This is a mock AI response')
    expect(result.assistantMessage.role).toBe('assistant')
    expect(result.conversation.messages).toHaveLength(2)
  })

  it('should add message to existing conversation', async () => {
    const conversationId = 'existing-conversation'
    const userId = 'user-123'

    // Create an existing conversation
    const existingConversation = Conversation.create({
      id: conversationId,
      userId,
      title: 'Existing Conversation',
    })
    await repository.save(existingConversation)

    const input = {
      conversationId,
      userId,
      content: 'Follow-up question',
    }

    const result = await useCase.execute(input)

    expect(result.conversation.messages).toHaveLength(2)
    expect(result.userMessage.content).toBe('Follow-up question')
  })

  it('should throw error if user does not own the conversation', async () => {
    const conversationId = 'conversation-123'
    const ownerId = 'user-123'
    const unauthorizedUserId = 'user-456'

    // Create conversation owned by user-123
    const conversation = Conversation.create({
      id: conversationId,
      userId: ownerId,
      title: 'Private Conversation',
    })
    await repository.save(conversation)

    const input = {
      conversationId,
      userId: unauthorizedUserId,
      content: 'Unauthorized access attempt',
    }

    await expect(useCase.execute(input)).rejects.toThrow('Unauthorized')
  })

  it('should generate AI response based on conversation history', async () => {
    const spy = jest.spyOn(aiService, 'generateResponse')

    const input = {
      conversationId: 'conversation-with-history',
      userId: 'user-123',
      content: 'What is my budget?',
    }

    await useCase.execute(input)

    expect(spy).toHaveBeenCalled()
  })

  it('should save conversation after adding messages', async () => {
    const spy = jest.spyOn(repository, 'save')

    const input = {
      conversationId: 'new-conversation',
      userId: 'user-123',
      content: 'Hello',
    }

    await useCase.execute(input)

    // Called twice: once for creating conversation, once for saving messages
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should handle custom message role', async () => {
    const input = {
      conversationId: 'conversation-custom-role',
      userId: 'user-123',
      content: 'System message',
      role: 'system' as const,
    }

    const result = await useCase.execute(input)

    expect(result.userMessage.role).toBe('system')
  })
})
