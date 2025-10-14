import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * DELETE /api/documents/[id]
 * Delete a document and its associated chunks
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = params.id

    // Get document to delete file from storage
    const { data: document } = await supabase
      .from('documents')
      .select('file_url, user_id')
      .eq('id', documentId)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Verify ownership
    if (document.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from storage
    try {
      const urlParts = document.file_url.split('/')
      const fileName = urlParts.slice(-2).join('/') // user_id/filename

      await supabase.storage.from('documents').remove([fileName])
    } catch (storageError) {
      console.warn('[Delete Document] Storage deletion failed:', storageError)
      // Continue anyway - DB deletion is more important
    }

    // Delete from database (chunks will be deleted via CASCADE)
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Delete Document] DB error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    console.log('[Delete Document] ✅ Deleted:', documentId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Delete Document] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
