import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import type { ListenerType } from '../../types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LISTENER_DESCS: Record<ListenerType, string> = {
  까칠한_상사: '엄격한 상사. 핑계를 싫어하고 논리적 허점을 즉시 지적. 무뚝뚝하고 짧게, 존댓말.',
  츤데레_친구: '겉으론 퉁명스럽지만 속은 이해해주는 친구. 처음엔 핀잔, 결국 넘어감. 반말.',
  빡친_애인: '화가 많이 난 애인. 감정적이고 변명을 안 들으려 함. 서운함+분노, 반말.',
  이해심_많은_동료: '공감 능력이 높고 항상 편을 들어주는 동료. 따뜻하고 친근한 말투.',
  의심_많은_교수: '논리적으로 의심 많은 교수. 허점 지적하고 추가 설명 요구. 격식체.',
}

export async function POST(request: NextRequest) {
  try {
    const { excuse, listenerType, situation } = await request.json() as {
      excuse: string
      listenerType: ListenerType
      situation: string
    }

    if (!excuse || !listenerType) {
      return Response.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `역할극. 아래 캐릭터로 반응을 JSON으로만 응답.

상황: ${situation}
변명: "${excuse}"
캐릭터: ${LISTENER_DESCS[listenerType]}

규칙: 2~3문장 실제 대화체, 캐릭터 감정 명확히, believability는 이 캐릭터가 믿을 확률(1~10)

{"reaction":"대사","believability":7}`,
        },
      ],
    })

    const text = message.content.find((b) => b.type === 'text')?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: '응답 파싱에 실패했습니다.' }, { status: 500 })
    }

    return Response.json(JSON.parse(jsonMatch[0]))
  } catch (err) {
    console.error('predict-reaction error:', err)
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
