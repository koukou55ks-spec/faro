'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)

    // Send to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props

      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error | null; reset: () => void }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>

          <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
            エラーが発生しました
          </h1>

          <p className="text-sm text-center text-gray-600 mb-6">
            申し訳ございません。予期しないエラーが発生しました。
            問題が続く場合は、サポートまでお問い合わせください。
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs font-mono text-gray-700 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              もう一度試す
            </button>

            <button
              onClick={() => router.push('/app')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Home className="w-4 h-4" />
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Async Error Boundary for Suspense
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}