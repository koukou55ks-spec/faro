/**
 * アフィリエイトリンク管理
 *
 * 各サービスのアフィリエイトリンクと情報を一元管理
 * 将来的にASP（A8.net、バリューコマース等）のリンクに置き換え
 */

export interface AffiliateLink {
  url: string
  commission: number // 推定報酬（円）
  name: string
  description: string
  price: string
  category: 'accounting' | 'tax-accountant' | 'other'
}

export const affiliateLinks: Record<string, AffiliateLink> = {
  freee: {
    url: 'https://www.freee.co.jp', // TODO: A8.netのアフィリエイトリンクに置き換え
    commission: 3000,
    name: 'freee会計',
    description: '初心者向け、質問形式で確定申告が完成',
    price: '月980円〜',
    category: 'accounting'
  },
  moneyforward: {
    url: 'https://biz.moneyforward.com', // TODO: バリューコマースのリンクに置き換え
    commission: 3000,
    name: 'マネーフォワード確定申告',
    description: '銀行連携が強い、自動仕訳',
    price: '月800円〜',
    category: 'accounting'
  },
  yayoi: {
    url: 'https://www.yayoi-kk.co.jp', // TODO: ASPリンクに置き換え
    commission: 2000,
    name: '弥生会計オンライン',
    description: '最安値、確定申告ソフトの定番',
    price: '月408円〜',
    category: 'accounting'
  },
  taxAccountant: {
    url: 'https://www.zeiri4.com', // TODO: 税理士ドットコムのアフィリエイトリンク
    commission: 20000,
    name: '税理士紹介サービス',
    description: '無料で最適な税理士を紹介、面談後に報酬発生',
    price: '紹介無料',
    category: 'tax-accountant'
  }
}

/**
 * アフィリエイトクリックを追跡
 * 将来的にSupabaseに保存してコンバージョン率を分析
 */
export async function trackAffiliateClick(
  service: string,
  userId?: string,
  source?: 'chat' | 'article' | 'comparison'
): Promise<void> {
  try {
    await fetch('/api/analytics/affiliate-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service,
        userId: userId || 'anonymous',
        source: source || 'unknown',
        timestamp: new Date().toISOString(),
        referrer: typeof window !== 'undefined' ? document.referrer : '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
      })
    })
  } catch (error) {
    console.error('[Affiliate] Failed to track click:', error)
    // エラーでもユーザー体験を妨げない
  }
}

/**
 * カテゴリ別にアフィリエイトリンクを取得
 */
export function getAffiliatesByCategory(category: AffiliateLink['category']): AffiliateLink[] {
  return Object.values(affiliateLinks).filter(link => link.category === category)
}

/**
 * おすすめ順にソート（報酬額が高い順）
 */
export function getSortedAffiliates(): AffiliateLink[] {
  return Object.values(affiliateLinks).sort((a, b) => b.commission - a.commission)
}
