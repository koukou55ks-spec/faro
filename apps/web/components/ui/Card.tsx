import * as React from 'react'

/**
 * Tailwind統一カードコンポーネント
 * シンプルで拡張可能なデザイン
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseClasses = 'rounded-lg bg-white dark:bg-gray-900'

    const variantClasses = {
      default: 'border border-gray-200 dark:border-gray-800',
      bordered: 'border-2 border-gray-300 dark:border-gray-700',
      elevated: 'shadow-lg border border-gray-100 dark:border-gray-800',
    }

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3 ref={ref} className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p ref={ref} className={`text-sm text-gray-500 dark:text-gray-400 ${className}`} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'
