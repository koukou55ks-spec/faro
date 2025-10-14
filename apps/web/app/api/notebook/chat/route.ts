import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, projectId, conversationHistory } = await request.json()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (!message || !projectId) {
      return NextResponse.json(
        { error: 'Message and projectId are required' },
        { status: 400 }
      )
    }

    // Get user from token (with development mode support)
    let userId: string
    let user: any = null

    if (!isDevelopment) {
      // Production: strict auth required
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: { user: authUser } } = await supabase.auth.getUser(token)
      if (!authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser
      userId = user.id
    } else {
      // Development: allow guest access with mock user
      if (token) {
        const { data: { user: authUser } } = await supabase.auth.getUser(token)
        user = authUser
      }
      if (!user) {
        console.log('[Notebook Chat API] Development mode: using mock guest user')
        user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@localhost' }
      }
      userId = user.id
    }

    console.log('[Notebook Chat API] Processing message for project:', projectId)

    // 1. Get documents in this collection/project
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, title, content, file_path')
      .eq('collection_id', projectId)
      .eq('user_id', userId)

    if (docsError) {
      console.error('[Notebook Chat API] Error fetching documents:', docsError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        response: 'まだソースがアップロードされていません。ドキュメントをアップロードしてから質問してください。',
        sources: []
      })
    }

    console.log('[Notebook Chat API] Found', documents.length, 'documents')

    // 2. Generate embedding for the user's question
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })
    const embeddingResult = await embeddingModel.embedContent(message)
    const questionEmbedding = embeddingResult.embedding.values

    // 3. Search for relevant document chunks using vector similarity
    const { data: relevantChunks, error: searchError } = await supabase.rpc(
      'search_document_chunks',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.3,
        match_count: 5,
        p_collection_id: projectId
      }
    )

    if (searchError) {
      console.error('[Notebook Chat API] Error searching documents:', searchError)
      // Fallback: use raw document content
    }

    // 4. Build context from relevant chunks or full documents
    let context = ''
    let sources: Array<{ documentId: string; documentTitle: string; excerpt: string }> = []

    if (relevantChunks && relevantChunks.length > 0) {
      console.log('[Notebook Chat API] Found', relevantChunks.length, 'relevant chunks')

      relevantChunks.forEach((chunk: any) => {
        const doc = documents.find(d => d.id === chunk.document_id)
        if (doc) {
          context += `\n\n--- ${doc.title} ---\n${chunk.content}`
          sources.push({
            documentId: doc.id,
            documentTitle: doc.title,
            excerpt: chunk.content.substring(0, 150) + '...'
          })
        }
      })
    } else {
      // Fallback: use all document content (for small documents)
      console.log('[Notebook Chat API] Using full document content')
      documents.forEach(doc => {
        if (doc.content) {
          context += `\n\n--- ${doc.title} ---\n${doc.content.substring(0, 2000)}`
          sources.push({
            documentId: doc.id,
            documentTitle: doc.title,
            excerpt: doc.content.substring(0, 150) + '...'
          })
        }
      })
    }

    // 5. Build conversation history for context
    const history = conversationHistory
      ?.slice(-10) // Last 10 messages
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n') || ''

    // 6. Generate AI response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `あなたはNotebookLMのAIアシスタントです。ユーザーがアップロードした資料に基づいて、正確に回答してください。

【重要なルール】
1. 必ず提供された資料の内容に基づいて回答してください
2. 資料に記載されていない情報を推測で答えないでください
3. 資料から引用する場合は、どのドキュメントから引用したか明確にしてください
4. 資料に情報がない場合は、正直に「その情報は資料に含まれていません」と答えてください
5. 日本語で回答してください

【会話履歴】
${history}

【アップロードされた資料】
${context}

【ユーザーの質問】
${message}

【回答】`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log('[Notebook Chat API] Generated response, sources:', sources.length)

    // Remove duplicate sources
    const uniqueSources = sources.filter(
      (source, index, self) =>
        index === self.findIndex(s => s.documentId === source.documentId)
    )

    return NextResponse.json({
      response,
      sources: uniqueSources.slice(0, 3) // Max 3 sources to display
    })
  } catch (error: any) {
    console.error('[Notebook Chat API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
