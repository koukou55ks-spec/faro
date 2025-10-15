import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const { userId, type } = await request.json()

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['ai_message', 'document'].includes(type)) {
      return NextResponse.json({ error: 'Invalid usage type' }, { status: 400 })
    }

    // Skip increment for guest users
    if (userId === 'dev-guest-user' || userId === 'guest') {
      return NextResponse.json({ success: true, count: 0 })
    }

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    // Get or create usage record
    const { data: existing } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    const columnName = type === 'ai_message' ? 'ai_messages_count' : 'documents_count'

    if (existing) {
      // Increment existing record
      const newCount = existing[columnName] + 1
      await supabase
        .from('usage_limits')
        .update({ [columnName]: newCount })
        .eq('user_id', userId)
        .eq('month', currentMonth)

      return NextResponse.json({ success: true, count: newCount })
    } else {
      // Create new record
      const initialData = {
        user_id: userId,
        month: currentMonth,
        ai_messages_count: type === 'ai_message' ? 1 : 0,
        documents_count: type === 'document' ? 1 : 0,
      }

      await supabase.from('usage_limits').insert(initialData)

      return NextResponse.json({ success: true, count: 1 })
    }
  } catch (error) {
    console.error('[Usage Increment] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
