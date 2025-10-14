import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * POST /api/documents/[id]/collections
 * Add document to a collection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: documentId } = await params
    const { collectionId } = await request.json()

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verify collection belongs to user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Add to collection (upsert to avoid duplicates)
    const { error: linkError } = await supabase
      .from('collection_documents')
      .upsert({
        collection_id: collectionId,
        document_id: documentId,
      })

    if (linkError) {
      console.error('[Documents API] Link error:', linkError)
      return NextResponse.json(
        { error: 'Failed to add document to collection' },
        { status: 500 }
      )
    }

    console.log('[Documents API] ✅ Added document to collection:', documentId, collectionId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Documents API] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/documents/[id]/collections?collectionId=xxx
 * Remove document from a collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: documentId } = await params
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collectionId')

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Remove from collection
    const { error: unlinkError } = await supabase
      .from('collection_documents')
      .delete()
      .eq('collection_id', collectionId)
      .eq('document_id', documentId)

    if (unlinkError) {
      console.error('[Documents API] Unlink error:', unlinkError)
      return NextResponse.json(
        { error: 'Failed to remove document from collection' },
        { status: 500 }
      )
    }

    console.log('[Documents API] ✅ Removed document from collection:', documentId, collectionId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Documents API] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
