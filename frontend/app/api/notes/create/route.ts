import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, title, content, tags = [], category = 'personal' } = body

    if (!user_id || !title || !content) {
      return NextResponse.json(
        { error: 'user_id, title, and content are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const noteId = uuidv4()
    const now = new Date().toISOString()

    // Insert note into database
    const { data, error } = await supabase
      .from('user_notes')
      .insert({
        id: noteId,
        user_id,
        title,
        content,
        tags,
        category,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return NextResponse.json(
        { error: 'Failed to create note', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
