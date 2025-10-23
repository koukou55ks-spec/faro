import * as React from 'react'

/**
 * Tailwind統一ボタンコンポーネント
 * Gemini風のモダンデザイン（グラデーション対応）
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const variantClasses = {
      primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 focus-visible:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus-visible:ring-gray-400',
      ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 focus-visible:ring-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
