import { Transaction } from '../../domain/entities/Transaction'
import { Money } from '../../domain/value-objects/Money'
import { DateRange } from '../../domain/value-objects/DateRange'
import { ITransactionRepository } from '../../interfaces/repositories/ITransactionRepository'

export interface GetMonthlyReportInput {
  userId: string
  year: number
  month: number
}

export interface MonthlyReport {
  totalIncome: Money
  totalExpense: Money
  balance: Money
  transactions: Transaction[]
  categoryBreakdown: Record<string, Money>
}

export interface GetMonthlyReportOutput {
  report: MonthlyReport
}

export class GetMonthlyReportUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(input: GetMonthlyReportInput): Promise<GetMonthlyReportOutput> {
    const dateRange = DateRange.fromMonth(input.year, input.month)
    const transactions = await this.transactionRepository.findByUserIdAndDateRange(input.userId, dateRange)

    let totalIncome = Money.zero('JPY')
    let totalExpense = Money.zero('JPY')
    const categoryBreakdown: Record<string, Money> = {}

    for (const transaction of transactions) {
      if (transaction.isIncome()) {
        totalIncome = totalIncome.add(transaction.amount)
      } else {
        totalExpense = totalExpense.add(transaction.amount)
      }

      const category = transaction.category
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = Money.zero('JPY')
      }
      categoryBreakdown[category] = categoryBreakdown[category].add(transaction.amount)
    }

    const balance = totalIncome.subtract(totalExpense)

    return {
      report: {
        totalIncome,
        totalExpense,
        balance,
        transactions,
        categoryBreakdown,
      },
    }
  }
}
