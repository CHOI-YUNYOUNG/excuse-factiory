export type Category = '지각' | '마감연기' | '회식불참' | '약속취소' | '과제제출' | '기타'
export type Tone = '정중함' | '유머러스' | '진지함' | '창의적'
export type ListenerType = '까칠한_상사' | '츤데레_친구' | '빡친_애인' | '이해심_많은_동료' | '의심_많은_교수'

export interface Excuse {
  id: string
  situation: string
  category: Category
  tone: Tone
  content: string
  listener_type?: ListenerType
  predicted_reaction?: string
  believability_score?: number
  votes: number
  created_at: string
  is_public: boolean
}

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: '지각', label: '지각', emoji: '⏰' },
  { value: '마감연기', label: '마감 연기', emoji: '📅' },
  { value: '회식불참', label: '회식 불참', emoji: '🍺' },
  { value: '약속취소', label: '약속 취소', emoji: '📵' },
  { value: '과제제출', label: '과제 지연', emoji: '📚' },
  { value: '기타', label: '기타', emoji: '🤷' },
]

export const TONES: { value: Tone; label: string; emoji: string; desc: string }[] = [
  { value: '정중함', label: '정중함', emoji: '🙏', desc: '공손하고 예의 바르게' },
  { value: '유머러스', label: '유머러스', emoji: '😂', desc: '재미있고 웃기게' },
  { value: '진지함', label: '진지함', emoji: '😤', desc: '심각하고 진지하게' },
  { value: '창의적', label: '창의적', emoji: '✨', desc: '기발하고 독창적으로' },
]

export const LISTENER_TYPES: { value: ListenerType; label: string; emoji: string }[] = [
  { value: '까칠한_상사', label: '까칠한 상사', emoji: '😤' },
  { value: '츤데레_친구', label: '츤데레 친구', emoji: '😒' },
  { value: '빡친_애인', label: '빡친 애인', emoji: '😡' },
  { value: '이해심_많은_동료', label: '이해심 많은 동료', emoji: '🤗' },
  { value: '의심_많은_교수', label: '의심 많은 교수', emoji: '🧐' },
]

export const LISTENER_LABELS: Record<ListenerType, string> = {
  '까칠한_상사': '까칠한 상사',
  '츤데레_친구': '츤데레 친구',
  '빡친_애인': '빡친 애인',
  '이해심_많은_동료': '이해심 많은 동료',
  '의심_많은_교수': '의심 많은 교수',
}
