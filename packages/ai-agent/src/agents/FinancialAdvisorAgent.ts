import { IAIService } from '@faro/core'

export interface FinancialAdviceRequest {
  userId: string
  question: string
  context?: {
    monthlyIncome?: number
    monthlyExpenses?: number
    savingsGoal?: number
    riskTolerance?: 'low' | 'medium' | 'high'
  }
}

export interface FinancialAdviceResponse {
  advice: string
  recommendations: string[]
  relatedTopics: string[]
}

export class FinancialAdvisorAgent {
  constructor(private readonly aiService: IAIService) {}

  async provideAdvice(request: FinancialAdviceRequest): Promise<FinancialAdviceResponse> {
    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(request)

    const response = await this.aiService.generateResponse({
      conversationHistory: [
        {
          id: 'system',
          conversationId: 'financial-advisor',
          role: 'system',
          content: systemPrompt,
          createdAt: new Date(),
        } as any,
        {
          id: 'user',
          conversationId: 'financial-advisor',
          role: 'user',
          content: userPrompt,
          createdAt: new Date(),
        } as any,
      ],
      systemPrompt,
    })

    return this.parseResponse(response.content)
  }

  private buildSystemPrompt(): string {
    return `You are a professional financial advisor specializing in personal finance in Japan.
Your role is to provide expert financial advice that is:
- Practical and actionable
- Tailored to the Japanese market and regulations
- Based on sound financial principles
- Clear and easy to understand

Always consider:
- Japanese tax laws and regulations
- Local investment options (NISA, iDeCo, etc.)
- Japanese cultural context around money
- Long-term financial planning

Format your response as JSON with the following structure:
{
  "advice": "Main financial advice",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "relatedTopics": ["Topic 1", "Topic 2", ...]
}`
  }

  private buildUserPrompt(request: FinancialAdviceRequest): string {
    let prompt = `Question: ${request.question}\n\n`

    if (request.context) {
      prompt += 'Context:\n'
      if (request.context.monthlyIncome) {
        prompt += `- Monthly Income: ¥${request.context.monthlyIncome.toLocaleString()}\n`
      }
      if (request.context.monthlyExpenses) {
        prompt += `- Monthly Expenses: ¥${request.context.monthlyExpenses.toLocaleString()}\n`
      }
      if (request.context.savingsGoal) {
        prompt += `- Savings Goal: ¥${request.context.savingsGoal.toLocaleString()}\n`
      }
      if (request.context.riskTolerance) {
        prompt += `- Risk Tolerance: ${request.context.riskTolerance}\n`
      }
    }

    return prompt
  }

  private parseResponse(content: string): FinancialAdviceResponse {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content)
      return {
        advice: parsed.advice || content,
        recommendations: parsed.recommendations || [],
        relatedTopics: parsed.relatedTopics || [],
      }
    } catch {
      // Fallback: return content as advice
      return {
        advice: content,
        recommendations: [],
        relatedTopics: [],
      }
    }
  }
}
