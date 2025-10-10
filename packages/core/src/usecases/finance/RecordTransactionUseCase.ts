import { Transaction, TransactionType, TransactionCategory } from '../../domain/entities/Transaction'
import { Money, Currency } from '../../domain/value-objects/Money'
import { ITransactionRepository } from '../../interfaces/repositories/ITransactionRepository'

export interface RecordTransactionInput {
  id: string
  userId: string
  type: TransactionType
  amount: number
  currency?: Currency
  category: TransactionCategory
  description: string
  date: Date
}

export interface RecordTransactionOutput {
  transaction: Transaction
}

export class RecordTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(input: RecordTransactionInput): Promise<RecordTransactionOutput> {
    const money = Money.create(input.amount, input.currency || 'JPY')

    const transaction = Transaction.create({
      id: input.id,
      userId: input.userId,
      type: input.type,
      amount: money,
      category: input.category,
      description: input.description,
      date: input.date,
    })

    await this.transactionRepository.save(transaction)

    return { transaction }
  }
}
