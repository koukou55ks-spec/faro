/**
 * Chat API Route - Clean Architecture Implementation
 * Uses @faro/core and @faro/infrastructure packages
 */

import { NextRequest, NextResponse } from 'next/server'
import { SendMessageUseCase } from '@faro/core'
import { InMemoryConversationRepository, GeminiService } from '@faro/infrastructure'
import { randomUUID } from 'crypto'

// Use in-memory repository to bypass RLS issues during development
const conversationRepository = new InMemoryConversationRepository()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { conversationId, userId, message } = body

    console.log('Chat API received:', { conversationId, userId, message })

    if (!message || !userId) {
      console.error('Missing required fields:', { message: !!message, userId: !!userId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Auto-generate conversationId if not provided
    if (!conversationId) {
      conversationId = randomUUID()
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }
    const aiService = new GeminiService(geminiApiKey)

    // Execute use case
    const sendMessageUseCase = new SendMessageUseCase(conversationRepository, aiService)

    const result = await sendMessageUseCase.execute({
      conversationId,
      userId,
      content: message,
    })

    return NextResponse.json({
      success: true,
      data: {
        userMessage: result.userMessage.toJSON(),
        assistantMessage: result.assistantMessage.toJSON(),
        conversation: result.conversation.toJSON(),
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)

    if (error instanceof Error) {
      if (error.message === 'Conversation not found') {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      // Return detailed error for debugging
      return NextResponse.json({
        error: 'Internal server error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
