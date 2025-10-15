import { IAIService } from '@faro/core'

export interface TaxAdviceRequest {
  userId: string
  question: string
  taxYear?: number
  income?: number
  deductions?: Array<{ type: string; amount: number }>
}

export interface TaxAdviceResponse {
  advice: string
  potentialSavings?: number
  relevantLaws: string[]
  nextSteps: string[]
}

export class TaxAdvisorAgent {
  constructor(private readonly aiService: IAIService) {}

  async provideTaxAdvice(request: TaxAdviceRequest): Promise<TaxAdviceResponse> {
    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(request)

    const response = await this.aiService.generateResponse(userPrompt, [
      {
        role: 'system',
        content: systemPrompt,
      },
    ])

    return this.parseResponse(response)
  }

  private buildSystemPrompt(): string {
    return `You are an expert Japanese tax advisor with deep knowledge of:
- Japanese income tax laws (所得税法)
- Resident tax regulations
- Tax deductions and credits available in Japan
- Year-end tax adjustment (年末調整)
- Final tax return (確定申告)

Provide advice that is:
- Accurate according to current Japanese tax law
- Practical and actionable
- Focused on legal tax optimization
- Clear about deadlines and procedures

Format your response as JSON:
{
  "advice": "Main tax advice",
  "potentialSavings": 50000,
  "relevantLaws": ["Law 1", "Law 2"],
  "nextSteps": ["Step 1", "Step 2"]
}`
  }

  private buildUserPrompt(request: TaxAdviceRequest): string {
    let prompt = `Question: ${request.question}\n\n`

    if (request.taxYear) {
      prompt += `Tax Year: ${request.taxYear}\n`
    }
    if (request.income) {
      prompt += `Annual Income: ¥${request.income.toLocaleString()}\n`
    }
    if (request.deductions && request.deductions.length > 0) {
      prompt += '\nDeductions:\n'
      request.deductions.forEach((d) => {
        prompt += `- ${d.type}: ¥${d.amount.toLocaleString()}\n`
      })
    }

    return prompt
  }

  private parseResponse(content: string): TaxAdviceResponse {
    try {
      const parsed = JSON.parse(content)
      return {
        advice: parsed.advice || content,
        potentialSavings: parsed.potentialSavings,
        relevantLaws: parsed.relevantLaws || [],
        nextSteps: parsed.nextSteps || [],
      }
    } catch {
      return {
        advice: content,
        relevantLaws: [],
        nextSteps: [],
      }
    }
  }
}
