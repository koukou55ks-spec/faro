import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json() // 'ai_message' or 'document'

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    // Get or create usage record
    const { data: existingUsage } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    if (existingUsage) {
      // Increment existing record
      const updates: any = {}
      if (type === 'ai_message') {
        updates.ai_messages_count = existingUsage.ai_messages_count + 1
      } else if (type === 'document') {
        updates.documents_count = existingUsage.documents_count + 1
      }

      const { error: updateError } = await supabase
        .from('usage_limits')
        .update(updates)
        .eq('id', existingUsage.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new record
      const newUsage: any = {
        user_id: user.id,
        month: currentMonth,
        ai_messages_count: type === 'ai_message' ? 1 : 0,
        documents_count: type === 'document' ? 1 : 0,
      }

      const { error: insertError } = await supabase
        .from('usage_limits')
        .insert(newUsage)

      if (insertError) {
        throw insertError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Usage Track] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
