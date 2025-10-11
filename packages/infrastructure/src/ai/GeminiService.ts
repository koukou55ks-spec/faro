import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIService } from '@faro/core';

export class GeminiService implements IAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateResponse(
    prompt: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: conversationHistory?.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })) || [],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Gemini embedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
