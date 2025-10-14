import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// GET - Fetch all categories for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ categories: data || [] })
  } catch (error) {
    console.error('[Categories API] Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, type, icon, color } = body

    if (!userId || !name || !type) {
      return NextResponse.json(
        { error: 'userId, name, and type are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name,
        type,
        icon: icon || '💰',
        color: color || '#8B5CF6',
      })
      .select()
      .single()

    if (error) throw error

    console.log('[Categories API] ✅ Created category:', data.id)
    return NextResponse.json({ category: data })
  } catch (error: any) {
    console.error('[Categories API] Error creating category:', error)
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

// PUT - Update a category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, icon, color } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (icon !== undefined) updates.icon = icon
    if (color !== undefined) updates.color = color

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log('[Categories API] ✅ Updated category:', id)
    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('[Categories API] Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    console.log('[Categories API] ✅ Deleted category:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Categories API] Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
