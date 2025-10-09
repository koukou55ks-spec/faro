import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Edge Runtimeでのトレースサンプリング
  tracesSampleRate: 1.0,

  // デバッグモード（開発環境のみ）
  debug: process.env.NODE_ENV === 'development',

  // 環境名
  environment: process.env.NODE_ENV,
})
