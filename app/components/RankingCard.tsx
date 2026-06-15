'use client'

import { useState } from 'react'
import type { Excuse, ListenerType } from '../types'
import { BeliefBar } from './BeliefBar'
import { LISTENER_LABELS } from '../types'

interface RankingCardProps {
  excuse: Excuse
  rank: number
  sessionId: string
  votedIds: Set<string>
  onVote: (id: string) => void
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function RankingCard({ excuse, rank, sessionId, votedIds, onVote }: RankingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [voting, setVoting] = useState(false)
  const hasVoted = votedIds.has(excuse.id)

  async function handleVote() {
    if (hasVoted || voting) return
    setVoting(true)
    try {
      const res = await fetch(`/api/excuses/${excuse.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      if (res.ok) {
        onVote(excuse.id)
      }
    } finally {
      setVoting(false)
    }
  }

  const medal = RANK_MEDALS[rank]
  const listenerLabel = excuse.listener_type
    ? LISTENER_LABELS[excuse.listener_type as ListenerType]
    : null

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{medal ?? `#${rank}`}</span>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
            {excuse.category}
          </span>
          <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
            {excuse.tone}
          </span>
          {listenerLabel && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {listenerLabel}
            </span>
          )}
        </div>
        <button
          onClick={handleVote}
          disabled={hasVoted || voting}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0
            ${hasVoted
              ? 'bg-red-50 text-red-500 cursor-default'
              : 'bg-zinc-50 hover:bg-red-50 hover:text-red-500 text-zinc-500'
            }`}
        >
          <span>{hasVoted ? '❤️' : '🤍'}</span>
          <span>{excuse.votes}</span>
        </button>
      </div>

      <p className="text-zinc-800 leading-relaxed">{excuse.content}</p>

      {excuse.predicted_reaction && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {expanded ? '▲ 상대방 반응 숨기기' : '▼ 상대방 반응 보기'}
          </button>
          {expanded && (
            <div className="mt-2 bg-zinc-50 rounded-xl p-3 text-sm text-zinc-600 italic">
              "{excuse.predicted_reaction}"
            </div>
          )}
        </div>
      )}

      {excuse.believability_score != null && (
        <BeliefBar score={excuse.believability_score} />
      )}
    </div>
  )
}
