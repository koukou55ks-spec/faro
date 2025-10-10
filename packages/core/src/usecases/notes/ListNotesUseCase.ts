import { Note } from '../../domain/entities/Note'
import { INoteRepository } from '../../interfaces/repositories/INoteRepository'

export interface ListNotesInput {
  userId: string
  tags?: string[]
}

export interface ListNotesOutput {
  notes: Note[]
}

export class ListNotesUseCase {
  constructor(private readonly noteRepository: INoteRepository) {}

  async execute(input: ListNotesInput): Promise<ListNotesOutput> {
    let notes: Note[]

    if (input.tags && input.tags.length > 0) {
      notes = await this.noteRepository.findByTags(input.userId, input.tags)
    } else {
      notes = await this.noteRepository.findByUserId(input.userId)
    }

    return { notes }
  }
}
