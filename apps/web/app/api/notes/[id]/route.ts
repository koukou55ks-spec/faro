/**
 * Note Details API Route - Clean Architecture Implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { UpdateNoteUseCase, DeleteNoteUseCase } from '@faro/core'
import { SupabaseNoteRepository, getSupabaseClient } from '@faro/infrastructure'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, title, content, tags } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Initialize dependencies
    const supabaseClient = getSupabaseClient()
    const noteRepository = new SupabaseNoteRepository(supabaseClient)

    // Execute use case
    const updateNoteUseCase = new UpdateNoteUseCase(noteRepository)

    const result = await updateNoteUseCase.execute({
      noteId: id,
      userId,
      title,
      content,
      tags,
    })

    return NextResponse.json({
      success: true,
      data: result.note.toJSON(),
    })
  } catch (error) {
    console.error('Update note error:', error)

    if (error instanceof Error) {
      if (error.message === 'Note not found') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    // Initialize dependencies
    const supabaseClient = getSupabaseClient()
    const noteRepository = new SupabaseNoteRepository(supabaseClient)

    // Execute use case
    const deleteNoteUseCase = new DeleteNoteUseCase(noteRepository)

    await deleteNoteUseCase.execute({
      noteId: id,
      userId,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete note error:', error)

    if (error instanceof Error) {
      if (error.message === 'Note not found') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
