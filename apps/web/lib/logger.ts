import { Logger } from 'next-axiom'

/**
 * Structured logging with Axiom
 */
export const logger = new Logger()

/**
 * Log levels
 */
export const log = {
  info: (message: string, metadata?: Record<string, any>) => {
    logger.info(message, metadata)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, metadata)
    }
  },

  warn: (message: string, metadata?: Record<string, any>) => {
    logger.warn(message, metadata)
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, metadata)
    }
  },

  error: (message: string, error?: Error, metadata?: Record<string, any>) => {
    logger.error(message, { ...metadata, error: error?.message, stack: error?.stack })
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error, metadata)
    }
  },

  debug: (message: string, metadata?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(message, metadata)
      console.debug(`[DEBUG] ${message}`, metadata)
    }
  },
}

/**
 * Domain-specific loggers
 */
export const loggers = {
  auth: {
    login: (userId: string) => log.info('User logged in', { userId, domain: 'auth' }),
    logout: (userId: string) => log.info('User logged out', { userId, domain: 'auth' }),
    signupSuccess: (userId: string) => log.info('User signed up', { userId, domain: 'auth' }),
    signupFailed: (email: string, error: Error) =>
      log.error('Signup failed', error, { email, domain: 'auth' }),
  },

  ai: {
    requestStart: (conversationId: string, provider: string) =>
      log.info('AI request started', { conversationId, provider, domain: 'ai' }),
    requestSuccess: (conversationId: string, provider: string, tokensUsed: number) =>
      log.info('AI request successful', { conversationId, provider, tokensUsed, domain: 'ai' }),
    requestFailed: (conversationId: string, provider: string, error: Error) =>
      log.error('AI request failed', error, { conversationId, provider, domain: 'ai' }),
    fallback: (from: string, to: string, reason: string) =>
      log.warn('AI provider fallback', { from, to, reason, domain: 'ai' }),
  },

  transaction: {
    created: (transactionId: string, amount: number) =>
      log.info('Transaction created', { transactionId, amount, domain: 'transaction' }),
    updated: (transactionId: string) =>
      log.info('Transaction updated', { transactionId, domain: 'transaction' }),
    deleted: (transactionId: string) =>
      log.info('Transaction deleted', { transactionId, domain: 'transaction' }),
  },

  performance: {
    slowQuery: (query: string, duration: number) =>
      log.warn('Slow database query detected', { query, duration, domain: 'performance' }),
    slowAPI: (endpoint: string, duration: number) =>
      log.warn('Slow API response', { endpoint, duration, domain: 'performance' }),
  },
}
