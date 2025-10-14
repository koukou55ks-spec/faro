// Axiom logging is optional - will be configured in production
// import { log as axiomLog } from 'next-axiom'

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Log context interface
interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  url?: string
  method?: string
  statusCode?: number
  duration?: number
  error?: Error
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context, null, 2) : ''

    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`
  }

  private sendToAxiom(level: LogLevel, message: string, context?: LogContext) {
    // Axiom logging will be configured in production
    // Currently disabled to avoid build errors
    // To enable: install next-axiom and uncomment the import at the top
    if (this.isProduction) {
      // For now, just log to console in production
      if (this.isProduction) {
        console.log(`[AXIOM] ${level}:`, message, context)
      }
    }
  }

  private sendToSentry(level: LogLevel, message: string, context?: LogContext) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const sentry = (window as any).Sentry

      switch (level) {
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          if (context?.error) {
            sentry.captureException(context.error, {
              level: level === LogLevel.FATAL ? 'fatal' : 'error',
              extra: context,
            })
          } else {
            sentry.captureMessage(message, level === LogLevel.FATAL ? 'fatal' : 'error')
          }
          break
        case LogLevel.WARN:
          sentry.captureMessage(message, 'warning')
          break
        case LogLevel.INFO:
          sentry.addBreadcrumb({
            message,
            level: 'info',
            data: context,
          })
          break
      }
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context))
    }
  }

  info(message: string, context?: LogContext) {
    const formatted = this.formatMessage(LogLevel.INFO, message, context)

    if (this.isDevelopment) {
      console.info(formatted)
    }

    this.sendToAxiom(LogLevel.INFO, message, context)
    this.sendToSentry(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext) {
    const formatted = this.formatMessage(LogLevel.WARN, message, context)

    console.warn(formatted)
    this.sendToAxiom(LogLevel.WARN, message, context)
    this.sendToSentry(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    const fullContext = { ...context, error: errorObj }
    const formatted = this.formatMessage(LogLevel.ERROR, message, fullContext)

    console.error(formatted)
    this.sendToAxiom(LogLevel.ERROR, message, fullContext)
    this.sendToSentry(LogLevel.ERROR, message, fullContext)
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    const fullContext = { ...context, error: errorObj }
    const formatted = this.formatMessage(LogLevel.FATAL, message, fullContext)

    console.error(formatted)
    this.sendToAxiom(LogLevel.FATAL, message, fullContext)
    this.sendToSentry(LogLevel.FATAL, message, fullContext)

    // In production, you might want to trigger an alert
    if (this.isProduction) {
      // Trigger critical alert
      this.triggerAlert(message, errorObj)
    }
  }

  private triggerAlert(message: string, error: Error) {
    // Implementation would send alerts via email, Slack, PagerDuty, etc.
    // For now, just log it
    console.error('CRITICAL ALERT:', message, error)
  }

  // Performance logging
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }

  // API request logging
  logApiRequest(req: {
    method: string
    url: string
    body?: any
    headers?: Record<string, string>
  }) {
    this.info('API Request', {
      method: req.method,
      url: req.url,
      metadata: {
        body: req.body,
        headers: req.headers,
      },
    })
  }

  logApiResponse(res: {
    status: number
    url: string
    duration: number
    body?: any
  }) {
    const level = res.status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    const message = `API Response: ${res.status}`

    this[level](message, {
      statusCode: res.status,
      url: res.url,
      duration: res.duration,
      metadata: {
        body: res.body,
      },
    })
  }

  // User action logging
  logUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    this.info(`User Action: ${action}`, {
      userId,
      metadata,
    })
  }

  // Security event logging
  logSecurityEvent(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, context)
  }

  // Performance metrics
  logPerformanceMetric(metric: string, value: number, unit: string = 'ms') {
    this.info(`Performance: ${metric}`, {
      metadata: {
        metric,
        value,
        unit,
      },
    })
  }
}

// Singleton instance
export const logger = new Logger()

// Error recovery strategies
export class ErrorRecovery {
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number
      delay?: number
      backoff?: boolean
      onError?: (error: Error, attempt: number) => void
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = true,
      onError,
    } = options

    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (onError) {
          onError(lastError, attempt)
        }

        logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed`, {
          error: lastError,
          metadata: { attempt, maxAttempts },
        })

        if (attempt < maxAttempts) {
          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  static async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T> | T,
    onFallback?: (error: Error) => void
  ): Promise<T> {
    try {
      return await primary()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))

      logger.warn('Primary operation failed, using fallback', { error: err })

      if (onFallback) {
        onFallback(err)
      }

      return await fallback()
    }
  }

  static async withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number = 5000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    return Promise.race([fn(), timeoutPromise])
  }

  static async withCircuitBreaker<T>(
    fn: () => Promise<T>,
    options: {
      threshold?: number
      timeout?: number
      resetTime?: number
    } = {}
  ): Promise<T> {
    const {
      threshold = 5,
      timeout = 60000,
      resetTime = 30000,
    } = options

    // Simple circuit breaker implementation
    // In production, use a library like opossum
    const key = fn.toString()
    const state = circuitBreakerState.get(key) || { failures: 0, lastFailure: 0, isOpen: false }

    if (state.isOpen) {
      const timeSinceLastFailure = Date.now() - state.lastFailure
      if (timeSinceLastFailure < resetTime) {
        throw new Error('Circuit breaker is open')
      }
      // Try to close the circuit
      state.isOpen = false
    }

    try {
      const result = await this.withTimeout(fn, timeout)
      state.failures = 0 // Reset on success
      circuitBreakerState.set(key, state)
      return result
    } catch (error) {
      state.failures++
      state.lastFailure = Date.now()

      if (state.failures >= threshold) {
        state.isOpen = true
        logger.error('Circuit breaker opened', undefined, {
          metadata: { key, failures: state.failures },
        })
      }

      circuitBreakerState.set(key, state)
      throw error
    }
  }
}

// Circuit breaker state storage
const circuitBreakerState = new Map<string, {
  failures: number
  lastFailure: number
  isOpen: boolean
}>()

// Export utility functions
export function captureException(error: Error | unknown, context?: LogContext) {
  logger.error('Exception captured', error, context)
}

export function captureMessage(message: string, level: LogLevel = LogLevel.INFO, context?: LogContext) {
  logger[level](message, context)
}

export function setUser(userId: string, email?: string, username?: string) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser({ id: userId, email, username })
  }
}

export function clearUser() {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setUser(null)
  }
}