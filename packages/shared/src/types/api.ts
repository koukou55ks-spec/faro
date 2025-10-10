export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
