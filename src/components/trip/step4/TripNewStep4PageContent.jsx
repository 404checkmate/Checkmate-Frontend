import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  STEP4_CONFIG,
  HERO_IMAGE,
  CITY_IMAGES,
  AI_TIP,
  isVietnamArrival,
  heroImageForSelection,
  fetchTripDatesForStep4,
} from '@/mocks/tripNewStep4Data'
import { loadStep4NavigationState } from '@/utils/tripFlowDraftStorage'
import { arrayMove, clampVisitDatesToTripWindow, visitRangeOk } from '@/utils/tripStep4Helpers'
import StepHeader from '@/components/common/StepHeader'
import { TripFlowDesktopBar, TripFlowMobileBar } from '@/components/common/TripFlowTopBar'
import AiConciergeTip from '@/components/common/AiConciergeTip'
import TripStepDesktopSplit from '@/components/trip/TripStepDesktopSplit'
import { TripFlowNextStepButton } from '@/components/trip/TripFlowNextStepButton'
import { FullBleedMintGlobeHero } from '@/components/trip/MintProgressiveHero'
import FlightSummaryCard from '@/components/trip/step4/FlightSummaryCard'
import Step4AdditionalCitySearchBar from '@/components/trip/step4/Step4AdditionalCitySearchBar'
import Step4NonVnAddRegionInput from '@/components/trip/step4/Step4NonVnAddRegionInput'
import Step4NonVnSelectedPlacesList from '@/components/trip/step4/Step4NonVnSelectedPlacesList'
import VietnamNeighborhoodPicker from '@/components/trip/step4/VietnamNeighborhoodPicker'
import NeighborhoodVisitSchedule from '@/components/trip/step4/NeighborhoodVisitSchedule'

const Step4GlobeHero = lazy(() => import('@/components/trip/Step4GlobeHero'))

/**
 * Step4 본문 — `isVietnamArrival(arrival)`이 true일 때만 베트남 동네 피커·일정 블록이 보이고,
 * 그렇지 않아도 항공 카드 아래 추가 지역 입력창은 동일하게 표시됩니다.
 */
