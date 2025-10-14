import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { GeminiService } from '@faro/infrastructure'

export const runtime = 'nodejs'

// Helper function to generate embedding for note content
async function generateNoteEmbedding(title: string, content: string, tags: string[]): Promise<number[] | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn('[Notes API] GEMINI_API_KEY not configured, skipping embedding generation')
      return null
    }

    const geminiService = new GeminiService(apiKey)
    // Combine title, content, and tags for comprehensive embedding
    const textToEmbed = `${title}\n${content}\n${tags.join(', ')}`
    const embedding = await geminiService.generateEmbedding(textToEmbed)
    return embedding
  } catch (error) {
    console.error('[Notes API] Failed to generate embedding:', error)
    return null // Don't fail the entire operation if embedding fails
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // ゲストユーザーはクライアントサイドで管理
    if (userId === 'guest') {
      return NextResponse.json({ notes: [] })
    }

    const supabase = await createClient()
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Notes API] Error fetching notes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notes: notes || [] })
  } catch (error: any) {
    console.error('[Notes API] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, content, tags } = body

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      )
    }

    // ゲストユーザーはクライアントサイドで管理
    if (userId === 'guest') {
      const guestNote = {
        id: `guest-${Date.now()}`,
        user_id: 'guest',
        title,
        content: content || '',
        tags: tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json({ note: guestNote })
    }

    // Generate embedding for the note
    const embedding = await generateNoteEmbedding(title, content || '', tags || [])

    const supabase = await createClient()
    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title,
        content: content || '',
        tags: tags || [],
        embedding: embedding, // Store the embedding vector
      })
      .select()
      .single()

    if (error) {
      console.error('[Notes API] Error creating note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Notes API] Note created with embedding:', {
      noteId: note.id,
      hasEmbedding: !!embedding,
      embeddingDimensions: embedding?.length
    })

    return NextResponse.json({ note })
  } catch (error: any) {
    console.error('[Notes API] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId, title, content, tags } = body

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id and userId are required' },
        { status: 400 }
      )
    }

    // ゲストユーザーはクライアントサイドで管理
    if (userId === 'guest') {
      const guestNote = {
        id,
        user_id: 'guest',
        title,
        content,
        tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json({ note: guestNote })
    }

    // Generate embedding for the updated note
    const embedding = await generateNoteEmbedding(title, content, tags)

    const supabase = await createClient()
    const { data: note, error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        tags,
        embedding: embedding, // Update the embedding vector
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[Notes API] Error updating note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Notes API] Note updated with embedding:', {
      noteId: note.id,
      hasEmbedding: !!embedding,
      embeddingDimensions: embedding?.length
    })

    return NextResponse.json({ note })
  } catch (error: any) {
    console.error('[Notes API] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id and userId are required' },
        { status: 400 }
      )
    }

    // ゲストユーザーはクライアントサイドで管理
    if (userId === 'guest') {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('[Notes API] Error deleting note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Notes API] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
