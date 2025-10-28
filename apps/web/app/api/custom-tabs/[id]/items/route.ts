import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CustomTabItemCreateRequest } from '../../../../../types/custom-tabs'
import { UserKnowledgeBase } from '../../../../../lib/ai/knowledge-base'

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    console.error('[Custom Tab Items API] Missing environment variables:', {
      hasUrl: !!url,
      hasKey: !!key
    })
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

// GET /api/custom-tabs/[id]/items - タブのアイテム一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()

    // Authorization ヘッダーからトークン取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // ユーザー認証
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: tabId } = await params

    // タブのアイテム取得（表示順序でソート）
    const { data: items, error: itemsError } = await supabase
      .from('user_custom_tab_items')
      .select('*')
      .eq('tab_id', tabId)
      .eq('user_id', user.id)
      .order('display_order', { ascending: true })

    if (itemsError) {
      console.error('[Custom Tab Items API] Error fetching items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: items || [] }, { status: 200 })
  } catch (error) {
    console.error('[Custom Tab Items API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/custom-tabs/[id]/items - タブにアイテム追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()

    // Authorization ヘッダーからトークン取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // ユーザー認証
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json() as CustomTabItemCreateRequest
    const { id: tabId } = await params

    // タブの所有権確認
    const { data: tab, error: tabError } = await supabase
      .from('user_custom_tabs')
      .select('id')
      .eq('id', tabId)
      .eq('user_id', user.id)
      .single()

    if (tabError || !tab) {
      return NextResponse.json(
        { error: 'Tab not found or access denied' },
        { status: 404 }
      )
    }

    // 表示順序が指定されていない場合、最後尾に追加
    let displayOrder = body.display_order
    if (displayOrder === undefined) {
      const { count } = await supabase
        .from('user_custom_tab_items')
        .select('*', { count: 'exact', head: true })
        .eq('tab_id', tabId)

      displayOrder = (count || 0)
    }

    // アイテム作成
    const { data: item, error: createError } = await supabase
      .from('user_custom_tab_items')
      .insert({
        tab_id: tabId,
        user_id: user.id,
        item_type: body.item_type,
        title: body.title,
        content: body.content,
        file_url: body.file_url,
        file_type: body.file_type,
        file_size: body.file_size,
        display_order: displayOrder,
        metadata: body.metadata
      })
      .select()
      .single()

    if (createError) {
      console.error('[Custom Tab Items API] Error creating item:', createError)
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      )
    }

    // ========================================
    // ナレッジベースに自動保存
    // ========================================
    try {
      const kb = new UserKnowledgeBase()

      // タブのテンプレート情報を取得
      const { data: tabWithTemplate } = await supabase
        .from('user_custom_tabs')
        .select('template_id, category, tags')
        .eq('id', tabId)
        .single()

      let category = 'custom_tab'
      let tags: string[] = []

      // テンプレートが設定されている場合、メタデータを取得
      if (tabWithTemplate?.template_id) {
        const { data: template } = await supabase
          .from('custom_tab_templates')
          .select('category, default_tags')
          .eq('id', tabWithTemplate.template_id)
          .single()

        if (template) {
          category = template.category || 'custom_tab'
          tags = template.default_tags || []
        }
      } else if (tabWithTemplate?.category) {
        // テンプレートがなくてもcategoryが設定されている場合
        category = tabWithTemplate.category
        tags = tabWithTemplate.tags || []
      }

      // コンテンツを構築（タイトル + 内容）
      let contentText = ''
      if (body.title && body.content) {
        contentText = `${body.title}: ${body.content}`
      } else if (body.content) {
        contentText = body.content
      } else if (body.title) {
        contentText = body.title
      }

      // ファイルの場合
      if (body.item_type === 'file' && body.title) {
        contentText = `${body.title}（${body.file_type || 'ファイル'}）がアップロードされています。`
      }

      // ナレッジベースに追加
      if (contentText) {
        await kb.addDocument(user.id, contentText, {
          type: 'custom_tab',
          category: category,
          year: new Date().getFullYear(),
          source: 'custom_tab',
          importance: 'medium',
          tags: tags,
        })
        console.log(`[Custom Tab Items API] Indexed item to knowledge base: ${contentText.substring(0, 50)}...`)
      }
    } catch (kbError) {
      console.error('[Custom Tab Items API] Failed to index to knowledge base:', kbError)
      // ナレッジベースエラーは致命的ではないのでログのみ
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('[Custom Tab Items API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
