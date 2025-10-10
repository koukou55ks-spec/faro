import { INoteRepository } from '../../interfaces/repositories/INoteRepository'

export interface DeleteNoteInput {
  noteId: string
  userId: string
}

export class DeleteNoteUseCase {
  constructor(private readonly noteRepository: INoteRepository) {}

  async execute(input: DeleteNoteInput): Promise<void> {
    const note = await this.noteRepository.findById(input.noteId)

    if (!note) {
      throw new Error('Note not found')
    }

    if (note.userId !== input.userId) {
      throw new Error('Unauthorized')
    }

    await this.noteRepository.delete(input.noteId)
  }
}
