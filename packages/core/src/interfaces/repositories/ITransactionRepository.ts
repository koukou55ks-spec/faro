import { Transaction } from '../../domain/entities/Transaction'
import { DateRange } from '../../domain/value-objects/DateRange'

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>
  findByUserId(userId: string): Promise<Transaction[]>
  findByUserIdAndDateRange(userId: string, dateRange: DateRange): Promise<Transaction[]>
  save(transaction: Transaction): Promise<void>
  delete(id: string): Promise<void>
}
