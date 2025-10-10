export interface NoteProps {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

export class Note {
  private constructor(private readonly props: NoteProps) {}

  static create(props: Omit<NoteProps, 'createdAt' | 'updatedAt' | 'tags'>): Note {
    const now = new Date()
    return new Note({
      ...props,
      tags: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstruct(props: NoteProps): Note {
    return new Note(props)
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get title(): string {
    return this.props.title
  }

  get content(): string {
    return this.props.content
  }

  get tags(): readonly string[] {
    return this.props.tags
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata
  }

  updateTitle(title: string): Note {
    return new Note({
      ...this.props,
      title,
      updatedAt: new Date(),
    })
  }

  updateContent(content: string): Note {
    return new Note({
      ...this.props,
      content,
      updatedAt: new Date(),
    })
  }

  addTag(tag: string): Note {
    if (this.props.tags.includes(tag)) {
      return this
    }
    return new Note({
      ...this.props,
      tags: [...this.props.tags, tag],
      updatedAt: new Date(),
    })
  }

  removeTag(tag: string): Note {
    return new Note({
      ...this.props,
      tags: this.props.tags.filter(t => t !== tag),
      updatedAt: new Date(),
    })
  }

  toJSON(): NoteProps {
    return {
      ...this.props,
    }
  }
}
