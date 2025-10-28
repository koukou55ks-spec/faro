/**
 * チャット機能の定数定義
 * プラン別の会話履歴制限など
 */

/**
 * プラン別の会話履歴制限（往復数）
 *
 * - ゲスト: 10往復（20メッセージ） - 無料トライアル
 * - Free: 20往復（40メッセージ） - Gemini Free相当
 * - Pro: 100往復（200メッセージ） - Gemini Advanced相当
 */
export const CONVERSATION_HISTORY_LIMITS = {
  guest: 10,   // ゲストユーザー: 10往復
  free: 20,    // 無料プラン: 20往復
  pro: 100,    // Proプラン: 100往復
} as const

/**
 * プラン名の型定義
 */
export type UserPlan = keyof typeof CONVERSATION_HISTORY_LIMITS

/**
 * 往復数からメッセージ数に変換
 * 1往復 = ユーザーメッセージ + AIメッセージ = 2メッセージ
 */
export const getMessageLimit = (plan: UserPlan): number => {
  return CONVERSATION_HISTORY_LIMITS[plan] * 2
}

/**
 * ユーザープランを判定
 */
export const getUserPlan = (
  isGuest: boolean,
  subscriptionPlan?: string | null
): UserPlan => {
  if (isGuest) return 'guest'
  if (subscriptionPlan === 'pro') return 'pro'
  return 'free'
}
