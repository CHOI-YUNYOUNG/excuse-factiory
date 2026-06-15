'use client'

import { useEffect, useState } from 'react'
import type { Excuse, ListenerType } from '../types'
import { LISTENER_LABELS } from '../types'
import { BeliefBar } from '../components/BeliefBar'

export default function CollectionPage() {
  const [excuses, setExcuses] = useState<Excuse[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('myExcuses')
    if (stored) setExcuses(JSON.parse(stored))
  }, [])

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function deleteExcuse(id: string) {
    const next = excuses.filter((e) => e.id !== id)
    setExcuses(next)
    localStorage.setItem('myExcuses', JSON.stringify(next))
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-zinc-900">💾 내 보관함</h1>
        <p className="text-zinc-500 text-sm">내가 만든 변명들을 모아봤어요</p>
      </div>

      {excuses.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-3xl">📭</p>
          <p className="text-zinc-500 text-sm">저장된 변명이 없어요.</p>
          <p className="text-zinc-400 text-xs">변명을 생성하고 보관함에 저장해보세요!</p>
        </div>
      )}

      <div className="space-y-3">
        {excuses.map((excuse) => {
          const isOpen = expanded.has(excuse.id)
          const listenerLabel = excuse.listener_type
            ? LISTENER_LABELS[excuse.listener_type as ListenerType]
            : null

          return (
            <div key={excuse.id} className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
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
                  onClick={() => deleteExcuse(excuse.id)}
                  className="text-zinc-300 hover:text-red-400 text-sm transition-colors shrink-0"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </div>

              <p className="text-zinc-800 text-sm leading-relaxed">{excuse.content}</p>

              {excuse.predicted_reaction && (
                <div>
                  <button
                    onClick={() => toggleExpand(excuse.id)}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {isOpen ? '▲ 반응 숨기기' : '▼ 상대방 반응 보기'}
                  </button>
                  {isOpen && (
                    <div className="mt-2 bg-zinc-50 rounded-xl p-3 text-sm text-zinc-600 italic">
                      "{excuse.predicted_reaction}"
                    </div>
                  )}
                </div>
              )}

              {excuse.believability_score != null && (
                <BeliefBar score={excuse.believability_score} />
              )}

              <p className="text-xs text-zinc-300">
                {new Date(excuse.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
