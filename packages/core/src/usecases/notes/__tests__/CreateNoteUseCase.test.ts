// Test imports are globally available via Jest
// No need to import describe, it, expect, beforeEach
import { CreateNoteUseCase } from '../CreateNoteUseCase'
import { Note } from '../../../domain/entities/Note'
import { INoteRepository } from '../../../interfaces/repositories/INoteRepository'

// Mock implementation
class MockNoteRepository implements INoteRepository {
  private notes = new Map<string, Note>()

  async save(note: Note): Promise<void> {
    this.notes.set(note.id, note)
  }

  async findById(id: string): Promise<Note | null> {
    return this.notes.get(id) || null
  }

  async findByUserId(userId: string): Promise<Note[]> {
    return Array.from(this.notes.values()).filter((note) => note.userId === userId)
  }

  async delete(id: string): Promise<void> {
    this.notes.delete(id)
  }

  async update(note: Note): Promise<void> {
    this.notes.set(note.id, note)
  }

  async findByTags(userId: string, tags: string[]): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) =>
        note.userId === userId &&
        tags.some((tag) => note.tags.includes(tag))
    )
  }
}

describe('CreateNoteUseCase', () => {
  let useCase: CreateNoteUseCase
  let repository: MockNoteRepository

  beforeEach(() => {
    repository = new MockNoteRepository()
    useCase = new CreateNoteUseCase(repository)
  })

  it('should create a note with basic information', async () => {
    const input = {
      id: 'note-123',
      userId: 'user-123',
      title: 'My First Note',
      content: 'This is the content of my note',
    }

    const result = await useCase.execute(input)

    expect(result.note.id).toBe('note-123')
    expect(result.note.userId).toBe('user-123')
    expect(result.note.title).toBe('My First Note')
    expect(result.note.content).toBe('This is the content of my note')
  })

  it('should create a note with tags', async () => {
    const input = {
      id: 'note-456',
      userId: 'user-123',
      title: 'Tagged Note',
      content: 'Content with tags',
      tags: ['finance', 'budget', 'planning'],
    }

    const result = await useCase.execute(input)

    expect(result.note.tags).toEqual(['finance', 'budget', 'planning'])
  })

  it('should save the note to repository', async () => {
    const input = {
      id: 'note-789',
      userId: 'user-123',
      title: 'Saved Note',
      content: 'This should be saved',
    }

    await useCase.execute(input)

    const savedNote = await repository.findById('note-789')
    expect(savedNote).not.toBeNull()
    expect(savedNote?.title).toBe('Saved Note')
  })

  it('should create a note without tags when tags are not provided', async () => {
    const input = {
      id: 'note-no-tags',
      userId: 'user-123',
      title: 'No Tags',
      content: 'This note has no tags',
    }

    const result = await useCase.execute(input)

    expect(result.note.tags).toEqual([])
  })
})
