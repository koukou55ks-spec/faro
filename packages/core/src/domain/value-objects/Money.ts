export type Currency = 'JPY' | 'USD' | 'EUR' | 'GBP'

export interface MoneyProps {
  amount: number
  currency: Currency
}

export class Money {
  private readonly amount: number
  private readonly currency: Currency

  private constructor(amount: number, currency: Currency) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative')
    }
    this.amount = Math.round(amount * 100) / 100 // Round to 2 decimal places
    this.currency = currency
  }

  static create(amount: number, currency: Currency = 'JPY'): Money {
    return new Money(amount, currency)
  }

  static zero(currency: Currency = 'JPY'): Money {
    return new Money(0, currency)
  }

  getAmount(): number {
    return this.amount
  }

  getCurrency(): Currency {
    return this.currency
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other)
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other)
    return new Money(this.amount - other.amount, this.currency)
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency)
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero')
    }
    return new Money(this.amount / divisor, this.currency)
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this.amount > other.amount
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this.amount < other.amount
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies: ${this.currency} and ${other.currency}`)
    }
  }

  toString(): string {
    return `${this.amount} ${this.currency}`
  }

  toJSON(): MoneyProps {
    return {
      amount: this.amount,
      currency: this.currency,
    }
  }
}
