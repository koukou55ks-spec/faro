/**
 * Monitoring & Observability Configuration
 *
 * Sentry (エラー監視) + Axiom (ログ・パフォーマンス監視)
 * 本番環境では必須、開発環境ではオプション
 */

import * as Sentry from '@sentry/nextjs';

// ============================================
// Environment Variables Validation
// ============================================

const SENTRY_DSN = process.env.SENTRY_DSN;
const AXIOM_TOKEN = process.env.AXIOM_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET || 'faro-logs';
const ENVIRONMENT = process.env.ENVIRONMENT || process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENVIRONMENT === 'production';

// 本番環境では必須チェック
if (IS_PRODUCTION && !SENTRY_DSN) {
  console.warn('⚠️  SENTRY_DSN is not set. Error monitoring disabled.');
}

if (IS_PRODUCTION && !AXIOM_TOKEN) {
  console.warn('⚠️  AXIOM_TOKEN is not set. Log ingestion disabled.');
}

// ============================================
// Sentry Configuration
// ============================================

export function initializeSentry() {
  if (!SENTRY_DSN) {
    console.log('Sentry disabled (no DSN configured)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // パフォーマンス監視
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0, // 本番: 10%, 開発: 100%

    // エラーフィルタリング
    beforeSend(event) {
      // 開発環境ではコンソールにも出力
      if (!IS_PRODUCTION) {
        console.error('Sentry Error:', event);
      }

      // 個人情報を含む可能性のあるフィールドを削除
      if (event.request?.cookies) {
        delete event.request.cookies;
      }

      return event;
    },

    // 無視するエラー
    ignoreErrors: [
      // ブラウザ拡張によるエラー
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // ネットワークエラー（ユーザー側の問題）
      'Network request failed',
      'Failed to fetch',
      'NetworkError',

      // キャンセル系
      'AbortError',
      'cancelled',
    ],

    // プライバシー設定
    sendDefaultPii: false, // 個人情報を送信しない

    // リリース追跡
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    // タグ設定
    initialScope: {
      tags: {
        app: 'faro-web',
        runtime: 'nextjs',
      },
    },
  });

  console.log('✅ Sentry initialized');
}

// ============================================
// Axiom Logging
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  [key: string]: unknown;
}

class AxiomLogger {
  private endpoint: string;
  private headers: HeadersInit;
  private batchQueue: LogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5秒
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(token: string, dataset: string) {
    this.endpoint = `https://api.axiom.co/v1/datasets/${dataset}/ingest`;
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 自動フラッシュ開始
    this.startAutoFlush();
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(batch),
      });
    } catch (error) {
      console.error('Failed to send logs to Axiom:', error);
      // 失敗したログは破棄（無限ループ防止）
    }
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: ENVIRONMENT,
      ...metadata,
    };

    // 開発環境ではコンソールにも出力
    if (!IS_PRODUCTION) {
      console[level === 'debug' ? 'log' : level](`[Axiom] ${message}`, metadata);
    }

    this.batchQueue.push(entry);

    // バッチサイズに達したら即座に送信
    if (this.batchQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>) {
    this.log('error', message, metadata);
  }

  // プロセス終了時にバッファをフラッシュ
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// ============================================
// Logger Instance
// ============================================

let logger: AxiomLogger | null = null;

export function initializeAxiom() {
  if (!AXIOM_TOKEN) {
    console.log('Axiom disabled (no token configured)');
    return null;
  }

  logger = new AxiomLogger(AXIOM_TOKEN, AXIOM_DATASET);
  console.log('✅ Axiom initialized');
  return logger;
}

export function getLogger(): AxiomLogger | null {
  return logger;
}

// ============================================
// Convenience Functions
// ============================================

export function logInfo(message: string, metadata?: Record<string, unknown>) {
  logger?.info(message, metadata);
}

export function logWarn(message: string, metadata?: Record<string, unknown>) {
  logger?.warn(message, metadata);
}

export function logError(message: string, metadata?: Record<string, unknown>) {
  logger?.error(message, metadata);

  // Sentryにも送信
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level: 'error',
      extra: metadata,
    });
  }
}

export function logDebug(message: string, metadata?: Record<string, unknown>) {
  if (!IS_PRODUCTION) {
    logger?.debug(message, metadata);
  }
}

// ============================================
// Performance Monitoring
// ============================================

export function trackPerformance(metric: string, value: number, metadata?: Record<string, unknown>) {
  logger?.info(`Performance: ${metric}`, {
    metric,
    value,
    unit: 'ms',
    ...metadata,
  });
}

// ============================================
// User Activity Tracking
// ============================================

export function trackUserActivity(userId: string, action: string, metadata?: Record<string, unknown>) {
  logger?.info(`User Activity: ${action}`, {
    userId,
    action,
    ...metadata,
  });
}

// ============================================
// API Request Logging
// ============================================

export function logAPIRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, unknown>
) {
  const logData = {
    method,
    path,
    statusCode,
    duration,
    ...metadata,
  };

  if (statusCode >= 500) {
    logger?.error(`API ${method} ${path}`, logData);
  } else if (statusCode >= 400) {
    logger?.warn(`API ${method} ${path}`, logData);
  } else {
    logger?.info(`API ${method} ${path}`, logData);
  }
}

// ============================================
// Cleanup
// ============================================

if (typeof window === 'undefined' && typeof process !== 'undefined' && process.on) {
  // Node.js環境のみ（Edge Runtimeでは実行しない）
  try {
    process.on('beforeExit', () => {
      logger?.destroy();
    });
  } catch (error) {
    // Edge Runtimeでは無視
    console.warn('process.on is not available in this environment');
  }
}

// ============================================
// Auto-initialize
// ============================================
// 注意: instrumentation.tsで初期化するため、ここでは自動初期化しない
