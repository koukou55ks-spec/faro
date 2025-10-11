import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@faro/infrastructure';
import { SendMessageUseCase } from '@faro/core';
import { SupabaseConversationRepository } from '@faro/infrastructure';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json();

    if (!message || !conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize services
    const geminiService = new GeminiService(process.env.GEMINI_API_KEY!);
    const conversationRepo = new SupabaseConversationRepository(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Execute use case
    const useCase = new SendMessageUseCase(conversationRepo, geminiService);
    const response = await useCase.execute(conversationId, userId, message);

    return NextResponse.json({
      id: response.id,
      content: response.content,
      role: response.role,
      timestamp: response.timestamp,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
