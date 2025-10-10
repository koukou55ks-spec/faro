import { Note } from '../../domain/entities/Note'

export interface INoteRepository {
  findById(id: string): Promise<Note | null>
  findByUserId(userId: string): Promise<Note[]>
  findByTags(userId: string, tags: string[]): Promise<Note[]>
  save(note: Note): Promise<void>
  delete(id: string): Promise<void>
}
