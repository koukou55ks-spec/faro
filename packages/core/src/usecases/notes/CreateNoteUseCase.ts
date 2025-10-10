import { Note } from '../../domain/entities/Note'
import { INoteRepository } from '../../interfaces/repositories/INoteRepository'

export interface CreateNoteInput {
  id: string
  userId: string
  title: string
  content: string
  tags?: string[]
}

export interface CreateNoteOutput {
  note: Note
}

export class CreateNoteUseCase {
  constructor(private readonly noteRepository: INoteRepository) {}

  async execute(input: CreateNoteInput): Promise<CreateNoteOutput> {
    const note = Note.create({
      id: input.id,
      userId: input.userId,
      title: input.title,
      content: input.content,
    })

    // Add tags if provided
    let noteWithTags = note
    if (input.tags) {
      for (const tag of input.tags) {
        noteWithTags = noteWithTags.addTag(tag)
      }
    }

    await this.noteRepository.save(noteWithTags)

    return { note: noteWithTags }
  }
}
