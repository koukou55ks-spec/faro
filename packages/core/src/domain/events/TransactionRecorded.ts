import { BaseDomainEvent } from './DomainEvent'
import { TransactionType, TransactionCategory } from '../entities/Transaction'
import { Money } from '../value-objects/Money'

export interface TransactionRecordedPayload {
  transactionId: string
  userId: string
  type: TransactionType
  amount: Money
  category: TransactionCategory
}

export class TransactionRecorded extends BaseDomainEvent {
  readonly eventType = 'transaction.recorded'

  constructor(public readonly payload: TransactionRecordedPayload) {
    super()
  }
}
