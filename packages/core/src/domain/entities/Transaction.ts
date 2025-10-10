import { Money } from '../value-objects/Money'

export type TransactionType = 'income' | 'expense'
export type TransactionCategory =
  | 'food'
  | 'transportation'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'education'
  | 'shopping'
  | 'salary'
  | 'business'
  | 'investment'
  | 'other'

export interface TransactionProps {
  id: string
  userId: string
  type: TransactionType
  amount: Money
  category: TransactionCategory
  description: string
  date: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static create(props: Omit<TransactionProps, 'createdAt' | 'updatedAt'>): Transaction {
    const now = new Date()
    return new Transaction({
      ...props,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstruct(props: TransactionProps): Transaction {
    return new Transaction(props)
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get type(): TransactionType {
    return this.props.type
  }

  get amount(): Money {
    return this.props.amount
  }

  get category(): TransactionCategory {
    return this.props.category
  }

  get description(): string {
    return this.props.description
  }

  get date(): Date {
    return this.props.date
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

  isIncome(): boolean {
    return this.props.type === 'income'
  }

  isExpense(): boolean {
    return this.props.type === 'expense'
  }

  update(updates: Partial<Omit<TransactionProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Transaction {
    return new Transaction({
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    })
  }

  toJSON(): Omit<TransactionProps, 'amount'> & { amount: import('../value-objects/Money').MoneyProps } {
    return {
      ...this.props,
      amount: this.props.amount.toJSON(),
    }
  }
}
