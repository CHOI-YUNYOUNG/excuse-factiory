'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Excuse, Category } from '../types'
import { CATEGORIES } from '../types'
import { RankingCard } from '../components/RankingCard'

const ALL_CATEGORIES = [{ value: '전체' as const, label: '전체', emoji: '🔥' }, ...CATEGORIES]

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('sessionId')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('sessionId', id)
  }
  return id
}

export default function RankingPage() {
  const [excuses, setExcuses] = useState<Excuse[]>([])
  const [category, setCategory] = useState<Category | '전체'>('전체')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    setSessionId(getSessionId())
    const stored = localStorage.getItem('votedExcuses')
    if (stored) setVotedIds(new Set(JSON.parse(stored)))
  }, [])

  const fetchExcuses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '30' })
      if (category !== '전체') params.set('category', category)
      const res = await fetch(`/api/excuses?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setExcuses(data.excuses ?? [])
    } catch {
      setError('데이터를 불러오지 못했습니다. Supabase 설정을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchExcuses()
  }, [fetchExcuses])

  function handleVote(id: string) {
    const next = new Set(votedIds)
    next.add(id)
    setVotedIds(next)
    localStorage.setItem('votedExcuses', JSON.stringify([...next]))
    // votes 카운트 올리고 즉시 재정렬
    setExcuses((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, votes: e.votes + 1 } : e))
      return [...updated].sort((a, b) => b.votes - a.votes || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-zinc-900">🏆 명예의 전당</h1>
        <p className="text-zinc-500 text-sm">역대 최고의 변명들을 만나보세요</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ALL_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value as Category | '전체')}
            className={`shrink-0 py-1.5 px-3 rounded-full text-sm font-medium transition-colors
              ${category === c.value
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 text-zinc-400">불러오는 중...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && excuses.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-3xl">🏜️</p>
          <p className="text-zinc-500 text-sm">아직 게시된 변명이 없어요.</p>
          <p className="text-zinc-400 text-xs">첫 번째로 명예의 전당에 올려보세요!</p>
        </div>
      )}

      <div className="space-y-3">
        {excuses.map((excuse, i) => (
          <RankingCard
            key={excuse.id}
            excuse={excuse}
            rank={i + 1}
            sessionId={sessionId}
            votedIds={votedIds}
            onVote={handleVote}
          />
        ))}
      </div>
    </div>
  )
}
