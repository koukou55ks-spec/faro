'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Global Error Handler
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router
 *
 * このファイルはReact Server Componentsのレンダリングエラーを
 * Sentryに送信するために必要です
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
            エラーが発生しました
          </h1>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            申し訳ございません。予期しないエラーが発生しました。
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ページをリロード
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '24px', width: '100%', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                エラー詳細（開発環境のみ）
              </summary>
              <pre style={{
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px',
              }}>
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  )
}
