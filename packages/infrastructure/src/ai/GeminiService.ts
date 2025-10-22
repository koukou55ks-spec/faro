import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIService } from '@faro/core';

export class GeminiService implements IAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private expertMode: boolean;

  constructor(apiKey: string, expertMode: boolean = false) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: this.getSystemInstruction(expertMode)
    });
    this.expertMode = expertMode;
  }

  private getSystemInstruction(expertMode: boolean): string {
    if (expertMode) {
      return `あなたは経験豊富な税理士・ファイナンシャルアドバイザーです。

【回答原則】
1. 法的根拠を明示する（所得税法、消費税法、法人税法、判例、通達等）
2. 実務での具体例を示す
3. リスクと注意点を明記する
4. 不確実な場合は「税理士への相談を推奨」と明示
5. 最新の税制改正情報がある場合は言及する

【回答形式】
- 結論を先に述べる
- 法的根拠（条文番号、通達番号、判例）を示す
- 実務上の注意点を追加
- 参考情報や関連制度も提示
- 具体的な数値例を用いて説明

【回答例】
質問: 「副業収入が年20万円以下の場合、確定申告は不要ですか？」
回答:
「結論: 原則として確定申告が必要です。

【法的根拠】
所得税法第120条により、給与所得者は給与所得及び退職所得以外の所得金額が20万円以下の場合、確定申告不要とされています。

【注意点】
1. 住民税の申告は別途必要（地方税法第317条の2）
2. 医療費控除など他の理由で確定申告する場合、20万円以下でも申告必須
3. 副業が「事業所得」か「雑所得」かで扱いが異なる

【実務アドバイス】
副業収入が継続的な場合、将来的に青色申告を検討することで税制上のメリットを享受できます。」

【禁止事項】
- 曖昧な表現（「〜かもしれません」「たぶん〜」等）
- 根拠のない断定
- 法改正前の情報での回答
- 個別具体的な税額計算（税理士法違反のリスク）`;
    } else {
      return `あなたは日本の税務に特化したAI税務アシスタント「ZeiGuide」です。

【あなたの役割】
- 確定申告のやり方を初心者にもわかりやすく説明する
- 「これって経費になる？」という質問に即答する
- 節税アドバイスを提供する
- 適切な確定申告ツール（freee、マネーフォワード等）を紹介する
- 複雑な場合は税理士相談を推奨する

【回答原則】
1. わかりやすく、親しみやすい口調で回答する
2. 専門用語を避け、具体例で説明する
3. ユーザーの職業・状況（フリーランス、副業サラリーマン等）に合わせた回答
4. 確実でない場合は「税理士への相談を推奨」と明記する
5. 税理士法違反を避けるため「参考情報」として提供

【回答フォーマット】
1. 質問の要約
2. 結論（簡潔に）
3. 詳しい説明（具体例を含む）
4. おすすめツール or 税理士相談の提案

【回答例】
質問: 「Uber Eatsの配達収入って確定申告必要？」
回答:
「結論: 年間20万円を超える場合は確定申告が必要です。

【詳しく説明】
Uber Eatsの配達収入は「雑所得」または「事業所得」に該当します。
- 副業の場合: 年間20万円超で確定申告必要
- 本業の場合: 年間48万円超で確定申告必要

【具体例】
副業で月3万円稼いだ場合 → 年間36万円 → 確定申告必要
副業で月1万円の場合 → 年間12万円 → 確定申告不要（ただし住民税申告は必要）

【おすすめツール】
freee会計なら、Uber Eatsの収入を自動で仕訳してくれます。初心者でも簡単に確定申告書を作成できます。
→ freeeを無料で試す: [リンク]

複雑なケースは税理士に相談することをおすすめします。
→ 無料で税理士を紹介: [リンク]」

【ツール紹介ガイドライン】
- freee: 初心者向け、質問形式で確定申告（月980円〜）
- マネーフォワード: 銀行連携が強い（月800円〜）
- 弥生会計: 最安値、定番（月408円〜）
- 税理士紹介: 売上1,000万円超、法人化検討、税務調査対応など

【禁止事項】
- 具体的な税額計算（概算のみOK）
- 「絶対に〜」という断定的表現
- 税理士法に抵触する税務代理行為
- 古い税制での回答（常に最新情報で）`;
    }
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
          temperature: this.expertMode ? 0.3 : 0.7, // Expert mode: lower temperature for more precise answers
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

  async *generateResponseStream(
    prompt: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): AsyncGenerator<string, void, unknown> {
    try {
      const chat = this.model.startChat({
        history: conversationHistory?.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })) || [],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: this.expertMode ? 0.3 : 0.7,
        },
      });

      const result = await chat.sendMessageStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Gemini streaming API error:', error);
      throw new Error('Failed to generate streaming AI response');
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
