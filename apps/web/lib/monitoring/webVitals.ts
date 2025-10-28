/**
 * Web Vitals監視
 * Core Web Vitals（LCP, FID, CLS）を自動追跡
 */

export function reportWebVitals(metric: any) {
  const { name, value, id } = metric

  // Core Web Vitals
  if (['FCP', 'LCP', 'CLS', 'FID', 'TTFB', 'INP'].includes(name)) {
    // コンソールログ
    console.log(`[Web Vitals] ${name}: ${value.toFixed(2)}`, {
      rating: getRating(name, value),
    })

    // Vercel Analyticsに送信
    if (typeof window !== 'undefined' && (window as any).va) {
      ;(window as any).va('event', 'Web Vitals', {
        metric: name,
        value: Math.round(value),
        rating: getRating(name, value),
      })
    }

    // Axiomに送信
    if (typeof window !== 'undefined' && (window as any).axiom) {
      ;(window as any).axiom.log({
        type: 'web-vital',
        metric: name,
        value,
        rating: getRating(name, value),
        timestamp: new Date().toISOString(),
      })
    }
  }
}

/**
 * メトリクスの評価
 * Google推奨値に基づく
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    FCP: [1800, 3000],      // First Contentful Paint
    LCP: [2500, 4000],      // Largest Contentful Paint
    FID: [100, 300],        // First Input Delay
    CLS: [0.1, 0.25],       // Cumulative Layout Shift
    TTFB: [800, 1800],      // Time to First Byte
    INP: [200, 500],        // Interaction to Next Paint
  }

  const [good, needsImprovement] = thresholds[metric] || [0, 0]

  if (value <= good) return 'good'
  if (value <= needsImprovement) return 'needs-improvement'
  return 'poor'
}
