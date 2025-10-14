import DOMPurify from 'isomorphic-dompurify'

// Input validation schemas
export const ValidationSchemas = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  japanese: /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]+$/,
  amount: /^\d+(\.\d{1,2})?$/,
}

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: more aggressive sanitization
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    })
  }

  // Client-side: standard sanitization
  return DOMPurify.sanitize(html)
}

// Sanitize user input for display
export function sanitizeText(text: string): string {
  if (!text) return ''

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validate and sanitize email
export function validateEmail(email: string): { valid: boolean; sanitized: string } {
  const trimmed = email.trim().toLowerCase()
  const valid = ValidationSchemas.email.test(trimmed)

  return {
    valid,
    sanitized: valid ? trimmed : '',
  }
}

// Validate and sanitize monetary amount
export function validateAmount(amount: string | number): { valid: boolean; sanitized: number } {
  const str = amount.toString().trim()
  const valid = ValidationSchemas.amount.test(str)

  return {
    valid,
    sanitized: valid ? parseFloat(str) : 0,
  }
}

// Validate and sanitize Japanese text
export function validateJapaneseText(text: string): { valid: boolean; sanitized: string } {
  const trimmed = text.trim()
  // Allow Japanese characters, numbers, and basic punctuation
  const isValid = /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\s\d\.\,\!\?]+$/.test(trimmed)

  return {
    valid: isValid,
    sanitized: isValid ? trimmed : '',
  }
}

// Prevent SQL injection in user inputs
export function sanitizeForSQL(input: string): string {
  if (!input) return ''

  // Remove or escape potentially dangerous characters
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, '') // Remove multi-line comment end
    .trim()
}

// Validate file upload
export function validateFileUpload(file: File, options: {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
} = {}): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt'],
  } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `ファイルサイズは${Math.round(maxSize / 1024 / 1024)}MB以下にしてください`,
    }
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '許可されていないファイル形式です',
    }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: '許可されていない拡張子です',
    }
  }

  return { valid: true }
}

// Sanitize filename for storage
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '')

  // Replace spaces and special characters
  safe = safe.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\_\.]/g, '')

  // Ensure it has an extension
  if (!safe.includes('.')) {
    safe += '.txt'
  }

  // Limit length
  if (safe.length > 255) {
    const ext = safe.split('.').pop()
    safe = safe.substring(0, 250 - (ext?.length || 0)) + '.' + ext
  }

  return safe
}

// Validate and sanitize JSON
export function validateJSON(jsonString: string): { valid: boolean; parsed?: any; error?: string } {
  try {
    const parsed = JSON.parse(jsonString)
    return { valid: true, parsed }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    }
  }
}

// Rate limit check for user actions
export function checkRateLimit(
  timestamps: number[],
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const recentAttempts = timestamps.filter(t => now - t < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    const oldestAttempt = Math.min(...recentAttempts)
    const remainingTime = windowMs - (now - oldestAttempt)

    return {
      allowed: false,
      remainingTime,
    }
  }

  return { allowed: true }
}

// Input length validation
export function validateLength(
  input: string,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  const length = input.trim().length

  if (length < min) {
    return {
      valid: false,
      error: `最低${min}文字以上入力してください`,
    }
  }

  if (length > max) {
    return {
      valid: false,
      error: `${max}文字以内で入力してください`,
    }
  }

  return { valid: true }
}

// Password strength validation
export function validatePassword(password: string): {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
} {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  // Check length
  if (password.length < 8) {
    errors.push('8文字以上にしてください')
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含めてください')
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含めてください')
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('数字を含めてください')
  }

  // Check for special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('特殊文字を含めてください')
  }

  // Calculate strength
  if (errors.length === 0) {
    strength = 'strong'
  } else if (errors.length <= 2) {
    strength = 'medium'
  }

  return {
    valid: errors.length === 0,
    strength,
    errors,
  }
}