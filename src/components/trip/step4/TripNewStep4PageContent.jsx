import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { STEP4_CONFIG, fetchTripDatesForStep4 } from '@/mocks/tripNewStep4Data'
import { COUNTRY_ARRIVAL_OPTIONS, getArrivalsForCountry } from '@/mocks/tripNewDestinationData'
import { loadStep4NavigationState } from '@/utils/tripFlowDraftStorage'
import { trackEvent } from '@/utils/analyticsTracker'
import { arrayMove } from '@/utils/tripStep4Helpers'
import StepHeader from '@/components/common/StepHeader'
import { TripNewFlowDesktopPrevBar } from '@/components/trip/TripNewFlowPrevControls'
import { TripFlowNextStepButton } from '@/components/trip/TripFlowNextStepButton'
import FlightSummaryCard from '@/components/trip/step4/FlightSummaryCard'
import Step4NonVnAddRegionInput from '@/components/trip/step4/Step4NonVnAddRegionInput'
import Step4NonVnSelectedPlacesList from '@/components/trip/step4/Step4NonVnSelectedPlacesList'

const TRIP_FLOW_PAGE_BG_STYLE = {
  background: `
    radial-gradient(ellipse 120% 80% at 50% -15%, rgba(45, 212, 191, 0.18), transparent 55%),
    radial-gradient(ellipse 90% 70% at 0% 30%, rgba(204, 251, 241, 0.55), transparent 50%),
    radial-gradient(ellipse 85% 60% at 100% 70%, rgba(167, 243, 208, 0.28), transparent 52%),
    linear-gradient(165deg, #ecfdf5 0%, #f0fdfa 22%, #ecfeff 48%, #f8fafc 100%)
  `,
}

export default function TripNewStep4PageContent({ arrival, mergedNavState }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [tripWindow, setTripWindow] = useState(null)
  const [tripDatesLoading, setTripDatesLoading] = useState(true)
  const [tripDatesError, setTripDatesError] = useState(null)

  const subArrivals = useMemo(() => {
    const entry = COUNTRY_ARRIVAL_OPTIONS.find((o) => o.countryCode === arrival?.countryCode)
    return getArrivalsForCountry(entry)
  }, [arrival?.countryCode])

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

  const tripDateOverride = useMemo(() => {
    const merged = { ...loadStep4NavigationState(), ...location.state }
    if (merged.fromDestinationPage && merged.tripStartDate && merged.tripEndDate) {
      return { tripStart: merged.tripStartDate, tripEnd: merged.tripEndDate, source: 'destination-picker' }
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
    return () => { cancelled = true }
  }, [arrivalKey, tripDateOverride?.tripStart, tripDateOverride?.tripEnd])

  const canProceed = useMemo(
    () => !tripDatesLoading && !tripDatesError && !!tripWindow,
    [tripDatesLoading, tripDatesError, tripWindow],
  )

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
        없으시면 다음 단계로 바로 넘어가도 돼요!
      </span>
    </>
  )

  return (
    <div className="min-h-screen" style={TRIP_FLOW_PAGE_BG_STYLE}>
      <div className="flex min-h-screen flex-col">
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
    </div>
  )
}
