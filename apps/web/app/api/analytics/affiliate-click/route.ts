import { NextRequest, NextResponse } from 'next/server'

/**
 * アフィリエイトクリック追跡API
 *
 * 将来的にSupabaseに保存してコンバージョン率を分析
 * 現在はコンソールログのみ
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, userId, source, timestamp, referrer, userAgent } = body

    // TODO: Supabaseに保存
    // const { data, error } = await supabase
    //   .from('affiliate_clicks')
    //   .insert({
    //     service,
    //     user_id: userId,
    //     source,
    //     referrer,
    //     user_agent: userAgent,
    //     clicked_at: timestamp
    //   })

    // 現在はログのみ
    console.log('[Affiliate Click]', {
      service,
      userId,
      source,
      timestamp: new Date(timestamp).toLocaleString('ja-JP')
    })

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully'
    })
  } catch (error) {
    console.error('[Affiliate Click API] Error:', error)
    // エラーでも200を返す（クライアント側に影響を与えない）
    return NextResponse.json({
      success: false,
      error: 'Failed to track click'
    }, { status: 200 })
  }
}
