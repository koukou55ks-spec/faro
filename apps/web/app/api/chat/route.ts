import { NextRequest, NextResponse } from 'next/server';
import { GeminiService, SupabaseContextService } from '@faro/infrastructure';
import { SendMessageUseCase } from '@faro/core';
import { SupabaseConversationRepository } from '@faro/infrastructure/src/database/SupabaseConversationRepository';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId, guestNotes, sourceSelection, expertMode, stream } = await request.json();

    console.log('[Chat API] Request received:', {
      message: message.substring(0, 50),
      userId,
      guestNotesCount: guestNotes?.length || 0,
      sourceSelection,
      stream
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize services
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const geminiService = new GeminiService(geminiApiKey, expertMode);

    // For guest users (no userId), skip database and use in-memory conversation
    if (!userId || userId === 'anonymous' || userId === 'guest') {
      console.log('[Chat API] Guest user detected, building context from notes...');

      // Build context from guest notes
      let contextPrompt = '';
      if (guestNotes && Array.isArray(guestNotes) && guestNotes.length > 0) {
        console.log('[Chat API] Found', guestNotes.length, 'guest notes');
        contextPrompt = '\n\n【ユーザーのノート（参考情報）】\n';
        guestNotes.forEach((note: any) => {
          console.log('[Chat API] Adding note:', note.title);
          contextPrompt += `\n■ ${note.title}\n${note.content}\n`;
          if (note.tags && note.tags.length > 0) {
            contextPrompt += `タグ: ${note.tags.join(', ')}\n`;
          }
        });
        contextPrompt += '\n上記のノート内容を参考にして、ユーザーの質問に答えてください。\n';
      } else {
        console.log('[Chat API] No guest notes found');
      }

      const promptWithContext = message + contextPrompt;
      console.log('[Chat API] Final prompt length:', promptWithContext.length);

      // Streaming response
      if (stream) {
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of geminiService.generateResponseStream(promptWithContext, [])) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              console.error('[Chat API] Streaming error:', error);
              controller.error(error);
            }
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      // Non-streaming response (fallback)
      const aiResponse = await geminiService.generateResponse(promptWithContext, []);

      return NextResponse.json({
        success: true,
        data: {
          assistantMessage: {
            id: crypto.randomUUID(),
            content: aiResponse,
            role: 'assistant',
            timestamp: new Date(),
          },
          conversationId: conversationId || crypto.randomUUID(),
        },
        answer: aiResponse,
        response: aiResponse,
      });
    }

    // For authenticated users, use full database persistence
    const conversationRepo = new SupabaseConversationRepository(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const contextService = new SupabaseContextService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      geminiService
    );

    const effectiveConversationId = conversationId || crypto.randomUUID();

    // Ensure conversation exists before adding messages
    const existingConversation = await conversationRepo.findById(effectiveConversationId);
    if (!existingConversation) {
      const { ConversationEntity } = await import('@faro/core');
      const newConversation = new ConversationEntity(
        effectiveConversationId,
        userId,
        'New Conversation',
        [],
        new Date(),
        new Date()
      );
      await conversationRepo.create(newConversation);
    }

    // Execute use case with context service and source selection
    const useCase = new SendMessageUseCase(conversationRepo, geminiService, contextService);
    const assistantMessage = await useCase.execute(
      effectiveConversationId,
      userId,
      message,
      sourceSelection // Pass source selection from frontend
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
