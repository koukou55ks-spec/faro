// Theme configuration
export const theme = {
  colors: {
    primary: '#000000',
    secondary: '#ffffff',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
} as const

export type Theme = typeof theme
