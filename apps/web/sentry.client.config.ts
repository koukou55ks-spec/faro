import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // トレースサンプリングレート（0.0 - 1.0）
  tracesSampleRate: 1.0,

  // デバッグモード（開発環境のみ）
  debug: process.env.NODE_ENV === 'development',

  // リプレイセッション（ユーザーの操作記録）
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // 環境名
  environment: process.env.NODE_ENV,

  // 無視するエラー
  ignoreErrors: [
    // ブラウザ拡張機能のエラー
    'top.GLOBALS',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',

    // ネットワークエラー
    'NetworkError',
    'Network request failed',

    // Abortエラー
    'AbortError',
  ],
})
