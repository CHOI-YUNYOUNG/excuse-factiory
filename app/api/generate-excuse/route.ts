import { NextRequest } from 'next/server'
import type { Category, Tone } from '../../types'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`

const TONE_DESCS: Record<Tone, string> = {
  정중함: '매우 정중하고 공손하게, 상대방에게 이해를 구하는 방식으로. 존댓말 사용.',
  유머러스: '재미있고 유머러스하게, 웃음으로 상황을 넘길 수 있도록. 약간 과장되고 엉뚱하게.',
  진지함: '매우 진지하고 심각하게, 마치 큰일이 있었던 것처럼. 감정 이입이 느껴지게.',
  창의적: '아무도 생각 못할 기발하고 독창적인 방식으로. 상상력을 최대한 발휘해서.',
}

const CATEGORY_LABELS: Record<Category, string> = {
  지각: '지각 (약속/출근/수업에 늦음)',
  마감연기: '마감 연기 (업무/과제 제출 기한 연장 요청)',
  회식불참: '회식 불참 (단체 식사/모임 불참)',
  약속취소: '약속 취소 (개인 약속 취소)',
  과제제출: '과제 제출 지연',
  기타: '기타 상황',
}

export async function POST(request: NextRequest) {
  try {
    const { situation, category, tone } = await request.json() as {
      situation: string
      category: Category
      tone: Tone
    }

    if (!situation || !category || !tone) {
      return Response.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 })
    }

    const prompt = `당신은 창의적인 변명 전문가입니다. 아래 상황에 딱 맞는 변명을 4개 만들어주세요.

## 상황
${situation}

## 카테고리
${CATEGORY_LABELS[category]}

## 요청 톤: ${tone}
${TONE_DESCS[tone]}

## 변명 작성 규칙
1. 각 변명은 구체적인 사건/등장인물/상황이 포함된 스토리텔링 형식 (단순히 "차가 막혔다"류 금지)
2. 2~3문장으로 간결하게
3. 4개 변명은 서로 완전히 다른 접근법 사용 (반복 금지)
4. 실제로 말할 수 있을 정도로 그럴듯해야 함
5. 한국어로 작성

## 응답 형식 (JSON 코드블록 없이 순수 JSON만)
{"excuses":["변명1","변명2","변명3","변명4"]}`

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 2000 },
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
    console.error('generate-excuse error:', err)
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
