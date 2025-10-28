import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CreateUserProfileRequest, UpdateUserProfileRequest } from '../../../lib/types/userProfile'
import { UserKnowledgeBase } from '../../../lib/ai/knowledge-base'

// Edge Runtimeをコメントアウト（OpenTelemetryの互換性問題のため）
// export const runtime = 'edge'

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

// GET /api/profile - ユーザープロフィール取得
export async function GET(request: NextRequest) {
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

    // プロフィール取得
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      // プロフィールが存在しない場合は404ではなくnullを返す
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ profile: null }, { status: 200 })
      }

      console.error('[Profile API] Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('[Profile API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/profile - ユーザープロフィール作成
export async function POST(request: NextRequest) {
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

    const body = await request.json() as CreateUserProfileRequest

    // プロフィール作成
    const { data: profile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        ...body
      })
      .select()
      .single()

    if (createError) {
      console.error('[Profile API] Error creating profile:', createError)

      // すでに存在する場合
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Profile already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('[Profile API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - ユーザープロフィール更新
export async function PATCH(request: NextRequest) {
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
      console.error('[Profile API] Auth error:', authError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json() as UpdateUserProfileRequest

    // プロフィール更新
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[Profile API] Error updating profile:', updateError)
      console.error('[Profile API] Error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      })

      // プロフィールが存在しない場合
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profile not found. Please create a profile first.' },
          { status: 404 }
        )
      }

      // カラムが存在しない場合
      if (updateError.code === '42703' || updateError.message?.includes('column')) {
        return NextResponse.json(
          {
            error: 'Invalid profile field',
            details: updateError.message
          },
          { status: 400 }
        )
      }

      // その他のエラー
      return NextResponse.json(
        {
          error: 'Failed to update profile',
          details: updateError.message
        },
        { status: 500 }
      )
    }

    console.log('[Profile API] Profile updated successfully for user:', user.id)

    // ========================================
    // 自動インデックス化: プロフィール情報をナレッジベースに追加
    // ========================================
    try {
      const kb = new UserKnowledgeBase()
      const currentYear = new Date().getFullYear()
      const documents = []

      // 年収情報
      if (body.annual_income !== undefined) {
        documents.push({
          content: `年収は${Math.round(body.annual_income / 10000)}万円（${body.annual_income.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'income',
            year: currentYear,
            source: 'profile_update',
            importance: 'high' as const,
          },
        })
      }

      // 世帯年収情報
      if (body.household_income !== undefined) {
        documents.push({
          content: `世帯年収は${Math.round(body.household_income / 10000)}万円（${body.household_income.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'income',
            year: currentYear,
            source: 'profile_update',
            importance: 'high' as const,
          },
        })
      }

      // 配偶者情報
      if (body.has_spouse !== undefined) {
        documents.push({
          content: `配偶者は${body.has_spouse ? 'います' : 'いません'}。`,
          metadata: {
            type: 'profile' as const,
            category: 'family',
            year: currentYear,
            source: 'profile_update',
            importance: 'high' as const,
          },
        })
      }

      // 扶養家族情報
      if (body.dependents_count !== undefined) {
        documents.push({
          content: `扶養家族は${body.dependents_count}人います。`,
          metadata: {
            type: 'profile' as const,
            category: 'family',
            year: currentYear,
            source: 'profile_update',
            importance: 'high' as const,
          },
        })
      }

      // 職業・雇用形態
      if (body.occupation || body.employment_type) {
        const empTypeMap: Record<string, string> = {
          full_time: '正社員',
          part_time: 'パート・アルバイト',
          contract: '契約社員',
          freelance: 'フリーランス',
          self_employed: '自営業',
          unemployed: '無職',
          student: '学生',
          retired: '退職',
        }
        const occupation = body.occupation || '不明'
        const empType = body.employment_type ? empTypeMap[body.employment_type] || body.employment_type : ''
        documents.push({
          content: `職業は${occupation}${empType ? `（${empType}）` : ''}です。`,
          metadata: {
            type: 'profile' as const,
            category: 'occupation',
            year: currentYear,
            source: 'profile_update',
            importance: 'medium' as const,
          },
        })
      }

      // 住宅ローン情報
      if (body.has_mortgage !== undefined) {
        documents.push({
          content: `住宅ローンは${body.has_mortgage ? 'あります' : 'ありません'}。`,
          metadata: {
            type: 'profile' as const,
            category: 'housing',
            year: currentYear,
            source: 'profile_update',
            importance: 'medium' as const,
          },
        })
      }

      // 医療費情報
      if (body.medical_expenses !== undefined && body.medical_expenses > 0) {
        documents.push({
          content: `年間医療費は${Math.round(body.medical_expenses / 10000)}万円（${body.medical_expenses.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'deduction',
            year: currentYear,
            source: 'profile_update',
            importance: 'high' as const,
            tags: ['医療費控除'],
          },
        })
      }

      // 保険料情報
      if (body.insurance_premium !== undefined && body.insurance_premium > 0) {
        documents.push({
          content: `年間保険料は${Math.round(body.insurance_premium / 10000)}万円（${body.insurance_premium.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'insurance',
            year: currentYear,
            source: 'profile_update',
            importance: 'medium' as const,
          },
        })
      }

      // ふるさと納税情報
      if (body.donation_amount !== undefined && body.donation_amount > 0) {
        documents.push({
          content: `ふるさと納税額は${Math.round(body.donation_amount / 10000)}万円（${body.donation_amount.toLocaleString()}円）です。`,
          metadata: {
            type: 'profile' as const,
            category: 'deduction',
            year: currentYear,
            source: 'profile_update',
            importance: 'high' as const,
            tags: ['ふるさと納税', '寄付金控除'],
          },
        })
      }

      // バッチで保存（効率化）
      if (documents.length > 0) {
        // 既存の同カテゴリ・同年度のデータを削除（重複防止）
        const categoriesToDelete = Array.from(new Set(documents.map((d) => d.metadata.category)))
        for (const category of categoriesToDelete) {
          await kb.deleteDocuments(user.id, {
            types: ['profile'],
            category,
            year: currentYear,
          })
        }

        // 新しいデータを追加
        await kb.addDocuments(user.id, documents)
        console.log(`[Profile API] Indexed ${documents.length} profile updates to knowledge base`)
      }
    } catch (indexError) {
      // インデックス化エラーは致命的ではないのでログだけ出す
      console.error('[Profile API] Failed to index profile updates:', indexError)
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error: any) {
    console.error('[Profile API] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
