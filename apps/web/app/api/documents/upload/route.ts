import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GeminiService } from '@faro/infrastructure'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for file processing

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB (Supabase free tier limit)
const MAX_CHUNK_SIZE = 1000 // tokens per chunk (~750 words)

/**
 * Extract text from uploaded file based on file type
 */
async function extractText(file: File): Promise<{ text: string; pageCount?: number }> {
  const buffer = await file.arrayBuffer()
  const fileType = file.type

  try {
    if (fileType === 'application/pdf') {
      // Dynamic import to avoid loading pdf-parse on module initialization
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(Buffer.from(buffer))
      return { text: data.text, pageCount: data.numpages }
    } else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
      return { text: await file.text() }
    } else if (fileType === 'text/markdown' || file.name.endsWith('.md')) {
      return { text: await file.text() }
    } else if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
      return { text: await file.text() }
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      // Dynamic import to avoid loading mammoth on module initialization
      const mammoth = (await import('mammoth')).default
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      return { text: result.value }
    }

    throw new Error(`Unsupported file type: ${fileType}`)
  } catch (error) {
    console.error('[ExtractText] Error:', error)
    throw new Error(`Failed to extract text from ${file.name}`)
  }
}

/**
 * Split text into chunks for embedding generation
 */
function chunkText(text: string, maxTokens: number = MAX_CHUNK_SIZE): string[] {
  // Simple word-based chunking with overlap
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentTokens = 0

  for (const word of words) {
    const wordTokens = Math.ceil(word.length / 4) // Rough token estimation

    if (currentTokens + wordTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '))
      // Add overlap (last 100 words)
      currentChunk = currentChunk.slice(-100)
      currentChunk.push(word)
      currentTokens = currentChunk.reduce((sum, w) => sum + Math.ceil(w.length / 4), 0)
    } else {
      currentChunk.push(word)
      currentTokens += wordTokens
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }

  return chunks.filter(c => c.trim().length > 0)
}

/**
 * Generate embeddings for document chunks (background processing)
 */
async function generateEmbeddings(
  documentId: string,
  text: string,
  userId: string
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const gemini = new GeminiService(process.env.GEMINI_API_KEY!)

  try {
    // Split into chunks
    const chunks = chunkText(text)
    console.log(`[Embeddings] Processing ${chunks.length} chunks for document ${documentId}`)

    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await gemini.generateEmbedding(chunks[i])

        await supabase
          .from('document_chunks')
          .insert({
            document_id: documentId,
            chunk_index: i,
            content: chunks[i],
            embedding: embedding,
          })

        // Rate limiting (Gemini free tier: 1,500 requests/min)
        if (i > 0 && i % 50 === 0) {
          console.log(`[Embeddings] Processed ${i}/${chunks.length} chunks`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`[Embeddings] Failed to process chunk ${i}:`, error)
      }
    }

    console.log(`[Embeddings] ✅ Completed ${chunks.length} chunks for document ${documentId}`)
  } catch (error) {
    console.error('[Embeddings] Fatal error:', error)
  }
}

/**
 * POST /api/documents/upload
 * Upload a document (PDF, TXT, MD, CSV, DOCX)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const isDevelopment = process.env.NODE_ENV === 'development'

    // Auth check (skip in development for faster testing)
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    let user: any = null

    if (!isDevelopment) {
      // Production: strict auth required
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized - Login required' }, { status: 401 })
      }

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
      }

      user = authUser
    } else {
      // Development: allow guest access with mock user
      if (token) {
        const { data: { user: authUser } } = await supabase.auth.getUser(token)
        user = authUser
      }

      // If no token in development, use mock user with valid UUID
      if (!user) {
        console.log('[Upload] Development mode: using mock guest user')
        user = {
          id: '00000000-0000-0000-0000-000000000000', // Valid UUID for development
          email: 'guest@localhost'
        }
      }
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const collectionId = formData.get('collectionId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    console.log('[Upload] Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)

    // 1. Extract text
    const { text, pageCount } = await extractText(file)
    const wordCount = text.split(/\s+/).length

    console.log('[Upload] Extracted:', wordCount, 'words', pageCount ? `from ${pageCount} pages` : '')

    // 2. Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'bin'
    const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // 3. Get file URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    // 4. Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: file.name,
        file_type: fileExt.toLowerCase(),
        file_url: publicUrl,
        file_size: file.size,
        word_count: wordCount,
        page_count: pageCount,
        collection_id: collectionId || null, // Direct assignment to collection
        content: text.substring(0, 10000), // Store first 10k chars for quick access
      })
      .select()
      .single()

    if (docError) {
      console.error('[Upload] Document DB error:', docError)
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([fileName])
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    // 5. Also add to collection_documents for backward compatibility
    if (collectionId) {
      const { error: collectionError } = await supabase
        .from('collection_documents')
        .insert({
          collection_id: collectionId,
          document_id: document.id
        })

      if (collectionError) {
        console.log('[Upload] Collection mapping (optional):', collectionError)
      }
    }

    // 6. Generate embeddings in background (non-blocking)
    // In production, use a queue system like Inngest, Bull, or Trigger.dev
    setTimeout(() => {
      generateEmbeddings(document.id, text, user.id)
        .catch(error => console.error('[Upload] Background embedding generation failed:', error))
    }, 0)

    console.log('[Upload] ✅ Document uploaded successfully:', document.id)

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        file_type: document.file_type,
        file_url: document.file_url,
        file_size: document.file_size,
        word_count: document.word_count,
        page_count: document.page_count,
        uploaded_at: document.uploaded_at,
      }
    })
  } catch (error: any) {
    console.error('[Upload] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
