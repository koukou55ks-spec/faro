/**
 * 統一されたAPIエラーハンドリング
 */

import { NextResponse } from 'next/server'

export enum ErrorCode {
  // クライアントエラー (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // サーバーエラー (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: any
  statusCode: number
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * エラーコードからHTTPステータスコードを取得
 */
export function getStatusCode(code: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
    [ErrorCode.VALIDATION_ERROR]: 422,
    [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
    [ErrorCode.DATABASE_ERROR]: 500,
    [ErrorCode.EXTERNAL_API_ERROR]: 502,
  }
  return statusMap[code] || 500
}

/**
 * ユーザーフレンドリーなエラーメッセージを取得
 */
export function getUserFriendlyMessage(code: ErrorCode): string {
  const messageMap: Record<ErrorCode, string> = {
    [ErrorCode.BAD_REQUEST]: 'リクエストの内容が正しくありません',
    [ErrorCode.UNAUTHORIZED]: '認証が必要です。ログインしてください',
    [ErrorCode.FORBIDDEN]: 'この操作を実行する権限がありません',
    [ErrorCode.NOT_FOUND]: '要求されたリソースが見つかりません',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: '利用制限に達しました。しばらく待ってから再度お試しください',
    [ErrorCode.VALIDATION_ERROR]: '入力内容に誤りがあります',
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'サーバーエラーが発生しました。しばらく待ってから再度お試しください',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'サービスが一時的に利用できません',
    [ErrorCode.DATABASE_ERROR]: 'データベースエラーが発生しました',
    [ErrorCode.EXTERNAL_API_ERROR]: '外部サービスとの通信に失敗しました',
  }
  return messageMap[code] || 'エラーが発生しました'
}

/**
 * 統一されたエラーレスポンスを生成
 */
export function createErrorResponse(
  error: Error | AppError,
  includeStack: boolean = process.env.NODE_ENV === 'development'
): NextResponse {
  if (error instanceof AppError) {
    const response: ApiError = {
      code: error.code,
      message: getUserFriendlyMessage(error.code),
      details: error.details,
      statusCode: error.statusCode,
    }

    if (includeStack) {
      response.details = {
        ...response.details,
        originalMessage: error.message,
        stack: error.stack,
      }
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  // 通常のエラー
  const response: ApiError = {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: getUserFriendlyMessage(ErrorCode.INTERNAL_SERVER_ERROR),
    statusCode: 500,
  }

  if (includeStack) {
    response.details = {
      originalMessage: error.message,
      stack: error.stack,
    }
  }

  return NextResponse.json(response, { status: 500 })
}

/**
 * APIルートハンドラーをラップしてエラーハンドリングを適用
 */
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error('[API Error]', error)

      if (error instanceof AppError) {
        return createErrorResponse(error)
      }

      // 予期しないエラー
      return createErrorResponse(
        new AppError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          error instanceof Error ? error.message : 'Unknown error'
        )
      )
    }
  }
}

/**
 * バリデーションヘルパー
 */
export function validateRequired(
  data: any,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field])

  if (missingFields.length > 0) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `必須項目が不足しています: ${missingFields.join(', ')}`,
      422,
      { missingFields }
    )
  }
}

/**
 * データベースエラーをラップ
 */
export function wrapDatabaseError(error: any): AppError {
  console.error('[Database Error]', error)

  return new AppError(
    ErrorCode.DATABASE_ERROR,
    'データベース操作に失敗しました',
    500,
    process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
  )
}

/**
 * 外部APIエラーをラップ
 */
export function wrapExternalApiError(service: string, error: any): AppError {
  console.error(`[External API Error: ${service}]`, error)

  return new AppError(
    ErrorCode.EXTERNAL_API_ERROR,
    `${service}との通信に失敗しました`,
    502,
    process.env.NODE_ENV === 'development' ? { service, originalError: error.message } : undefined
  )
}
