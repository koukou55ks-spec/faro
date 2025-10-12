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
