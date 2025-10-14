import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { GeminiService } from '@faro/infrastructure'

export const runtime = 'nodejs'

interface ContextResult {
  notes: Array<{
    id: string
    title: string
    content: string
    similarity: number
  }>
  messages: Array<{
    id: string
    content: string
    similarity: number
  }>
  // Future: transactions, goals, etc.
}

/**
 * Context API - Retrieves relevant user data for AI chat
 * This is the core of Faro's "Context is everything" principle
 *
 * Given a user's question, this API:
 * 1. Generates embedding for the question
 * 2. Searches across all user data (notes, messages, transactions)
 * 3. Returns the most relevant context for AI to use
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, userId, threshold = 0.6, limit = 3 } = body

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'query and userId are required' },
        { status: 400 }
      )
    }

    // Guest users don't have server-side context
    if (userId === 'guest') {
      return NextResponse.json({
        notes: [],
        messages: [],
        contextAvailable: false
      })
    }

    // Generate embedding for the query
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[Context API] GEMINI_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const geminiService = new GeminiService(apiKey)
    const queryEmbedding = await geminiService.generateEmbedding(query)

    const supabase = await createClient()
    const context: ContextResult = {
      notes: [],
      messages: [],
    }

    // Search notes
    try {
      const { data: notesData, error: notesError } = await supabase.rpc('match_notes', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        user_id_filter: userId,
      })

      if (!notesError && notesData) {
        context.notes = notesData.map((note: any) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          similarity: note.similarity,
        }))
      }
    } catch (error) {
      console.warn('[Context API] Notes search failed:', error)
      // Continue even if notes search fails
    }

    // Search messages
    try {
      const { data: messagesData, error: messagesError } = await supabase.rpc('match_messages', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        user_id_filter: userId,
      })

      if (!messagesError && messagesData) {
        context.messages = messagesData.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          similarity: msg.similarity,
        }))
      }
    } catch (error) {
      console.warn('[Context API] Messages search failed:', error)
      // Continue even if messages search fails
    }

    // TODO: Add transactions search when implemented
    // TODO: Add goals search when implemented

    console.log('[Context API] Context retrieved:', {
      query,
      notesCount: context.notes.length,
      messagesCount: context.messages.length,
      totalContext: context.notes.length + context.messages.length,
    })

    return NextResponse.json({
      ...context,
      contextAvailable: true,
      query,
      threshold,
    })
  } catch (error: any) {
    console.error('[Context API] Unexpected error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to format context for AI prompt
 * Usage example in chat API:
 *
 * const contextData = await fetch('/api/context', {
 *   method: 'POST',
 *   body: JSON.stringify({ query: userMessage, userId })
 * }).then(r => r.json())
 *
 * const contextPrompt = formatContextForAI(contextData)
 * const aiResponse = await gemini.generateResponse(userMessage + '\n\n' + contextPrompt)
 */
function formatContextForAI(context: ContextResult): string {
  const parts: string[] = []

  if (context.notes.length > 0) {
    parts.push('# Relevant notes from user:')
    context.notes.forEach((note, i) => {
      parts.push(`\n## Note ${i + 1}: ${note.title}`)
      parts.push(note.content)
      parts.push(`(relevance: ${(note.similarity * 100).toFixed(1)}%)`)
    })
  }

  if (context.messages.length > 0) {
    parts.push('\n# Relevant past conversations:')
    context.messages.forEach((msg, i) => {
      parts.push(`\n${i + 1}. ${msg.content}`)
      parts.push(`(relevance: ${(msg.similarity * 100).toFixed(1)}%)`)
    })
  }

  if (parts.length === 0) {
    return ''
  }

  return `\n\n--- USER CONTEXT (use this to personalize your response) ---\n${parts.join('\n')}\n--- END CONTEXT ---`
}