export default function TripNewStep4PageContent({ arrival, mergedNavState }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isVn = isVietnamArrival(arrival)

  /** fetchTripDatesForStep4 결과 (목데이터 또는 추후 API) */
  const [tripWindow, setTripWindow] = useState(null)
  const [tripDatesLoading, setTripDatesLoading] = useState(true)
  const [tripDatesError, setTripDatesError] = useState(null)

  const [selectedIds, setSelectedIds] = useState([])
  /** 프리셋 동네별 방문 기간 */
  const [visitByPresetId, setVisitByPresetId] = useState({})
  const [customStops, setCustomStops] = useState([])
  /** p-{presetId} · c-{customId} — 카드 목록 순서 */
  const [visitStopOrder, setVisitStopOrder] = useState([])
  /** 베트남: 동네 피커 검색어와 동기화 */
  const [additionalCitySearchQuery, setAdditionalCitySearchQuery] = useState('')
  /** 비베트남: 입력 초안 / 확인 시 목록에만 추가 → Step5 otherStopsNote로 합쳐 전달 */
  const [nonVnDraft, setNonVnDraft] = useState('')
  const [nonVnPlaces, setNonVnPlaces] = useState([])

  const confirmNonVnPlace = useCallback((text) => {
    const t = text.trim()
    if (t.length < 1) return
    setNonVnPlaces((prev) => [
      ...prev,
      { id: `nv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, label: t },
    ])
    setNonVnDraft('')
  }, [])

  const removeNonVnPlace = useCallback((id) => {
    setNonVnPlaces((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const onReorderNonVnPlaces = useCallback((fromIndex, toIndex) => {
    setNonVnPlaces((prev) => arrayMove(prev, fromIndex, toIndex))
  }, [])

  const clearAllNonVnPlaces = useCallback(() => {
    setNonVnPlaces([])
  }, [])

  const clearAllVnStops = useCallback(() => {
    setSelectedIds([])
    setCustomStops([])
    setVisitStopOrder([])
    setVisitByPresetId({})
  }, [])

  const arrivalKey = `${arrival?.iata ?? ''}-${arrival?.city ?? ''}-${arrival?.country ?? ''}`

  /** 라우터 state와 sessionStorage draft 병합 후 목적지 페이지에서 고른 여행 기간 */
  const tripDateOverride = useMemo(() => {
    const merged = { ...loadStep4NavigationState(), ...location.state }
    if (merged.fromDestinationPage && merged.tripStartDate && merged.tripEndDate) {
      return {
        tripStart: merged.tripStartDate,
        tripEnd: merged.tripEndDate,
        source: 'destination-picker',
      }
    }
    return null
  }, [location.state?.fromDestinationPage, location.state?.tripStartDate, location.state?.tripEndDate])

  useEffect(() => {
    let cancelled = false
    setTripDatesLoading(true)
    setTripDatesError(null)
    setTripWindow(null)

    fetchTripDatesForStep4(arrival, tripDateOverride)
      .then((data) => {
        if (cancelled) return
        setTripWindow({
          tripStart: data.tripStart,
          tripEnd: data.tripEnd,
          totalDays: data.totalDays,
          source: data.source,
        })
      })
      .catch((e) => {
        if (cancelled) return
        setTripDatesError(e?.message || '여행 기간을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setTripDatesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [arrivalKey, tripDateOverride?.tripStart, tripDateOverride?.tripEnd])

  /** 선택/삭제와 visitStopOrder 동기화 (잘못 남은 키 제거) */
  useEffect(() => {
    setVisitStopOrder((prev) =>
      prev.filter((k) => {
        if (k.startsWith('p-')) return selectedIds.includes(k.slice(2))
        if (k.startsWith('c-')) return customStops.some((c) => c.id === k.slice(2))
        return false
      })
    )
  }, [selectedIds, customStops])

  /** 여행 기간(tripWindow)이 API/목에서 바뀌면, 기존 방문일이 범위를 벗어나지 않도록 보정 */
  useEffect(() => {
    if (!tripWindow?.tripStart || !tripWindow?.tripEnd) return
    const { tripStart, tripEnd } = tripWindow
    setVisitByPresetId((prev) => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        next[id] = clampVisitDatesToTripWindow(next[id], tripStart, tripEnd)
      }
      return next
    })
    setCustomStops((prev) =>
      prev.map((c) => {
        const clamped = clampVisitDatesToTripWindow(
          { start: c.visitStart, end: c.visitEnd },
          tripStart,
          tripEnd
        )
        return { ...c, visitStart: clamped.start, visitEnd: clamped.end }
      })
    )
  }, [tripWindow?.tripStart, tripWindow?.tripEnd])

  const addCustomStop = useCallback((label) => {
    const normalized = label.trim()
    if (normalized.length < 2) return
    setCustomStops((prev) => {
      if (prev.some((c) => c.label.toLowerCase() === normalized.toLowerCase())) return prev
      const id = `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setVisitStopOrder((o) => [...o, `c-${id}`])
      return [
        ...prev,
        {
          id,
          label: normalized,
          visitStart: '',
          visitEnd: '',
        },
      ]
    })
  }, [])

  const removeCustomStop = useCallback((id) => {
    setCustomStops((prev) => prev.filter((c) => c.id !== id))
    setVisitStopOrder((o) => o.filter((k) => k !== `c-${id}`))
  }, [])

  const tripDatesReady = Boolean(tripWindow && !tripDatesError)

  const totalVnStops = selectedIds.length + customStops.length

  const toggleId = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        setVisitStopOrder((o) => o.filter((k) => k !== `p-${id}`))
        setVisitByPresetId((v) => {
          const n = { ...v }
          delete n[id]
          return n
        })
        return prev.filter((x) => x !== id)
      }
      setVisitStopOrder((o) => [...o, `p-${id}`])
      setVisitByPresetId((v) => ({ ...v, [id]: { start: '', end: '' } }))
      return [...prev, id]
    })
  }

  const onReorderStopOrder = useCallback((fromIndex, toIndex) => {
    setVisitStopOrder((order) => arrayMove(order, fromIndex, toIndex))
  }, [])

  const onPresetVisitChange = useCallback((id, partial) => {
    setVisitByPresetId((prev) => ({
      ...prev,
      [id]: { start: '', end: '', ...prev[id], ...partial },
    }))
  }, [])

  const onCustomVisitChange = useCallback((id, partial) => {
    setCustomStops((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)))
  }, [])

  const vnSchedulesComplete = useMemo(() => {
    if (!tripWindow || totalVnStops < 1) return false
    const { tripStart, tripEnd } = tripWindow
    for (const id of selectedIds) {
      const v = visitByPresetId[id]
      if (!v || !visitRangeOk(v.start, v.end, tripStart, tripEnd)) return false
    }
    for (const c of customStops) {
      if (!visitRangeOk(c.visitStart, c.visitEnd, tripStart, tripEnd)) return false
    }
    return true
  }, [tripWindow, totalVnStops, selectedIds, visitByPresetId, customStops])

  const canProceed = useMemo(() => {
    if (isVn) {
      if (tripDatesLoading || tripDatesError || !tripWindow) return false
      return vnSchedulesComplete
    }
    if (tripDatesLoading || tripDatesError || !tripWindow) return false
    /** 「선택된 도시」에 최소 1곳 이상(확인으로 추가된 항목) */
    return nonVnPlaces.length >= 1
  }, [isVn, tripDatesLoading, tripDatesError, tripWindow, vnSchedulesComplete, nonVnPlaces.length])

  const heroSrc = useMemo(() => {
    if (isVn && selectedIds.length) return heroImageForSelection(selectedIds)
    return CITY_IMAGES[arrival.city] || HERO_IMAGE
  }, [isVn, selectedIds, arrival.city])

  const handleNext = () => {
    if (!canProceed) return
    navigate('/trips/new/step5', {
      state: {
        ...mergedNavState,
        step4: {
          arrival,
          tripStart: tripWindow?.tripStart,
          tripEnd: tripWindow?.tripEnd,
          totalDays: tripWindow?.totalDays,
          tripDatesSource: tripWindow?.source,
          vietnamPresetSchedule: isVn
            ? selectedIds.map((id) => ({
                optionId: id,
                visitStart: visitByPresetId[id]?.start,
                visitEnd: visitByPresetId[id]?.end,
              }))
            : [],
          vietnamCustomSchedule: isVn
            ? customStops.map((c) => ({
                id: c.id,
                label: c.label,
                visitStart: c.visitStart,
                visitEnd: c.visitEnd,
              }))
            : [],
          otherStopsNote: isVn ? '' : nonVnPlaces.map((p) => p.label).join('\n'),
        },
      },
    })
  }

  const step4HeaderSubtitle = (
    <>
      메인 도시 기준으로 방문할 지역을 일정 순서대로 입력해 주세요! 저희가 그에 맞는 체크리스트를 만들어드릴게요!
    </>
  )

  const scheduleBlock =
    isVn && tripDatesLoading && totalVnStops > 0 ? (
      <p className="text-xs text-gray-500">여행 기간을 불러오는 중입니다…</p>
    ) : isVn && tripDatesError && totalVnStops > 0 ? (
      <p className="text-xs text-red-600">{tripDatesError}</p>
    ) : isVn && tripDatesReady && totalVnStops > 0 ? (
      <NeighborhoodVisitSchedule
        tripStart={tripWindow.tripStart}
        tripEnd={tripWindow.tripEnd}
        selectedIds={selectedIds}
        visitByPresetId={visitByPresetId}
        onPresetVisitChange={onPresetVisitChange}
        customStops={customStops}
        onCustomVisitChange={onCustomVisitChange}
      />
    ) : null

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #E0F7FA 0%, #F0FDFA 100%)' }}
    >
      <TripStepDesktopSplit
        fullBleed={
          <FullBleedMintGlobeHero
            globe={
              <Suspense
                fallback={
                  <div
                    className="absolute inset-0 animate-pulse opacity-50"
                    style={{
                      background:
                        'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0, 200, 190, 0.15) 0%, transparent 55%)',
                    }}
                  />
                }
              >
                <Step4GlobeHero />
              </Suspense>
            }
          />
        }
        left={
          <>
            <TripFlowDesktopBar backTo="/trips/new/step3" className="mb-6" />

            <StepHeader
              currentStep={STEP4_CONFIG.currentStep}
              totalSteps={STEP4_CONFIG.totalSteps}
              title="방문하는 지역이 어디인가요?"
              subtitle={step4HeaderSubtitle}
              className="mb-6"
              subtitleClassName="text-sm"
            />

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
              <FlightSummaryCard
                arrival={arrival}
                tripWindow={tripWindow}
                tripDatesLoading={tripDatesLoading}
                tripDatesError={tripDatesError}
              />

              {isVn ? (
                <Step4AdditionalCitySearchBar
                  value={additionalCitySearchQuery}
                  onChange={setAdditionalCitySearchQuery}
                />
              ) : (
                <>
                  <Step4NonVnAddRegionInput
                    value={nonVnDraft}
                    onChange={setNonVnDraft}
                    onConfirm={confirmNonVnPlace}
                  />
                  <Step4NonVnSelectedPlacesList
                    items={nonVnPlaces}
                    onRemove={removeNonVnPlace}
                    onReorder={onReorderNonVnPlaces}
                    onRemoveAll={clearAllNonVnPlaces}
                  />
                </>
              )}

              {isVn && (
                <div className="space-y-4 rounded-2xl bg-white/90 p-5 shadow-md backdrop-blur-sm">
                  <VietnamNeighborhoodPicker
                    selectedIds={selectedIds}
                    onToggle={toggleId}
                    customStops={customStops}
                    onAddCustom={addCustomStop}
                    onRemoveCustom={removeCustomStop}
                    onClearAll={clearAllVnStops}
                    visitStopOrder={visitStopOrder}
                    onReorderStopOrder={onReorderStopOrder}
                    searchQuery={additionalCitySearchQuery}
                  />
                </div>
              )}

              {isVn && scheduleBlock && (
                <div className="space-y-4 rounded-2xl bg-white/90 p-5 shadow-md backdrop-blur-sm">{scheduleBlock}</div>
              )}
            </div>

            <div className="mt-6">
              <TripFlowNextStepButton variant="amber" disabled={!canProceed} onClick={handleNext} />
            </div>
          </>
        }
        right={
          <div className="pointer-events-auto absolute bottom-8 left-8 right-8 z-30">
            <AiConciergeTip description={AI_TIP.description} />
          </div>
        }
      />

      <div className="md:hidden">
        <TripFlowMobileBar backTo="/trips/new/step3" />

        <div className="px-5 pt-4 pb-44">
          <StepHeader
            currentStep={STEP4_CONFIG.currentStep}
            totalSteps={STEP4_CONFIG.totalSteps}
            title={
              <>
                방문하는 지역이
                <br />
                어디인가요?
              </>
            }
            subtitle={step4HeaderSubtitle}
            className="mb-5"
            titleClassName="text-2xl"
            subtitleClassName="text-sm"
          />

          <div className="space-y-4 mb-5">
            <FlightSummaryCard
              arrival={arrival}
              tripWindow={tripWindow}
              tripDatesLoading={tripDatesLoading}
              tripDatesError={tripDatesError}
            />

            {isVn ? (
              <Step4AdditionalCitySearchBar
                value={additionalCitySearchQuery}
                onChange={setAdditionalCitySearchQuery}
              />
            ) : (
              <>
                <Step4NonVnAddRegionInput
                  value={nonVnDraft}
                  onChange={setNonVnDraft}
                  onConfirm={confirmNonVnPlace}
                />
                <Step4NonVnSelectedPlacesList
                  items={nonVnPlaces}
                  onRemove={removeNonVnPlace}
                  onReorder={onReorderNonVnPlaces}
                  onRemoveAll={clearAllNonVnPlaces}
                />
              </>
            )}

            {isVn && (
              <div className="rounded-2xl bg-white/95 p-4 shadow-md backdrop-blur-sm">
                <VietnamNeighborhoodPicker
                  selectedIds={selectedIds}
                  onToggle={toggleId}
                  customStops={customStops}
                  onAddCustom={addCustomStop}
                  onRemoveCustom={removeCustomStop}
                  onClearAll={clearAllVnStops}
                  visitStopOrder={visitStopOrder}
                  onReorderStopOrder={onReorderStopOrder}
                  searchQuery={additionalCitySearchQuery}
                />
              </div>
            )}

            {isVn && scheduleBlock && (
              <div className="space-y-4 rounded-2xl bg-white/95 p-4 shadow-md backdrop-blur-sm">{scheduleBlock}</div>
            )}
          </div>

          {isVn && totalVnStops > 0 && (
            <div className="relative rounded-2xl overflow-hidden h-44 mb-4">
              <img src={heroSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase mb-0.5">PREVIEW</p>
                <p className="text-sm font-extrabold text-white">
                  {vnSchedulesComplete ? '동네별 일정 입력 완료' : '동네별 방문 날짜를 입력해 주세요'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 바텀 네비에 가리지 않도록 목적지·Step3와 동일: 탭 높이만큼 위에 고정 */}
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-transparent px-5 pb-3 pt-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
          <TripFlowNextStepButton variant="amber" disabled={!canProceed} onClick={handleNext} />
        </div>
      </div>
    </div>
  )
}
