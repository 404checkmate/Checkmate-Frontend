import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import {
  STEP5_CONFIG,
  STEP5_ICON_PATHS,
  STEP5_ICON_COMPOSITE,
  STEP5_PAGE_TITLE,
  STEP5_PAGE_SUBTITLE,
  COMPANIONS,
  TRAVEL_STYLES,
} from '@/mocks/tripNewStep5Data'
import StepHeader from '@/components/common/StepHeader'
import { TripNewFlowDesktopPrevBar } from '@/components/trip/TripNewFlowPrevControls'
import { TripFlowNextStepButton } from '@/components/trip/TripFlowNextStepButton'
import { loadActiveTripPlan, saveActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { listCompanionTypes, listTravelStyles } from '@/api/master'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { saveActiveTripId, clearActiveTripId } from '@/utils/activeTripIdStorage'
import { createTrip } from '@/api/trips'
import { trackEvent } from '@/utils/analyticsTracker'
import { resolveAccessToken } from '@/api/client'

function SvgIcon({ name, className = 'w-6 h-6' }) {
  const composite = STEP5_ICON_COMPOSITE[name]
  if (composite) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        {composite.circles.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
        <path d={composite.path} />
      </svg>
    )
  }
  const d = STEP5_ICON_PATHS[name]
  if (!d) return null
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d={d} />
    </svg>
  )
}

const TRAVEL_STYLE_ICON_FILTER_IDLE =
  'brightness(0) saturate(100%) invert(44%) sepia(82%) saturate(520%) hue-rotate(139deg) brightness(0.93) contrast(0.95)'
const TRAVEL_STYLE_ICON_FILTER_SELECTED =
  'brightness(0) saturate(100%) invert(22%) sepia(28%) saturate(1300%) hue-rotate(5deg) brightness(0.91) contrast(1.05)'

function TravelStyleIcon({ src, selected, className }) {
  return (
    <img
      src={src}
      alt=""
      className={`shrink-0 object-contain transition-[filter] duration-200 ease-out ${className ?? ''}`}
      style={{ filter: selected ? TRAVEL_STYLE_ICON_FILTER_SELECTED : TRAVEL_STYLE_ICON_FILTER_IDLE }}
      aria-hidden
    />
  )
}

function SectionLabel({ num, label }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-8 h-8 rounded-full bg-teal-700 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">
        {num}
      </span>
      <span className="font-extrabold text-gray-900 text-base tracking-tight">{label}</span>
      <div className="flex-1 h-px bg-gray-200/90 min-w-0" />
    </div>
  )
}

