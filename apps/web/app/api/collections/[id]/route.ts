import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * PATCH /api/collections/[id]
 * Update a collection (name, description, icon, parentId, isExpanded)
 */
export async function PATCH(
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

    const collectionId = params.id
    const { name, description, icon, parentId, isExpanded } = await request.json()

    // Verify collection belongs to user
    const { data: existingCollection, error: fetchError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Validate name if provided
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Collection name cannot be empty' },
        { status: 400 }
      )
    }

    if (name !== undefined && name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Collection name must be 100 characters or less' },
        { status: 400 }
      )
    }

    // If parentId is being changed, verify it exists and belongs to user
    if (parentId !== undefined && parentId !== null) {
      const { data: parentCollection, error: parentError } = await supabase
        .from('collections')
        .select('id')
        .eq('id', parentId)
        .eq('user_id', user.id)
        .single()

      if (parentError || !parentCollection) {
        return NextResponse.json(
          { error: 'Invalid parent collection' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updates: any = {}
    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (icon !== undefined) updates.icon = icon
    if (parentId !== undefined) updates.parent_id = parentId
    if (isExpanded !== undefined) updates.is_expanded = isExpanded

    const { data: collection, error: updateError } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[Collections API] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update collection' },
        { status: 500 }
      )
    }

    console.log('[Collections API] ✅ Updated collection:', collection.id)

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        icon: collection.icon,
        parentId: collection.parent_id,
        sortOrder: collection.sort_order,
        isExpanded: collection.is_expanded,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
      }
    })
  } catch (error: any) {
    console.error('[Collections API] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/collections/[id]
 * Delete a collection (and optionally all nested collections)
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

    const collectionId = params.id

    // Verify collection belongs to user
    const { data: existingCollection, error: fetchError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Delete collection (CASCADE will handle nested collections and documents)
    const { error: deleteError } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Collections API] Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete collection' },
        { status: 500 }
      )
    }

    console.log('[Collections API] ✅ Deleted collection:', collectionId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Collections API] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
