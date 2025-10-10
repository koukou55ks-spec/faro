export function formatCurrency(amount: number, currency: string = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(value)
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, '')
  return parseFloat(cleaned)
}
