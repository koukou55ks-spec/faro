import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { IContextService, UserContext } from '@faro/core'
import { IAIService } from '@faro/core'

/**
 * Extended UserContext with document chunks
 */
export interface ExtendedUserContext extends UserContext {
  documentChunks?: Array<{
    id: string
    documentId: string
    documentTitle: string
    content: string
    pageNumber?: number
    similarity: number
  }>
}

/**
 * Source selection options for context retrieval
 */
export interface SourceSelectionOptions {
  selectedDocuments?: string[]
  selectedCollections?: string[]
  includeNotes?: boolean
  includeMessages?: boolean
}

/**
 * Supabase implementation of Context Service
 * Uses pgvector for semantic search across user data
 */
export class SupabaseContextService implements IContextService {
  private supabase: SupabaseClient
  private aiService: IAIService

  constructor(supabaseUrl: string, supabaseKey: string, aiService: IAIService) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.aiService = aiService
  }

  async retrieveContext(
    query: string,
    userId: string,
    threshold: number = 0.6,
    limit: number = 3,
    options?: SourceSelectionOptions
  ): Promise<ExtendedUserContext> {
    // Generate embedding for the query
    const queryEmbedding = await this.aiService.generateEmbedding(query)

    const context: ExtendedUserContext = {
      notes: [],
      messages: [],
      documentChunks: [],
    }

    // Search notes (if enabled)
    if (options?.includeNotes !== false) {
      try {
        const { data: notesData, error: notesError } = await this.supabase.rpc('match_notes', {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit,
          user_id_filter: userId,
        })

        if (!notesError && notesData) {
          context.notes = notesData.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            similarity: note.similarity,
          }))
        }
      } catch (error) {
        console.warn('[SupabaseContextService] Notes search failed:', error)
      }
    }

    // Search messages (if enabled)
    if (options?.includeMessages !== false) {
      try {
        const { data: messagesData, error: messagesError } = await this.supabase.rpc(
          'match_messages',
          {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit,
            user_id_filter: userId,
          }
        )

        if (!messagesError && messagesData) {
          context.messages = messagesData.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            similarity: msg.similarity,
          }))
        }
      } catch (error) {
        console.warn('[SupabaseContextService] Messages search failed:', error)
      }
    }

    // Search document chunks
    try {
      let documentIds: string[] | undefined

      // If collections are selected, get all documents in those collections
      if (options?.selectedCollections && options.selectedCollections.length > 0) {
        const { data: collectionDocs } = await this.supabase
          .from('collection_documents')
          .select('document_id')
          .in('collection_id', options.selectedCollections)

        if (collectionDocs) {
          documentIds = collectionDocs.map((cd: any) => cd.document_id)
        }
      }

      // Merge with individually selected documents
      if (options?.selectedDocuments && options.selectedDocuments.length > 0) {
        documentIds = documentIds
          ? [...new Set([...documentIds, ...options.selectedDocuments])]
          : options.selectedDocuments
      }

      // Search document chunks if any documents are selected
      if (documentIds && documentIds.length > 0) {
        const { data: chunksData, error: chunksError } = await this.supabase.rpc(
          'match_document_chunks',
          {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit * 2, // Get more chunks for documents
            user_id_filter: userId,
            document_ids: documentIds,
          }
        )

        if (!chunksError && chunksData) {
          context.documentChunks = chunksData.map((chunk: any) => ({
            id: chunk.id,
            documentId: chunk.document_id,
            documentTitle: chunk.document_title,
            content: chunk.content,
            pageNumber: chunk.page_number,
            similarity: chunk.similarity,
          }))
        }
      }
    } catch (error) {
      console.warn('[SupabaseContextService] Document chunks search failed:', error)
    }

    console.log('[SupabaseContextService] Context retrieved:', {
      query,
      notesCount: context.notes?.length || 0,
      messagesCount: context.messages?.length || 0,
      documentChunksCount: context.documentChunks?.length || 0,
    })

    return context
  }

  formatContextForPrompt(context: UserContext | ExtendedUserContext): string {
    const parts: string[] = []
    const extendedContext = context as ExtendedUserContext

    // Document chunks first (highest priority)
    if (extendedContext.documentChunks && extendedContext.documentChunks.length > 0) {
      parts.push('\n## 📄 Relevant Documents')

      // Group chunks by document
      const docGroups = extendedContext.documentChunks.reduce((acc, chunk) => {
        if (!acc[chunk.documentId]) {
          acc[chunk.documentId] = {
            title: chunk.documentTitle,
            chunks: [],
          }
        }
        acc[chunk.documentId].chunks.push(chunk)
        return acc
      }, {} as Record<string, { title: string; chunks: typeof extendedContext.documentChunks }>)

      Object.entries(docGroups).forEach(([_, doc]) => {
        parts.push(`\n### ${doc.title}`)
        doc.chunks.forEach((chunk, i) => {
          const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : ''
          parts.push(`\n**Excerpt ${i + 1}${pageInfo}:**`)
          parts.push(chunk.content)
          parts.push(`_Relevance: ${(chunk.similarity * 100).toFixed(0)}%_`)
        })
      })
    }

    if (context.notes && context.notes.length > 0) {
      parts.push('\n## 📝 Relevant Notes from User')
      context.notes.forEach((note: any) => {
        parts.push(`\n### ${note.title}`)
        parts.push(note.content)
        if (note.similarity) {
          parts.push(`_Relevance: ${(note.similarity * 100).toFixed(0)}%_`)
        }
      })
    }

    if (context.messages && context.messages.length > 0) {
      parts.push('\n## 💬 Relevant Past Conversations')
      context.messages.forEach((msg: any, i: number) => {
        parts.push(`${i + 1}. ${msg.content}`)
        if (msg.similarity) {
          parts.push(`   _Relevance: ${(msg.similarity * 100).toFixed(0)}%_`)
        }
      })
    }

    if (parts.length === 0) {
      return ''
    }

    return `

---
# USER CONTEXT
Use the following information to personalize your response. This is the user's actual data.
When referencing documents, use the format: [Document: "Title" (Page X)]
${parts.join('\n')}
---

`
  }
}
