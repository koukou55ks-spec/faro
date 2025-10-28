/**
 * システムタブデータ管理API
 *
 * GET    /api/system-tabs?tab_id=basic_info&year=2024  - データ取得
 * POST   /api/system-tabs                              - バッチ更新
 * PATCH  /api/system-tabs                              - 単一フィールド更新
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserKnowledgeBase } from '../../../lib/ai/knowledge-base'
import { getSystemTab, validateField, getRequiredFields } from '../../../lib/constants/system-tabs'
import type { SystemTabId } from '../../../lib/types/systemTab'

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// ============================================================================
// GET - システムタブデータ取得
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url)
    const tabId = searchParams.get('tab_id') as SystemTabId | null
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null

    if (!tabId) {
      return NextResponse.json({ error: 'tab_id is required' }, { status: 400 })
    }

    // タブ定義確認
    const tabDefinition = getSystemTab(tabId)
    if (!tabDefinition) {
      return NextResponse.json({ error: 'Invalid tab_id' }, { status: 400 })
    }

    // データ取得
    let query = supabase
      .from('system_tab_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('tab_id', tabId)

    if (year !== null) {
      query = query.eq('year', year)
    } else {
      query = query.is('year', null)
    }

    const { data: rows, error: fetchError } = await query

    if (fetchError) {
      console.error('[SystemTab API] Fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // field_key → value のマップに変換
    const data: Record<string, any> = {}
    rows?.forEach((row) => {
      data[row.field_key] = row.value
    })

    // 完成度計算
    const requiredFields = getRequiredFields(tabId)
    const filledRequiredFields = requiredFields.filter((key) => {
      const value = data[key]
      return value !== null && value !== undefined && value !== '' && value !== 0
    })

    const completion = {
      total_fields: requiredFields.length,
      filled_fields: filledRequiredFields.length,
      completion_rate:
        requiredFields.length > 0
          ? (filledRequiredFields.length / requiredFields.length) * 100
          : 100,
    }

    return NextResponse.json({ data, completion }, { status: 200 })
  } catch (error: any) {
    console.error('[SystemTab API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - バッチ更新
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { tab_id, fields, year } = body

    if (!tab_id || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'tab_id and fields are required' },
        { status: 400 }
      )
    }

    // タブ定義確認
    const tabDefinition = getSystemTab(tab_id)
    if (!tabDefinition) {
      return NextResponse.json({ error: 'Invalid tab_id' }, { status: 400 })
    }

    // バリデーション
    const errors: Record<string, string> = {}
    for (const field of fields) {
      const validationError = validateField(tab_id, field.field_key, field.value)
      if (validationError) {
        errors[field.field_key] = validationError
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    // バッチ更新（upsert_system_tab_field関数を使用）
    let updatedCount = 0
    for (const field of fields) {
      const { error: upsertError } = await supabase.rpc('upsert_system_tab_field', {
        p_user_id: user.id,
        p_tab_id: tab_id,
        p_field_key: field.field_key,
        p_value: field.value,
        p_year: year || null,
        p_metadata: field.metadata || {},
      })

      if (upsertError) {
        console.error('[SystemTab API] Upsert error:', upsertError)
        return NextResponse.json(
          { error: 'Failed to update field', details: upsertError.message },
          { status: 500 }
        )
      }

      updatedCount++
    }

    // ========================================
    // ナレッジベースに自動保存
    // ========================================
    try {
      const kb = new UserKnowledgeBase()
      const currentYear = year || new Date().getFullYear()
      const documents = []

      for (const field of fields) {
        const fieldDef = tabDefinition.fields.find((f) => f.key === field.field_key)
        if (!fieldDef) continue

        // 値を人間が読める形式に変換
        let contentText = ''

        if (fieldDef.type === 'number') {
          const numValue = typeof field.value === 'number' ? field.value : parseFloat(field.value)
          if (isNaN(numValue)) continue

          const unit = fieldDef.unit || ''
          contentText = `${fieldDef.label}は${numValue.toLocaleString()}${unit}です。`

          // 万円の場合は円も併記
          if (unit === '万円') {
            const yen = numValue * 10000
            contentText = `${fieldDef.label}は${numValue}万円（${yen.toLocaleString()}円）です。`
          }
        } else if (fieldDef.type === 'boolean') {
          contentText = `${fieldDef.label}は${field.value ? 'はい' : 'いいえ'}です。`
        } else if (fieldDef.type === 'select') {
          contentText = `${fieldDef.label}は「${field.value}」です。`
        } else if (fieldDef.type === 'text' || fieldDef.type === 'textarea') {
          contentText = `${fieldDef.label}: ${field.value}`
        } else if (fieldDef.type === 'file' || fieldDef.type === 'files') {
          contentText = `${fieldDef.label}がアップロードされています。`
        } else {
          contentText = `${fieldDef.label}: ${field.value}`
        }

        documents.push({
          content: contentText,
          metadata: {
            type: 'profile' as const,
            category: tabDefinition.metadata.category,
            year: currentYear,
            source: 'system_tab',
            importance: fieldDef.importance || 'medium',
            field: field.field_key,
            tab_id: tab_id,
          },
        })
      }

      // 既存の同カテゴリのデータを削除（重複防止）- ループ外で1回のみ実行
      if (fields.length > 0) {
        await kb.deleteDocuments(user.id, {
          types: ['profile'],
          category: tabDefinition.metadata.category,
          year: currentYear,
        })
      }

      // 新しいデータを保存
      if (documents.length > 0) {
        await kb.addDocuments(user.id, documents)
        console.log(`[SystemTab API] Indexed ${documents.length} fields to knowledge base`)
      }
    } catch (kbError) {
      console.error('[SystemTab API] Failed to index to knowledge base:', kbError)
      // ナレッジベースエラーは致命的ではないのでログのみ
    }

    return NextResponse.json({ updated_count: updatedCount, success: true }, { status: 200 })
  } catch (error: any) {
    console.error('[SystemTab API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - 単一フィールド更新
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { tab_id, field_key, value, year, metadata } = body

    if (!tab_id || !field_key || value === undefined) {
      return NextResponse.json(
        { error: 'tab_id, field_key, and value are required' },
        { status: 400 }
      )
    }

    // バリデーション
    const validationError = validateField(tab_id, field_key, value)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // 更新
    const { data: resultId, error: upsertError } = await supabase.rpc(
      'upsert_system_tab_field',
      {
        p_user_id: user.id,
        p_tab_id: tab_id,
        p_field_key: field_key,
        p_value: value,
        p_year: year || null,
        p_metadata: metadata || {},
      }
    )

    if (upsertError) {
      console.error('[SystemTab API] Upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to update field', details: upsertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: resultId, success: true }, { status: 200 })
  } catch (error: any) {
    console.error('[SystemTab API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
