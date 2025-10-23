import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge'

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key)
}

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }
  return new GoogleGenerativeAI(apiKey)
}

// テキストからembeddingを生成してベクトルDBに保存
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const gemini = getGeminiClient()

    // Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { content, contentType, sourceId, metadata } = body as {
      content: string
      contentType: 'chat' | 'note' | 'profile' | 'life_event'
      sourceId?: string
      metadata?: Record<string, any>
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Gemini Embedding APIでベクトル生成
    const embeddingModel = gemini.getGenerativeModel({ model: 'text-embedding-004' })

    const embeddingResult = await embeddingModel.embedContent(content)
    const embedding = embeddingResult.embedding.values

    if (!embedding || embedding.length === 0) {
      throw new Error('Failed to generate embedding')
    }

    // ベクトルDBに保存
    const { data: vectorData, error: insertError } = await supabase
      .from('user_context_vectors')
      .insert({
        user_id: user.id,
        content,
        content_type: contentType,
        source_id: sourceId || null,
        embedding,
        metadata: metadata || {}
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Generate Embedding] Error inserting vector:', insertError)
      throw new Error('Failed to save embedding to database')
    }

    console.log('[Generate Embedding] Successfully generated and saved embedding:', {
      user_id: user.id,
      content_type: contentType,
      embedding_dimension: embedding.length
    })

    return NextResponse.json({
      success: true,
      vectorId: vectorData.id,
      dimension: embedding.length
    }, { status: 200 })

  } catch (error) {
    console.error('[Generate Embedding] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ベクトル検索（類似コンテンツ検索）
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const gemini = getGeminiClient()

    // Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // クエリのembeddingを生成
    const embeddingModel = gemini.getGenerativeModel({ model: 'text-embedding-004' })
    const embeddingResult = await embeddingModel.embedContent(query)
    const queryEmbedding = embeddingResult.embedding.values

    // pgvectorで類似検索（コサイン類似度）
    // Note: Supabase JSクライアントではRPCを使用
    const { data: similarVectors, error: searchError } = await supabase
      .rpc('match_user_context_vectors', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit,
        filter_user_id: user.id
      })

    if (searchError) {
      console.error('[Vector Search] Error:', searchError)
      // RPC関数が存在しない場合は、通常のクエリで全件取得して後でフィルタ
      // 本番では必ずRPC関数を作成すること
      const { data: allVectors } = await supabase
        .from('user_context_vectors')
        .select('*')
        .eq('user_id', user.id)
        .limit(limit)

      return NextResponse.json({
        success: true,
        results: allVectors || [],
        note: 'Vector similarity search function not available, returning recent entries'
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      results: similarVectors || []
    }, { status: 200 })

  } catch (error) {
    console.error('[Vector Search] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
