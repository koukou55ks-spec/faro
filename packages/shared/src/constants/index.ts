export const APP_NAME = 'Faro'
export const APP_DESCRIPTION = 'Your AI-Powered Financial Operating System'

export const SUPPORTED_CURRENCIES = ['JPY', 'USD', 'EUR', 'GBP'] as const
export const DEFAULT_CURRENCY = 'JPY'

export const TRANSACTION_CATEGORIES = [
  'food',
  'transportation',
  'housing',
  'utilities',
  'entertainment',
  'healthcare',
  'education',
  'shopping',
  'salary',
  'business',
  'investment',
  'other',
] as const

export const TRANSACTION_TYPES = ['income', 'expense'] as const

export const DATE_FORMATS = {
  SHORT: 'short',
  LONG: 'long',
  ISO: 'iso',
} as const

export const API_ROUTES = {
  CHAT: '/api/chat',
  CONVERSATIONS: '/api/conversations',
  TRANSACTIONS: '/api/transactions',
  NOTES: '/api/notes',
  REPORTS: '/api/reports',
} as const
