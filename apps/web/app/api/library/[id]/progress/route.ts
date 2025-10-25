import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: progress, error } = await supabase
      .from('user_library_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ progress: progress || null })
  } catch (error) {
    console.error('[Progress API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, progress_percentage, score } = body

    const { data: existingProgress } = await supabase
      .from('user_library_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', id)
      .single()

    let result
    if (existingProgress) {
      const { data, error } = await supabase
        .from('user_library_progress')
        .update({
          status: status || existingProgress.status,
          progress_percentage: progress_percentage ?? existingProgress.progress_percentage,
          score: score ?? existingProgress.score,
          completed_at: status === 'completed' ? new Date().toISOString() : existingProgress.completed_at,
          last_accessed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('content_id', id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase
        .from('user_library_progress')
        .insert({
          user_id: user.id,
          content_id: id,
          status: status || 'in_progress',
          progress_percentage: progress_percentage || 0,
          score,
          started_at: new Date().toISOString(),
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          last_accessed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ progress: result })
  } catch (error) {
    console.error('[Progress API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(req, { params })
}
