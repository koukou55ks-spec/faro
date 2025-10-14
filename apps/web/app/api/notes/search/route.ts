import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GeminiService } from '@faro/infrastructure'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, userId, threshold = 0.5, limit = 5 } = body

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'query and userId are required' },
        { status: 400 }
      )
    }

    // Guest users don't have embeddings
    if (userId === 'guest') {
      return NextResponse.json({ notes: [] })
    }

    // Generate embedding for the search query
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[Notes Search API] GEMINI_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const geminiService = new GeminiService(apiKey)
    const queryEmbedding = await geminiService.generateEmbedding(query)

    // Search using pgvector similarity
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('match_notes', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      user_id_filter: userId,
    })

    if (error) {
      console.error('[Notes Search API] Search error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Notes Search API] Found notes:', {
      query,
      resultsCount: data?.length || 0,
      threshold,
    })

    return NextResponse.json({
      notes: data || [],
      query,
      resultsCount: data?.length || 0,
    })
  } catch (error: any) {
    console.error('[Notes Search API] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