function TripNewStep5PageContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const restored = location.state?.step5Restored ?? null

  const [companionIds, setCompanionIds] = useState([])
  const [styleIds, setStyleIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [companions, setCompanions] = useState([])
  const [travelStyles, setTravelStyles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const autoSubmitFiredRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    Promise.all([listCompanionTypes(), listTravelStyles()])
      .then(([apiCompanions, apiStyles]) => {
        if (cancelled) return
        setCompanions(
          apiCompanions.map((c) => {
            const mock = COMPANIONS.find((m) => m.id === c.code)
            return { id: c.code, label: c.labelKo, description: mock?.description ?? '', icon: mock?.icon ?? 'person' }
          })
        )
        setTravelStyles(
          apiStyles.map((s) => {
            const mock = TRAVEL_STYLES.find((m) => m.id === s.code)
            return { id: s.code, label: s.labelKo, iconSrc: mock?.iconSrc }
          })
        )
      })
      .catch(() => {
        if (cancelled) return
        setCompanions(COMPANIONS)
        setTravelStyles(TRAVEL_STYLES)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const toggleCompanion = useCallback((id) => {
    setCompanionIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }, [])

  const toggleStyle = useCallback((id) => {
    setStyleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const canSubmit = useMemo(
    () => companionIds.length >= 1 && styleIds.length > 0 && !submitting && !isLoading,
    [companionIds, styleIds, submitting, isLoading],
  )

  useEffect(() => {
    trackEvent('step_complete', { step: 'companion_style_view' })
  }, [])

  useEffect(() => {
    if (!restored) return
    if (restored.companionIds?.length > 0) setCompanionIds(restored.companionIds)
    else if (restored.companionId) setCompanionIds([restored.companionId])
    if (restored.styleIds?.length > 0) setStyleIds(restored.styleIds)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!restored || autoSubmitFiredRef.current) return
    if (!canSubmit) return
    autoSubmitFiredRef.current = true
    const t = setTimeout(() => handleCreatePlan(), 300)
    return () => clearTimeout(t)
  }, [canSubmit]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreatePlan = async () => {
    if (!canSubmit) return
    trackEvent('cta_click', { button: 'create_plan', step: 'step5' })
    setSubmitError('')

    const existingPlan = loadActiveTripPlan()
    const companionLabels = companions.filter((c) => companionIds.includes(c.id)).map((c) => c.label)
    const companionLabel = companionLabels.join(', ') || null
    const travelStyleLabels = travelStyles.filter((s) => styleIds.includes(s.id)).map((s) => s.label)
    const hasPet = companionIds.some((id) => id === 'pets' || id === 'withPet')
    const nextPlan = existingPlan?.destination
      ? { ...existingPlan, companion: companionLabel, hasPet, travelStyles: travelStyleLabels }
      : existingPlan
    if (nextPlan) saveActiveTripPlan(nextPlan)

    const step5State = { companionIds, travelStyleIds: styleIds }

    const token = await resolveAccessToken()
    if (!token) {
      navigate('/trips/guest/loading', { state: { ...(location.state ?? {}), step5: step5State } })
      return
    }

    const payload = buildCreateTripPayload(nextPlan ?? existingPlan, { companionIds, hasPet, travelStyleIds: styleIds })

    let createdTripId = null
    if (payload) {
      setSubmitting(true)
      try {
        const created = await createTrip(payload)
        const rawId = created?.id ?? created?.tripId
        createdTripId = rawId != null ? String(rawId) : null
        if (createdTripId) {
          saveActiveTripId(createdTripId)
          trackEvent('trip_creation_completed', { trip_id: createdTripId })
        }
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || '여행 계획을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'
        console.warn('[TripNewStep5Page] createTrip 실패:', message)
        setSubmitError('여행 계획 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        clearActiveTripId()
        return
      } finally {
        setSubmitting(false)
      }
    } else {
      clearActiveTripId()
      setSubmitError('여행 정보를 모두 입력한 뒤 다시 시도해 주세요.')
      return
    }

    if (!createdTripId) {
      navigate('/guide-archives', { replace: true })
      return
    }
    navigate(`/trips/${createdTripId}/loading`, {
      state: { ...(location.state ?? {}), step5: step5State, createdTripId },
    })
  }

  const companionCardClass = (id) => {
    const on = companionIds.includes(id)
    return [
      'rounded-2xl border-2 p-4 text-left transition-all duration-200 flex flex-col gap-2 min-h-[120px]',
      on
        ? 'border-amber-400 bg-amber-200/95 shadow-md ring-2 ring-amber-300/80 text-gray-900'
        : 'border-transparent bg-cyan-50/90 hover:bg-cyan-100/80 text-gray-800 shadow-sm',
    ].join(' ')
  }

  const styleCardClass = (id) => {
    const on = styleIds.includes(id)
    const base = ['w-full h-full min-h-[92px] rounded-2xl border-2 p-3.5 sm:p-4 md:p-2.5 lg:p-5 flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-200 md:min-h-0']
    if (on) {
      base.push('border-amber-400 bg-amber-200/95 shadow-md ring-1 ring-amber-300/70 text-gray-900')
    } else {
      base.push('border-gray-100 bg-white/95 hover:bg-cyan-50/80 text-gray-800 shadow-sm')
    }
    return base.join(' ')
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #E0F7FA 0%, #F0FDFA 45%, #F8FAFC 100%)' }}>
      <div className="flex flex-col min-h-screen">
        <div className="shrink-0 mx-auto w-full max-w-7xl px-3 pt-8 md:px-6 md:pt-8 lg:px-8 lg:pt-10">
          <TripNewFlowDesktopPrevBar
            align="start"
            to="/trips/new/step4"
            label="이전으로"
            ariaLabel="방문 지역 단계로 돌아가기"
          />
        </div>
        <div className="mx-auto w-full max-w-7xl px-3 pb-4 pt-2 md:px-6 lg:px-8">
          <StepHeader
            currentStep={STEP5_CONFIG.currentStep}
            totalSteps={STEP5_CONFIG.totalSteps}
            title={STEP5_PAGE_TITLE}
            subtitle={STEP5_PAGE_SUBTITLE}
            className="mb-2"
            subtitleClassName="text-sm"
          />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-3 pb-10 md:px-6 lg:px-8">
          <div className="flex items-stretch gap-8 md:h-[520px] lg:h-auto lg:flex-1 lg:min-h-0">
            {/* 좌측: 동행인 선택 */}
            <div className="flex flex-1 min-w-0 flex-col overflow-hidden rounded-3xl bg-slate-50/80 border border-slate-200/60 px-10 py-8 shadow-sm">
              <SectionLabel num={1} label="동행인 선택" />
              <p className="text-sm text-gray-500 mb-5">누구와 함께 여행하시나요? (최대 2개 선택 가능)</p>
              <div className="flex-1 min-h-0">
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid h-full grid-cols-2 gap-3 auto-rows-fr">
                    {companions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCompanion(c.id)}
                        className={companionCardClass(c.id)}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${companionIds.includes(c.id) ? 'bg-white/70 text-teal-800' : 'bg-white/80 text-teal-700'}`}>
                          <SvgIcon name={c.icon} className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-base leading-tight">{c.label}</span>
                        <span className="text-xs text-gray-600 leading-snug">{c.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 우측: 여행 스타일 */}
            <div className="flex flex-1 min-w-0 flex-col overflow-hidden rounded-3xl bg-slate-50/80 border border-slate-200/60 px-10 py-8 shadow-sm">
              <SectionLabel num={2} label="여행 스타일" />
              <p className="text-sm text-gray-500 mb-5">어떤 여행을 계획하고 있나요? (복수 선택 가능)</p>
              {isLoading ? (
                <div className="grid flex-1 w-full grid-cols-3 gap-3 md:gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid flex-1 w-full grid-cols-3 auto-rows-fr gap-3 md:gap-4">
                  {travelStyles.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStyle(s.id)}
                      className={styleCardClass(s.id)}
                    >
                      <TravelStyleIcon src={s.iconSrc} selected={styleIds.includes(s.id)} className="h-9 w-9 lg:h-11 lg:w-11" />
                      <span className="text-xs font-bold leading-tight sm:text-sm">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-6">
            {submitError ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950">
                {submitError}
              </p>
            ) : null}
            <div className="flex justify-end">
              <TripFlowNextStepButton variant="amber" fullWidth={false} disabled={!canSubmit} onClick={handleCreatePlan}>
                {submitting ? '여행 계획 저장 중…' : '여행 계획 생성하기'}
              </TripFlowNextStepButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TripNewStep5Page() {
  const location = useLocation()

  if (window.innerWidth < 768) {
    return <Navigate to="/trips/new/destination" replace />
  }

  if (!location.state?.step4) {
    return <Navigate to="/trips/new/destination" replace />
  }
  return <TripNewStep5PageContent />
}
