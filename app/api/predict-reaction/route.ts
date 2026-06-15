import { NextRequest } from 'next/server'
import type { ListenerType } from '../../types'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`

const LISTENER_DESCS: Record<ListenerType, string> = {
  까칠한_상사:
    '매우 까다롭고 엄격한 상사. 핑계를 절대 좋아하지 않으며 논리적 허점을 바로 잡아냄. 무뚝뚝하고 짧게 말함. 존댓말 사용하되 차갑게.',
  츤데레_친구:
    '겉으로는 냉정하고 퉁명스럽지만 속은 이해해주는 친구. 처음엔 핀잔을 주지만 결국 넘어감. 반말, 약간의 투덜거림.',
  빡친_애인:
    '화가 많이 난 애인. 감정적이고 변명을 들으려 하지 않음. 서운함과 분노가 뒤섞임. 반말, 감정적인 어미 사용.',
  이해심_많은_동료:
    '공감 능력이 높고 항상 편을 들어주는 동료. 변명을 들으면 바로 이해하고 걱정해줌. 따뜻하고 친근한 말투.',
  의심_많은_교수:
    '논리적으로 의심이 많은 교수. 변명의 허점을 날카롭게 지적하며 추가 설명을 요구함. 격식체 사용, 학문적 어투.',
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

    const prompt = `당신은 역할극 시뮬레이터입니다. 아래 변명을 듣고 해당 캐릭터의 반응을 시뮬레이션하세요.

## 원래 상황
${situation}

## 들은 변명
"${excuse}"

## 반응할 캐릭터: ${listenerType.replace(/_/g, ' ')}
${LISTENER_DESCS[listenerType]}

## 반응 작성 규칙
1. 이 캐릭터의 말투와 어투를 정확히 반영
2. 2~3문장, 실제 대화체로 작성
3. 캐릭터의 감정이 명확히 드러나야 함
4. believability(1~10)는 이 캐릭터가 변명을 얼마나 믿을 것 같은지 (1=절대 안 믿음, 10=완전히 믿음)

## 응답 형식 (JSON 코드블록 없이 순수 JSON만)
{"reaction":"캐릭터의 실제 반응 대사","believability":7}`

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 1000 },
    })

    let res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    // 429 시 최대 2회 자동 재시도 (8초 간격)
    for (let retry = 0; retry < 2 && res.status === 429; retry++) {
      await new Promise((r) => setTimeout(r, 8000))
      res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
    }

    if (res.status === 429) {
      return Response.json({ error: '현재 AI 서버가 혼잡해요. 잠시 후 다시 시도해주세요.' }, { status: 429 })
    }

    if (!res.ok) {
      const errBody = await res.text()
      console.error('Gemini API error:', res.status, errBody)
      return Response.json({ error: `AI 서비스 오류 (${res.status})` }, { status: 500 })
    }

    const data = await res.json()
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: '응답 파싱에 실패했습니다.' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json(parsed)
  } catch (err) {
    console.error('predict-reaction error:', err)
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
