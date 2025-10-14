import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * GET /api/documents
 * Get all documents for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const isDevelopment = process.env.NODE_ENV === 'development'
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collectionId')

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
        user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@localhost' }
      }
    }

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    const { data: documents, error } = await query.order('uploaded_at', { ascending: false })

    if (error) {
      console.error('[Documents API] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({ documents: documents || [] })
  } catch (error: any) {
    console.error('[Documents API] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
