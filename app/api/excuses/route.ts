import { NextRequest } from 'next/server'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as Category | '전체' | null
  const limit = parseInt(searchParams.get('limit') ?? '20')

  let query = supabase
    .from('excuses')
    .select('*')
    .eq('is_public', true)
    .order('votes', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category && category !== '전체') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ excuses: data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { situation, category, tone, content, listener_type, predicted_reaction, believability_score, is_public } = body

    if (!situation || !category || !tone || !content) {
      return Response.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('excuses')
      .insert({
        situation,
        category,
        tone,
        content,
        listener_type: listener_type ?? null,
        predicted_reaction: predicted_reaction ?? null,
        believability_score: believability_score ?? null,
        votes: 0,
        is_public: is_public ?? false,
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ excuse: data }, { status: 201 })
  } catch (err) {
    console.error('excuses POST error:', err)
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
