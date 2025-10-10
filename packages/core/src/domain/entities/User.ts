import { Email } from '../value-objects/Email'

export interface UserProps {
  id: string
  email: Email
  name: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'>): User {
    const now = new Date()
    return new User({
      ...props,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstruct(props: UserProps): User {
    return new User(props)
  }

  get id(): string {
    return this.props.id
  }

  get email(): Email {
    return this.props.email
  }

  get name(): string {
    return this.props.name
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

  updateName(name: string): User {
    return new User({
      ...this.props,
      name,
      updatedAt: new Date(),
    })
  }

  updateMetadata(metadata: Record<string, unknown>): User {
    return new User({
      ...this.props,
      metadata: { ...this.props.metadata, ...metadata },
      updatedAt: new Date(),
    })
  }

  toJSON(): UserProps {
    return {
      ...this.props,
    }
  }
}
