import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@faro/infrastructure';
import { SendMessageUseCase } from '@faro/core';
import { SupabaseConversationRepository } from '@faro/infrastructure';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use provided userId or default guest ID
    const effectiveUserId = userId || '00000000-0000-0000-0000-000000000000';

    // Generate or use provided conversationId
    const effectiveConversationId = conversationId || `conv-${Date.now()}-${effectiveUserId}`;

    // Initialize services
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const geminiService = new GeminiService(geminiApiKey);
    const conversationRepo = new SupabaseConversationRepository(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Execute use case
    const useCase = new SendMessageUseCase(conversationRepo, geminiService);
    const assistantMessage = await useCase.execute(
      effectiveConversationId,
      effectiveUserId,
      message
    );

    // Return in the format expected by the frontend
    return NextResponse.json({
      success: true,
      data: {
        assistantMessage: {
          id: assistantMessage.id,
          content: assistantMessage.content,
          role: assistantMessage.role,
          timestamp: assistantMessage.timestamp,
        },
        conversationId: effectiveConversationId,
      },
      answer: assistantMessage.content,
      response: assistantMessage.content,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
