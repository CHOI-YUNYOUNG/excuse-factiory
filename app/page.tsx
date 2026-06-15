'use client'

import { useState } from 'react'
import { CATEGORIES, TONES, LISTENER_TYPES, type Category, type Tone, type ListenerType } from './types'
import { BeliefBar } from './components/BeliefBar'

type Step = 'input' | 'excuses' | 'listener' | 'result'

interface ReactionResult {
  reaction: string
  believability: number
}

export default function Home() {
  const [situation, setSituation] = useState('')
  const [category, setCategory] = useState<Category>('지각')
  const [tone, setTone] = useState<Tone>('유머러스')

  const [excuses, setExcuses] = useState<string[]>([])
  const [selectedExcuse, setSelectedExcuse] = useState('')
  const [listenerType, setListenerType] = useState<ListenerType>('까칠한_상사')
  const [result, setResult] = useState<ReactionResult | null>(null)

  const [step, setStep] = useState<Step>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function generateExcuses() {
    if (!situation.trim()) {
      setError('상황을 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate-excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, category, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setExcuses(data.excuses)
      setStep('excuses')
    } catch (e) {
      setError(e instanceof Error ? e.message : '변명 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function predictReaction() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/predict-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excuse: selectedExcuse, listenerType, situation }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setStep('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : '반응 예측에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function saveExcuse(isPublic: boolean) {
    if (!result) return
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/excuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation,
          category,
          tone,
          content: selectedExcuse,
          listener_type: listenerType,
          predicted_reaction: result.reaction,
          believability_score: result.believability,
          is_public: isPublic,
        }),
      })
      if (!res.ok) throw new Error()

      if (!isPublic) {
        const data = await res.json()
        const saved = JSON.parse(localStorage.getItem('myExcuses') ?? '[]')
        saved.unshift(data.excuse)
        localStorage.setItem('myExcuses', JSON.stringify(saved.slice(0, 50)))
      }
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  function reset() {
    setStep('input')
    setSituation('')
    setCategory('지각')
    setTone('유머러스')
    setExcuses([])
    setSelectedExcuse('')
    setListenerType('까칠한_상사')
    setResult(null)
    setError('')
    setSaveStatus('idle')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {step === 'input' && (
        <div className="text-center space-y-1 pb-2">
          <h1 className="text-2xl font-bold text-zinc-900">오늘도 변명이 필요하신가요? 🏭</h1>
          <p className="text-zinc-500 text-sm">AI가 상황에 딱 맞는 그럴듯한 변명을 만들어 드립니다</p>
        </div>
      )}

      {/* STEP 1: 입력 폼 */}
      {step === 'input' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">어떤 상황인가요?</label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="예: 오늘 회의에 30분 늦었어요. 팀장님이 엄청 화가 나있어요..."
              className="w-full h-24 px-3 py-2 text-sm border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-zinc-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">카테고리</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`py-2 px-2 rounded-xl text-sm font-medium transition-colors
                    ${category === c.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">톤</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-colors text-left
                    ${tone === t.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                >
                  <span className="block">{t.emoji} {t.label}</span>
                  <span className={`text-xs ${tone === t.value ? 'text-orange-100' : 'text-zinc-400'}`}>
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={generateExcuses}
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? '변명 생성 중...' : '변명 생성하기 →'}
          </button>
        </div>
      )}

      {/* STEP 2: 변명 목록 */}
      {step === 'excuses' && (
        <div className="space-y-4">
          <div className="text-center space-y-0.5">
            <h2 className="font-semibold text-zinc-900">마음에 드는 변명을 선택하세요</h2>
            <p className="text-xs text-zinc-400">{category} · {tone}</p>
          </div>

          <div className="space-y-3">
            {excuses.map((excuse, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
                <p className="text-zinc-800 text-sm leading-relaxed">{excuse}</p>
                <button
                  onClick={() => {
                    setSelectedExcuse(excuse)
                    setStep('listener')
                  }}
                  className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium text-sm rounded-xl transition-colors"
                >
                  이 변명 사용하기 →
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('input')}
            className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            ← 다시 입력하기
          </button>
        </div>
      )}

      {/* STEP 3: 듣는 사람 선택 */}
      {step === 'listener' && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs text-zinc-400">선택한 변명</p>
            <p className="text-sm text-zinc-700 leading-relaxed">"{selectedExcuse}"</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-medium text-zinc-700">누가 이 변명을 듣게 되나요?</label>
            <div className="space-y-2">
              {LISTENER_TYPES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setListenerType(l.value)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors text-left
                    ${listenerType === l.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                >
                  {l.emoji} {l.label}
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={predictReaction}
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? '반응 예측 중...' : '반응 예측하기 →'}
            </button>
          </div>

          <button
            onClick={() => setStep('excuses')}
            className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            ← 변명 다시 선택하기
          </button>
        </div>
      )}

      {/* STEP 4: 결과 */}
      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="font-semibold text-zinc-900">🎭 반응 예측 결과</h2>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs text-zinc-400">내 변명</p>
            <p className="text-sm text-zinc-700 leading-relaxed">"{selectedExcuse}"</p>
          </div>

          <p className="text-center text-zinc-300 text-xl">↓</p>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs text-zinc-400">
              {LISTENER_TYPES.find((l) => l.value === listenerType)?.emoji}{' '}
              {LISTENER_TYPES.find((l) => l.value === listenerType)?.label}의 반응
            </p>
            <p className="text-sm text-zinc-800 leading-relaxed italic">"{result.reaction}"</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <BeliefBar score={result.believability} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => saveExcuse(true)}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className="py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {saveStatus === 'saved' ? '✅ 완료!' : saveStatus === 'saving' ? '게시 중...' : '🏆 명예의 전당'}
            </button>
            <button
              onClick={() => saveExcuse(false)}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className="py-3 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-xl transition-colors"
            >
              {saveStatus === 'saved' ? '✅ 완료!' : saveStatus === 'saving' ? '저장 중...' : '💾 내 보관함'}
            </button>
          </div>

          {saveStatus === 'error' && (
            <p className="text-xs text-red-500 text-center">
              저장 실패. Supabase 설정을 확인해주세요.
            </p>
          )}

          <button
            onClick={reset}
            className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            🔄 처음부터 다시
          </button>
        </div>
      )}
    </div>
  )
}
