import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { STEP4_CONFIG, fetchTripDatesForStep4 } from '@/mocks/tripNewStep4Data'
import { COUNTRY_ARRIVAL_OPTIONS, getArrivalsForCountry } from '@/mocks/tripNewDestinationData'
import { loadStep4NavigationState } from '@/utils/tripFlowDraftStorage'
import { trackEvent } from '@/utils/analyticsTracker'
import { arrayMove } from '@/utils/tripStep4Helpers'
import StepHeader from '@/components/common/StepHeader'
import {
  TripNewFlowDesktopPrevBar,
  TripNewFlowMobilePrevAction,
} from '@/components/trip/TripNewFlowPrevControls'
import { TripFlowNextStepButton } from '@/components/trip/TripFlowNextStepButton'
import FlightSummaryCard from '@/components/trip/step4/FlightSummaryCard'
import Step4NonVnAddRegionInput from '@/components/trip/step4/Step4NonVnAddRegionInput'
import Step4NonVnSelectedPlacesList from '@/components/trip/step4/Step4NonVnSelectedPlacesList'

/** TripNewDestinationPage와 동일 — 이미지 히어로 없이 틸·민트 계열 */
const TRIP_FLOW_PAGE_BG_STYLE = {
  background: `
    radial-gradient(ellipse 120% 80% at 50% -15%, rgba(45, 212, 191, 0.18), transparent 55%),
    radial-gradient(ellipse 90% 70% at 0% 30%, rgba(204, 251, 241, 0.55), transparent 50%),
    radial-gradient(ellipse 85% 60% at 100% 70%, rgba(167, 243, 208, 0.28), transparent 52%),
    linear-gradient(165deg, #ecfdf5 0%, #f0fdfa 22%, #ecfeff 48%, #f8fafc 100%)
  `,
}

/**
 * Step4 본문 — 항공 요약 + 방문 지역 자유 입력(모든 입국지 동일 UI).
 */
