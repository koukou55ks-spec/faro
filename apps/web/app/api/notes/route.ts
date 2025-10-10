/**
 * Notes API Route - Clean Architecture Implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { CreateNoteUseCase, ListNotesUseCase } from '@faro/core'
import { SupabaseNoteRepository, getSupabaseClient } from '@faro/infrastructure'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, content, tags } = body

    if (!userId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize dependencies
    const supabaseClient = getSupabaseClient()
    const noteRepository = new SupabaseNoteRepository(supabaseClient)

    // Execute use case
    const createNoteUseCase = new CreateNoteUseCase(noteRepository)

    const result = await createNoteUseCase.execute({
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      title,
      content,
      tags: tags || [],
    })

    return NextResponse.json({
      success: true,
      data: result.note.toJSON(),
    })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const tagsParam = searchParams.get('tags')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    const tags = tagsParam ? tagsParam.split(',') : undefined

    // Initialize dependencies
    const supabaseClient = getSupabaseClient()
    const noteRepository = new SupabaseNoteRepository(supabaseClient)

    // Execute use case
    const listNotesUseCase = new ListNotesUseCase(noteRepository)

    const result = await listNotesUseCase.execute({
      userId,
      tags,
    })

    return NextResponse.json({
      success: true,
      data: result.notes.map((note) => note.toJSON()),
    })
  } catch (error) {
    console.error('List notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
