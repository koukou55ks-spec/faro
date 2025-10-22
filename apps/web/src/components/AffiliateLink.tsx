'use client'

import { affiliateLinks, trackAffiliateClick } from '../../lib/affiliates'
import { ExternalLink } from 'lucide-react'

interface AffiliateLinkProps {
  service: keyof typeof affiliateLinks
  children?: React.ReactNode
  source?: 'chat' | 'article' | 'comparison' | 'connect'
  userId?: string
  className?: string
  showIcon?: boolean
}

/**
 * アフィリエイトリンクコンポーネント
 *
 * 使用例:
 * <AffiliateLink service="freee" source="article">
 *   freeeを無料で試す
 * </AffiliateLink>
 */
export function AffiliateLink({
  service,
  children,
  source = 'article',
  userId,
  className = '',
  showIcon = true
}: AffiliateLinkProps) {
  const link = affiliateLinks[service]

  if (!link) {
    console.warn(`[AffiliateLink] Unknown service: ${service}`)
    return null
  }

  const handleClick = () => {
    trackAffiliateClick(service, userId, source)
  }

  const defaultClassName = 'inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium'
  const finalClassName = className || defaultClassName

  return (
    <a
      href={link.url}
      onClick={handleClick}
      className={finalClassName}
      target="_blank"
      rel="noopener noreferrer sponsored"
    >
      {children || `${link.name}を試す`}
      {showIcon && <ExternalLink className="w-4 h-4" />}
    </a>
  )
}

/**
 * アフィリエイトボタンコンポーネント
 *
 * 使用例:
 * <AffiliateButton service="freee" />
 */
export function AffiliateButton({
  service,
  children,
  source = 'article',
  userId,
  variant = 'primary'
}: AffiliateLinkProps & { variant?: 'primary' | 'secondary' }) {
  const link = affiliateLinks[service]

  if (!link) {
    return null
  }

  const handleClick = () => {
    trackAffiliateClick(service, userId, source)
  }

  const baseClassName = 'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors'
  const variantClassName =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'

  return (
    <a
      href={link.url}
      onClick={handleClick}
      className={`${baseClassName} ${variantClassName}`}
      target="_blank"
      rel="noopener noreferrer sponsored"
    >
      {children || `${link.name}を無料で試す`}
      <ExternalLink className="w-4 h-4" />
    </a>
  )
}
