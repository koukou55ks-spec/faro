import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const LIMITS = {
  free: {
    ai_messages: 30,
    documents: 5,
  },
  pro: {
    ai_messages: Infinity,
    documents: Infinity,
  },
}

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

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    const plan = subscription?.plan || 'free'
    const isPro = plan === 'pro' && subscription?.status === 'active'

    // Pro users have unlimited usage
    if (isPro) {
      return NextResponse.json({
        allowed: true,
        plan: 'pro',
        limit: Infinity,
        used: 0,
        remaining: Infinity,
      })
    }

    // Check usage for free users
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const { data: usage } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    const currentUsage = {
      ai_messages_count: usage?.ai_messages_count || 0,
      documents_count: usage?.documents_count || 0,
    }

    let allowed = false
    let used = 0
    let limit = 0
    let remaining = 0

    if (type === 'ai_message') {
      used = currentUsage.ai_messages_count
      limit = LIMITS.free.ai_messages
      remaining = limit - used
      allowed = used < limit
    } else if (type === 'document') {
      used = currentUsage.documents_count
      limit = LIMITS.free.documents
      remaining = limit - used
      allowed = used < limit
    }

    return NextResponse.json({
      allowed,
      plan,
      limit,
      used,
      remaining,
    })
  } catch (error) {
    console.error('[Usage Check] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
