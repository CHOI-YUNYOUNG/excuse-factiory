import { NextRequest } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/excuses/[id]/vote'>
) {
  try {
    const { id } = await ctx.params
    const { sessionId } = await request.json() as { sessionId: string }

    if (!sessionId) {
      return Response.json({ error: 'sessionId가 필요합니다.' }, { status: 400 })
    }

    // 중복 투표 확인
    const { data: existing } = await supabase
      .from('votes_log')
      .select('id')
      .eq('excuse_id', id)
      .eq('voter_session_id', sessionId)
      .single()

    if (existing) {
      return Response.json({ error: '이미 투표하셨습니다.', alreadyVoted: true }, { status: 409 })
    }

    // 투표 로그 추가
    const { error: logError } = await supabase
      .from('votes_log')
      .insert({ excuse_id: id, voter_session_id: sessionId })

    if (logError) {
      return Response.json({ error: logError.message }, { status: 500 })
    }

    // votes 카운트 증가
    const { data, error } = await supabase.rpc('increment_votes', { excuse_id: id })

    if (error) {
      // RPC 없을 경우 fallback
      const { data: current } = await supabase
        .from('excuses')
        .select('votes')
        .eq('id', id)
        .single()

      if (current) {
        await supabase
          .from('excuses')
          .update({ votes: current.votes + 1 })
          .eq('id', id)
      }
    }

    // 업데이트된 votes 반환
    const { data: updated } = await supabase
      .from('excuses')
      .select('votes')
      .eq('id', id)
      .single()

    return Response.json({ votes: updated?.votes ?? 0 })
  } catch (err) {
    console.error('vote error:', err)
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
