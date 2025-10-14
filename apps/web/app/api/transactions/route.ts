import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json({ transactions: data })
  } catch (error: any) {
    console.error('[Transactions API] Error fetching transactions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, date, amount, category, memo } = await request.json()

    if (!userId || !date || !amount || !category) {
      return NextResponse.json(
        { error: 'userId, date, amount, and category are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        date,
        amount,
        category,
        memo,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ transaction: data })
  } catch (error: any) {
    console.error('[Transactions API] Error creating transaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, date, amount, category, memo } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updates: any = {}
    if (date !== undefined) updates.date = date
    if (amount !== undefined) updates.amount = amount
    if (category !== undefined) updates.category = category
    if (memo !== undefined) updates.memo = memo

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ transaction: data })
  } catch (error: any) {
    console.error('[Transactions API] Error updating transaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Transactions API] Error deleting transaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
