import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * GET /api/collections
 * Get all collections for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Development mode: skip authentication
    const isDevelopment = process.env.NODE_ENV === 'development'
    let user: any = null

    if (!isDevelopment) {
      // Production: strict auth required
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      user = authUser
    } else {
      // Development: allow guest with mock user
      if (token) {
        const { data: { user: authUser } } = await supabase.auth.getUser(token)
        user = authUser
      }

      if (!user) {
        console.log('[Collections API] Development mode: using mock guest user')
        user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@localhost' }
      }
    }

    // Get collections with document count (support nested structure)
    const { data: collections, error } = await supabase
      .from('collections')
      .select(`
        *,
        collection_documents(count)
      `)
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[Collections API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch collections' },
        { status: 500 }
      )
    }

    // Format response with nested structure support
    const formattedCollections = (collections || []).map(col => ({
      id: col.id,
      name: col.name,
      description: col.description,
      icon: col.icon,
      parentId: col.parent_id,
      sortOrder: col.sort_order,
      isExpanded: col.is_expanded,
      documentCount: col.collection_documents?.[0]?.count || 0,
      createdAt: col.created_at,
      updatedAt: col.updated_at,
    }))

    return NextResponse.json({ collections: formattedCollections })
  } catch (error: any) {
    console.error('[Collections API] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/collections
 * Create a new collection
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Development mode: skip authentication
    const isDevelopment = process.env.NODE_ENV === 'development'
    let user: any = null

    if (!isDevelopment) {
      // Production: strict auth required
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      user = authUser
    } else {
      // Development: allow guest with mock user
      if (token) {
        const { data: { user: authUser } } = await supabase.auth.getUser(token)
        user = authUser
      }

      if (!user) {
        console.log('[Collections API] Development mode: using mock guest user')
        user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@localhost' }
      }
    }

    const { name, description, icon, parentId } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    // Validate name length (max 100 characters)
    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Collection name must be 100 characters or less' },
        { status: 400 }
      )
    }

    // If parentId is provided, verify it exists and belongs to the user
    if (parentId) {
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

    const { data: collection, error: createError } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || '📁',
        parent_id: parentId || null,
        sort_order: 0,
        is_expanded: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('[Collections API] Create error:', createError)
      return NextResponse.json(
        { error: 'Failed to create collection' },
        { status: 500 }
      )
    }

    console.log('[Collections API] ✅ Created collection:', collection.id)

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        icon: collection.icon,
        parentId: collection.parent_id,
        sortOrder: collection.sort_order,
        isExpanded: collection.is_expanded,
        documentCount: 0,
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
