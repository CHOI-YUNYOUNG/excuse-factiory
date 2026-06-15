'use client'

interface BeliefBarProps {
  score: number
}

const SCORE_LABELS: Record<number, string> = {
  1: '😱 절대 안 믿음',
  2: '🤨 매우 의심',
  3: '😒 회의적',
  4: '🤔 좀 의심',
  5: '😐 반반',
  6: '🙂 약간 믿음',
  7: '😊 꽤 그럴듯',
  8: '😄 많이 믿음',
  9: '🤩 거의 완벽',
  10: '🏆 완전 설득',
}

function getColor(score: number) {
  if (score <= 3) return 'bg-red-500'
  if (score <= 5) return 'bg-orange-400'
  if (score <= 7) return 'bg-yellow-400'
  return 'bg-green-500'
}

export function BeliefBar({ score }: BeliefBarProps) {
  const pct = (score / 10) * 100
  const label = SCORE_LABELS[score] ?? `${score}/10`

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-500">믿어줄 확률</span>
        <span className="font-semibold text-zinc-800">{label}</span>
      </div>
      <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getColor(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-zinc-400">{score} / 10</p>
    </div>
  )
}
