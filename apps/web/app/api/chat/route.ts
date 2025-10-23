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

    // バックグラウンドで情報抽出とembedding生成を実行（非同期、エラーでもレスポンスはブロックしない）
    (async () => {
      try {
        // 会話履歴を取得
        const conversation = await conversationRepo.findById(effectiveConversationId);
        if (!conversation || conversation.messages.length < 2) {
          return; // メッセージが少なすぎる場合はスキップ
        }

        // 最新のやり取り（ユーザー質問+AI応答）を使用
        const recentMessages = conversation.messages.slice(-4); // 直近2往復
        const messages = recentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // Supabaseクライアントを取得してトークンを生成（バックグラウンド処理用）
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY!
        );

        const { data: { user: dbUser } } = await supabase.auth.admin.getUserById(userId);
        if (!dbUser) {
          console.log('[Chat API] User not found for background extraction');
          return;
        }

        // 情報抽出を直接実行（内部関数として）
        const geminiForExtraction = new GeminiService(geminiApiKey!, false);

        // 簡易版: ユーザーメッセージから関心事と不安を抽出
        const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');

        // 関心事を検出
        const interests: string[] = [];
        if (userMessages.includes('NISA') || userMessages.includes('ニーサ')) interests.push('NISA');
        if (userMessages.includes('iDeCo') || userMessages.includes('イデコ') || userMessages.includes('確定拠出年金')) interests.push('iDeCo');
        if (userMessages.includes('ふるさと納税')) interests.push('ふるさと納税');
        if (userMessages.includes('住宅ローン') || userMessages.includes('住宅控除')) interests.push('住宅ローン控除');
        if (userMessages.includes('医療費控除')) interests.push('医療費控除');
        if (userMessages.includes('確定申告')) interests.push('確定申告');

        // 不安・悩みを検出
        const concerns: string[] = [];
        if (userMessages.match(/税金|節税|税対策/)) concerns.push('税金対策');
        if (userMessages.match(/年金|老後/)) concerns.push('年金不安');
        if (userMessages.match(/医療費|病気|保険/)) concerns.push('医療費');
        if (userMessages.match(/教育費|学費|子供/)) concerns.push('教育費');

        // プロフィール更新
        if (interests.length > 0 || concerns.length > 0) {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (existingProfile) {
            await supabase
              .from('user_profiles')
              .update({
                interests: Array.from(new Set([...(existingProfile.interests || []), ...interests])),
                concerns: Array.from(new Set([...(existingProfile.concerns || []), ...concerns])),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
          } else {
            await supabase
              .from('user_profiles')
              .insert({
                user_id: userId,
                interests,
                concerns
              });
          }

          console.log('[Chat API] Profile updated with interests:', interests, 'and concerns:', concerns);
        }

        // 質問履歴を保存
        await supabase
          .from('user_question_history')
          .insert({
            user_id: userId,
            question: message,
            keywords: [...interests, ...concerns],
            detected_concerns: concerns
          });

        console.log('[Chat API] Background processing completed');

      } catch (error) {
        console.error('[Chat API] Background processing error (non-blocking):', error);
      }
    })();

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
