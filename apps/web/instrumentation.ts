/**
 * Next.js Instrumentation
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * このファイルはサーバー起動時に一度だけ実行されます
 * モニタリングツールの初期化に最適
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // サーバーサイドのみ
    const { initializeSentry, initializeAxiom } = await import('./lib/monitoring');

    // Sentry初期化
    initializeSentry();

    // Axiom初期化
    initializeAxiom();

    console.log('✅ Monitoring initialized (Sentry + Axiom)');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge Runtimeの場合
    const { initializeSentry } = await import('./lib/monitoring');

    // Sentryのみ初期化（Axiomはフル機能がEdgeで動かない可能性）
    initializeSentry();

    console.log('✅ Monitoring initialized (Sentry only - Edge Runtime)');
  }
}

/**
 * onRequestError - Sentry統合のための必須フック
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
 */
export async function onRequestError(
  err: Error,
  request: {
    path: string
    method: string
    headers: Headers
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'render' | 'route' | 'action' | 'middleware'
    renderSource: 'react-server-components' | 'react-server-components-payload' | 'server-rendering'
  }
) {
  // Sentryにエラーを送信
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(err, {
      contexts: {
        request: {
          path: request.path,
          method: request.method,
        },
        nextjs: {
          routerKind: context.routerKind,
          routePath: context.routePath,
          routeType: context.routeType,
          renderSource: context.renderSource,
        },
      },
    })
  }
}
