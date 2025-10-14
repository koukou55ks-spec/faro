import { NextRequest, NextResponse } from 'next/server'
import { GeminiService } from '@faro/infrastructure'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, type } = body // type: 'note' | 'message' | 'transaction'

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[Embeddings API] GEMINI_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const geminiService = new GeminiService(apiKey)
    const embedding = await geminiService.generateEmbedding(text)

    return NextResponse.json({
      embedding,
      dimensions: embedding.length,
      type
    })
  } catch (error: any) {
    console.error('[Embeddings API] Error generating embedding:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate embedding' },
      { status: 500 }
    )
  }
}
