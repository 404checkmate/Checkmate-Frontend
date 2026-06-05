import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { STYLE_META } from '@/data/travelStyleMeta'

const TRAIT_LABELS = ['계획성', '휴식', '감성', '액티비티', '음식', '문화']

/* ─── 서브 컴포넌트 ─────────────────────────────────────────────────── */

function TraitBar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right text-xs font-semibold text-gray-500 lg:w-20 lg:text-sm">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-[#3db4dd] transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-xs font-bold text-teal-600 lg:text-sm">{value}%</span>
    </div>
  )
}

function CompatibilityCard({ meta, badge }) {
  return (
    <div className={`overflow-hidden rounded-2xl border ${meta.bgLight} ${meta.border}`}>
      <div className={`flex items-center justify-center bg-gradient-to-r ${meta.color} py-2`}>
        <span className="text-[11px] font-extrabold text-white tracking-wide">{badge}</span>
      </div>
      <div className="px-4 py-3">
        <p className={`text-sm font-extrabold ${meta.text}`}>{meta.label}</p>
        <p className={`text-xs ${meta.text} opacity-70`}>{meta.name}</p>
        <p className="mt-2 text-[10px] leading-snug text-gray-500">{meta.tagline}</p>
      </div>
    </div>
  )
}

function ResultCard({ meta }) {
  return (
    <section className="mb-6">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${meta.color} px-6 py-8 shadow-lg text-white`}>
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-4 left-1/3 h-20 w-20 rounded-full bg-white/10 blur-xl" aria-hidden />
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="mb-1 text-sm font-bold opacity-80">당신은</p>
          <div className="mb-1 text-6xl lg:text-7xl">{meta.emoji}</div>
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{meta.label.toUpperCase()}</h1>
          <p className="mt-1 text-lg font-bold opacity-90 lg:text-xl">{meta.name}</p>
          <p className="mt-2 text-sm opacity-75 lg:text-base">"{meta.tagline}"</p>
        </div>
      </div>
      <div className="mt-3 flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className={`w-1 shrink-0 bg-gradient-to-b ${meta.color}`} />
        <div className="px-5 py-4">
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${meta.text}`}>이런 여행자예요</span>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 lg:text-base">{meta.desc}</p>
        </div>
      </div>
    </section>
  )
}

function TraitAnalysisSection({ meta }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-extrabold text-[#04384a] lg:text-lg">성향 분석</h2>
      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-sm flex flex-col gap-3">
        {TRAIT_LABELS.map((label) => (
          <TraitBar key={label} label={label} value={meta.traits[label] ?? 0} />
        ))}
      </div>
    </section>
  )
}

function CompatibilitySection({ bestMeta, worstMeta }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-extrabold text-[#04384a] lg:text-lg">여행 궁합</h2>
      <div className="grid grid-cols-2 gap-3">
        <CompatibilityCard meta={bestMeta} badge="🍀 찰떡궁합" />
        <CompatibilityCard meta={worstMeta} badge="💦 조심조심" />
      </div>
    </section>
  )
}

function DestinationsSection({ meta, onChecklist }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-extrabold text-[#04384a] lg:text-lg">추천 여행지</h2>
      <div className="flex flex-col gap-3">
        {meta.destinations.map((dest) => (
          <div
            key={dest.city}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-extrabold text-[#04384a] lg:text-base">{dest.city}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {dest.tags.map((tag) => (
                  <span key={tag} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChecklist(dest)}
              className="ml-3 shrink-0 rounded-xl bg-amber-400 px-3 py-2 text-[11px] font-bold text-amber-900 shadow-sm transition-all hover:bg-amber-500 active:scale-95 lg:px-4 lg:text-xs"
            >
              체크리스트 만들기
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── 메인 페이지 ────────────────────────────────────────────────────── */

export default function TravelStyleResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const result = location.state?.result

  useEffect(() => {
    if (!result) navigate('/travel-style-test', { replace: true })
  }, [result, navigate])

  if (!result) return null

  const meta      = STYLE_META[result.topType]
  const bestMeta  = STYLE_META[meta.bestMatch]
  const worstMeta = STYLE_META[meta.worstMatch]

  const handleChecklist = (dest) => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
    if (isDesktop) {
      navigate('/', { state: { prefilledDestination: dest } })
    } else {
      navigate('/trips/new/destination', {
        state: { prefilledDestination: dest, prefilledTravelStyle: meta.key },
      })
    }
  }

  return (
    <div
      className="min-h-screen flex-1"
      style={{
        backgroundImage: `
          radial-gradient(circle at 8% 8%, rgba(61, 180, 221, 0.15) 0%, transparent 35%),
          radial-gradient(circle at 90% 10%, rgba(251, 191, 36, 0.18) 0%, transparent 32%),
          linear-gradient(160deg, #f0fdfa 0%, #fffbeb 55%, #f0fdfa 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-lg px-4 pb-14 pt-8 lg:max-w-2xl lg:px-6 lg:pt-12">

        <ResultCard meta={meta} />
        <TraitAnalysisSection meta={meta} />
        <CompatibilitySection bestMeta={bestMeta} worstMeta={worstMeta} />
        <DestinationsSection meta={meta} onChecklist={handleChecklist} />

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/travel-style-test')}
            className="text-sm font-semibold text-gray-400 underline underline-offset-2 hover:text-gray-600"
          >
            다시 테스트하기
          </button>
        </div>

      </div>
    </div>
  )
}
