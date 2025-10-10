import { Note } from '../../domain/entities/Note'
import { INoteRepository } from '../../interfaces/repositories/INoteRepository'

export interface UpdateNoteInput {
  noteId: string
  userId: string
  title?: string
  content?: string
  tags?: string[]
}

export interface UpdateNoteOutput {
  note: Note
}

export class UpdateNoteUseCase {
  constructor(private readonly noteRepository: INoteRepository) {}

  async execute(input: UpdateNoteInput): Promise<UpdateNoteOutput> {
    const note = await this.noteRepository.findById(input.noteId)

    if (!note) {
      throw new Error('Note not found')
    }

    if (note.userId !== input.userId) {
      throw new Error('Unauthorized')
    }

    let updatedNote = note

    if (input.title) {
      updatedNote = updatedNote.updateTitle(input.title)
    }

    if (input.content) {
      updatedNote = updatedNote.updateContent(input.content)
    }

    if (input.tags) {
      // Remove all existing tags and add new ones
      for (const tag of updatedNote.tags) {
        updatedNote = updatedNote.removeTag(tag)
      }
      for (const tag of input.tags) {
        updatedNote = updatedNote.addTag(tag)
      }
    }

    await this.noteRepository.save(updatedNote)

    return { note: updatedNote }
  }
}
