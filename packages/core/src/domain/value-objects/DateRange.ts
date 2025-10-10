export interface DateRangeProps {
  start: Date
  end: Date
}

export class DateRange {
  private readonly start: Date
  private readonly end: Date

  private constructor(start: Date, end: Date) {
    if (start > end) {
      throw new Error('Start date must be before or equal to end date')
    }
    this.start = start
    this.end = end
  }

  static create(start: Date, end: Date): DateRange {
    return new DateRange(start, end)
  }

  static fromMonth(year: number, month: number): DateRange {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59, 999)
    return new DateRange(start, end)
  }

  static fromYear(year: number): DateRange {
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31, 23, 59, 59, 999)
    return new DateRange(start, end)
  }

  getStart(): Date {
    return this.start
  }

  getEnd(): Date {
    return this.end
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start
  }

  getDurationInDays(): number {
    const diff = this.end.getTime() - this.start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  equals(other: DateRange): boolean {
    return this.start.getTime() === other.start.getTime() && this.end.getTime() === other.end.getTime()
  }

  toJSON(): DateRangeProps {
    return {
      start: this.start,
      end: this.end,
    }
  }
}
