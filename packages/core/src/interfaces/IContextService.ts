/**
 * Context Service Interface
 * Retrieves relevant user data (notes, messages, transactions) for AI context
 * This is the core of Faro's "Context is everything" principle
 */

export interface ContextItem {
  id: string
  content: string
  similarity: number
  type: 'note' | 'message' | 'transaction'
  metadata?: Record<string, any>
}

export interface UserContext {
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
  transactions?: Array<{
    id: string
    description: string
    amount: number
    similarity: number
  }>
}

export interface IContextService {
  /**
   * Retrieve relevant context for a user's query
   * @param query The user's question or message
   * @param userId The user ID to search context for
   * @param threshold Similarity threshold (0-1)
   * @param limit Maximum number of results per category
   * @returns Relevant context from all user data
   */
  retrieveContext(
    query: string,
    userId: string,
    threshold?: number,
    limit?: number
  ): Promise<UserContext>

  /**
   * Format context into a prompt string for AI
   * @param context The context object
   * @returns Formatted string ready to inject into AI prompt
   */
  formatContextForPrompt(context: UserContext): string
}