export default function TripNewStep4PageContent({ arrival, mergedNavState }) {
  const navigate = useNavigate()
  const location = useLocation()

  /** fetchTripDatesForStep4 결과 (목데이터 또는 추후 API) */
  const [tripWindow, setTripWindow] = useState(null)
  const [tripDatesLoading, setTripDatesLoading] = useState(true)
  const [tripDatesError, setTripDatesError] = useState(null)

  const subArrivals = useMemo(() => {
    const entry = COUNTRY_ARRIVAL_OPTIONS.find((o) => o.countryCode === arrival?.countryCode)
    return getArrivalsForCountry(entry)
  }, [arrival?.countryCode])

  /** 입력 초안 / 확인 시 목록에 추가(선택) → Step5 otherStopsNote로 합쳐 전달 */
  const [placeDraft, setPlaceDraft] = useState('')
  const [selectedPlaces, setSelectedPlaces] = useState([])

  const confirmPlace = useCallback((text) => {
    const t = text.trim()
    if (t.length < 1) return
    setSelectedPlaces((prev) => [
      ...prev,
      { id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, label: t },
    ])
    setPlaceDraft('')
  }, [])

  const removePlace = useCallback((id) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const reorderPlaces = useCallback((fromIndex, toIndex) => {
    setSelectedPlaces((prev) => arrayMove(prev, fromIndex, toIndex))
  }, [])

  const clearAllPlaces = useCallback(() => {
    setSelectedPlaces([])
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

  const canProceed = useMemo(() => {
    if (tripDatesLoading || tripDatesError || !tripWindow) return false
    return true
  }, [tripDatesLoading, tripDatesError, tripWindow])

  const handleNext = () => {
    if (!canProceed) return
    trackEvent('step_complete', { step: 'dates', duration_days: tripWindow?.totalDays })
    navigate('/trips/new/step5', {
      state: {
        ...mergedNavState,
        step4: {
          arrival,
          tripStart: tripWindow?.tripStart,
          tripEnd: tripWindow?.tripEnd,
          totalDays: tripWindow?.totalDays,
          tripDatesSource: tripWindow?.source,
          vietnamPresetSchedule: [],
          vietnamCustomSchedule: [],
          otherStopsNote: selectedPlaces.map((p) => p.label).join('\n'),
        },
      },
    })
  }

  const step4HeaderSubtitle = (
    <>
      <span className="block">
        선택하신 취항지(입국 도시) 근처에 더 여행할 지역이 있으면 일정 순서대로 적어 주세요.
      </span>
      <span className="mt-2.5 block text-base font-semibold leading-snug text-teal-900 sm:text-[15px]">
        없으면 그대로 다음 단계로 넘어가도 돼요.
      </span>
    </>
  )

  return (
    <div className="min-h-screen" style={TRIP_FLOW_PAGE_BG_STYLE}>
      <div className="hidden min-h-screen flex-col md:flex">
        {/* Header.jsx 와 동일: max-w-7xl + px-3 md:px-6 lg:px-8 → 로고·이전으로 왼선 일치 */}
        <div className="shrink-0 mx-auto w-full max-w-7xl px-3 pt-8 md:px-6 md:pt-8 lg:px-8 lg:pt-10">
          <TripNewFlowDesktopPrevBar
            align="start"
            to="/trips/new/destination"
            label="이전으로"
            ariaLabel="목적지·날짜 선택으로 돌아가기"
          />
        </div>
        <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 items-center justify-center px-3 py-8 md:px-6 md:py-8 lg:px-8 lg:py-10">
          <div className="scrollbar-hide w-full max-w-xl overflow-y-auto">
            <StepHeader
              currentStep={STEP4_CONFIG.currentStep}
              totalSteps={STEP4_CONFIG.totalSteps}
              title={
                <>
                  추가로 방문하는 지역이 있나요?
                  <br />
                  <span className="text-2xl font-bold text-gray-700">(선택사항)</span>
                </>
              }
              subtitle={step4HeaderSubtitle}
              className="mb-6"
              subtitleClassName="text-sm"
            />

            <div className="space-y-5">
              <FlightSummaryCard
                arrival={arrival}
                tripWindow={tripWindow}
                tripDatesLoading={tripDatesLoading}
                tripDatesError={tripDatesError}
              />

              <Step4NonVnAddRegionInput
                value={placeDraft}
                onChange={setPlaceDraft}
                onConfirm={confirmPlace}
                arrivals={subArrivals}
              />
              <Step4NonVnSelectedPlacesList
                items={selectedPlaces}
                onRemove={removePlace}
                onReorder={reorderPlaces}
                onRemoveAll={clearAllPlaces}
              />
            </div>

            <div className="mt-6">
              <TripFlowNextStepButton variant="amber" disabled={!canProceed} onClick={handleNext} />
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="px-5 pt-4 pb-44">
          <StepHeader
            currentStep={STEP4_CONFIG.currentStep}
            totalSteps={STEP4_CONFIG.totalSteps}
            title={
              <>
                추가로 방문하는 지역이 있나요?
                <br />
                <span className="text-lg font-bold text-gray-700">(선택사항)</span>
              </>
            }
            subtitle={step4HeaderSubtitle}
            className="mb-5"
            titleClassName="text-2xl"
            subtitleClassName="text-sm"
            topEndAction={
              <TripNewFlowMobilePrevAction
                to="/trips/new/destination"
                label="이전으로"
                ariaLabel="목적지·날짜 선택으로 돌아가기"
              />
            }
          />

          <div className="mb-5 space-y-4">
            <FlightSummaryCard
              arrival={arrival}
              tripWindow={tripWindow}
              tripDatesLoading={tripDatesLoading}
              tripDatesError={tripDatesError}
            />

            <Step4NonVnAddRegionInput
              value={placeDraft}
              onChange={setPlaceDraft}
              onConfirm={confirmPlace}
              arrivals={subArrivals}
            />
            <Step4NonVnSelectedPlacesList
              items={selectedPlaces}
              onRemove={removePlace}
              onReorder={reorderPlaces}
              onRemoveAll={clearAllPlaces}
            />
          </div>
        </div>

        <div className="fixed bottom-16 left-0 right-0 z-40 bg-transparent px-5 pb-3 pt-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
          <TripFlowNextStepButton variant="amber" disabled={!canProceed} onClick={handleNext} />
        </div>
      </div>
    </div>
  )
}
