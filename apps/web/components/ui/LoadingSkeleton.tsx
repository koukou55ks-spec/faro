import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  }

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      role="status"
      aria-live="polite"
      aria-label="読み込み中"
    />
  )
}

// Chat Message Skeleton
export function ChatMessageSkeleton() {
  return (
    <div className="mb-8 animate-fadeIn">
      <div className="flex items-start gap-3 md:gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="80px" height="16px" className="mb-2" />
          <div className="space-y-2">
            <Skeleton width="100%" height="20px" />
            <Skeleton width="90%" height="20px" />
            <Skeleton width="75%" height="20px" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Note Card Skeleton
export function NoteCardSkeleton() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <Skeleton width="60%" height="24px" className="mb-2" />
      <Skeleton width="100%" height="16px" className="mb-1" />
      <Skeleton width="90%" height="16px" className="mb-3" />
      <div className="flex items-center gap-4">
        <Skeleton width="80px" height="14px" />
        <Skeleton width="100px" height="14px" />
      </div>
    </div>
  )
}

// Conversation List Skeleton
export function ConversationListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-3 rounded-lg">
          <Skeleton width="70%" height="16px" className="mb-1" />
          <Skeleton width="50%" height="12px" />
        </div>
      ))}
    </div>
  )
}

// Transaction Row Skeleton
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex-1">
        <Skeleton width="120px" height="16px" className="mb-1" />
        <Skeleton width="80px" height="12px" />
      </div>
      <Skeleton width="60px" height="20px" />
    </div>
  )
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton width="200px" height="32px" className="mb-2" />
      <Skeleton width="300px" height="16px" />
    </div>
  )
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Skeleton width="150px" height="24px" className="mb-4" />
      <div className="space-y-3">
        <Skeleton width="100%" height="16px" />
        <Skeleton width="85%" height="16px" />
        <Skeleton width="90%" height="16px" />
      </div>
    </div>
  )
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <Skeleton width="120px" height="20px" className="mb-4" />
      <div className="h-64 relative">
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </div>
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="px-4 py-2">
                <Skeleton width="80px" height="16px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(cols)].map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-2">
                  <Skeleton width="100%" height="16px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Form Field Skeleton
export function FormFieldSkeleton() {
  return (
    <div className="mb-4">
      <Skeleton width="100px" height="14px" className="mb-2" />
      <Skeleton variant="rounded" width="100%" height="40px" />
    </div>
  )
}

// Button Skeleton
export function ButtonSkeleton({ width = 100, height = 40 }) {
  return <Skeleton variant="rounded" width={width} height={height} />
}

// Add shimmer animation to globals.css
const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 1) 0%,
    rgba(229, 231, 235, 0.8) 50%,
    rgba(229, 231, 235, 1) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
`

// Export style injection function for app initialization
export function injectSkeletonStyles() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = shimmerStyles
    document.head.appendChild(style)
  }
}