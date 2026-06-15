import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import type { Category, Tone } from '../../types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TONE_DESCS: Record<Tone, string> = {
  정중함: '정중하고 공손하게, 존댓말',
  유머러스: '웃기고 과장되게',
  진지함: '심각하고 감정적으로',
  창의적: '기발하고 독창적으로',
}

const CATEGORY_LABELS: Record<Category, string> = {
  지각: '지각',
  마감연기: '마감 연기',
  회식불참: '회식 불참',
  약속취소: '약속 취소',
  과제제출: '과제 지연',
  기타: '기타',
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

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1400,
      messages: [
        {
          role: 'user',
          content: `변명 전문가. 상황에 맞는 변명 4개를 JSON으로만 응답.

상황: ${situation}
카테고리: ${CATEGORY_LABELS[category]}
톤: ${tone} — ${TONE_DESCS[tone]}

규칙:
- 각 변명은 반드시 5문장 이상
- 구체적인 인물·장소·사건을 포함해 현실감 있게
- 서로 완전히 다른 접근법 (다른 원인, 다른 등장인물)
- 한국어, 지정된 톤 철저히 유지

{"excuses":["변명1(5문장 이상)","변명2(5문장 이상)","변명3(5문장 이상)","변명4(5문장 이상)"]}`,
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
    console.error('generate-excuse error:', err)
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
