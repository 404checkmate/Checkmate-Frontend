import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveActiveTripPlan, loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { saveActiveTripId, clearActiveTripId } from '@/utils/activeTripIdStorage'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { createTrip } from '@/api/trips'
import { resolveAccessToken } from '@/api/client'
import { trackEvent } from '@/utils/analyticsTracker'
import { COUNTRY_ARRIVAL_OPTIONS } from '@/mocks/tripNewDestinationData'
import { COMPANIONS, TRAVEL_STYLES } from '@/mocks/tripNewStep5Data'

// 여행 스타일 테스트 결과 → 원클릭 체크리스트 생성 디폴트
const TRIP_START_MONTHS_LATER = 1 // 한 달 뒤 출발
const TRIP_NIGHTS = 6 // 6박 7일
const DEFAULT_COMPANION_IDS = ['alone'] // 혼자
const THEME_TO_STYLE_ID = { food: 'foodie' } // 그 외 테마 키는 스타일 id와 동일

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 여행 스타일 테스트 결과 페이지의 "체크리스트 만들기" 전용 훅.
 * 폼 입력 없이 디폴트 값(한 달 뒤 출발 6박 7일 / 혼자 / 테스트 테마 스타일)으로
 * 트립을 바로 생성하고 체크리스트 로딩 페이지로 이동한다.
 * (제출 시퀀스는 useDesktopSearchSubmit와 동일)
 */
export function useTestResultChecklistCreate() {
  const navigate = useNavigate()
  const [creatingCity, setCreatingCity] = useState(null)
  const [createError, setCreateError] = useState('')

  const createChecklist = async (dest, themeKey) => {
    if (creatingCity) return
    setCreateError('')

    // 1) 목적지 해석 (countryCode → 국가 엔트리, iata → 도착지)
    const countryEntry = COUNTRY_ARRIVAL_OPTIONS.find((c) => c.countryCode === dest.countryCode)
    if (!countryEntry) {
      setCreateError('아직 준비 중인 여행지예요. 다른 여행지를 선택해주세요.')
      return
    }
    const arrivals = countryEntry.arrivals ?? [{ city: countryEntry.city, iata: countryEntry.iata }]
    const arrival = arrivals.find((a) => a.iata === dest.iata) ?? arrivals[0]
    const destination = {
      iata: arrival.iata,
      city: arrival.city,
      country: countryEntry.country,
      countryCode: countryEntry.countryCode,
    }

    // 2) 디폴트 값 구성
    const start = new Date()
    start.setMonth(start.getMonth() + TRIP_START_MONTHS_LATER)
    const end = new Date(start)
    end.setDate(end.getDate() + TRIP_NIGHTS)
    const tripStartDate = toYMD(start)
    const tripEndDate = toYMD(end)

    const companionIds = DEFAULT_COMPANION_IDS
    const styleIds = [THEME_TO_STYLE_ID[themeKey] ?? themeKey]
    const companionLabel = COMPANIONS.find((c) => c.id === 'alone')?.label ?? '혼자'
    const travelStyleLabels = TRAVEL_STYLES.filter((s) => styleIds.includes(s.id)).map((s) => s.label)

    setCreatingCity(dest.city)
    try {
      // 퍼널 5단계: 추천 여행지 → 체크리스트 생성 시도
      trackEvent('travel_test_checklist_create', {
        button: 'travel_style_result_checklist',
        destination: dest.city,
        style: themeKey,
      })

      saveActiveTripPlan({
        destination,
        tripStartDate,
        tripEndDate,
        additionalDestinations: [],
        companion: companionLabel,
        hasPet: false,
        travelStyles: travelStyleLabels,
        companionIds,
        travelStyleIds: styleIds,
      })

      const baseState = {
        destination,
        fromDestinationPage: true,
        tripStartDate,
        tripEndDate,
        additionalDestinations: [],
        step5: { companionIds, travelStyleIds: styleIds },
      }

      const token = await resolveAccessToken()
      if (!token) {
        navigate('/trips/guest/loading', { state: baseState })
        return
      }

      const plan = loadActiveTripPlan()
      const payload = buildCreateTripPayload(plan, { companionIds, hasPet: false, travelStyleIds: styleIds })
      if (!payload) {
        setCreateError('체크리스트 생성에 필요한 정보가 부족해요. 잠시 후 다시 시도해주세요.')
        return
      }

      const created = await createTrip(payload)
      const rawId = created?.id ?? created?.tripId
      const createdTripId = rawId != null ? String(rawId) : null

      if (createdTripId) {
        saveActiveTripId(createdTripId)
        trackEvent('trip_creation_completed', { trip_id: createdTripId })
        navigate(`/trips/${createdTripId}/loading`, { state: { ...baseState, createdTripId } })
      } else {
        navigate('/guide-archives', { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '체크리스트 생성 실패'
      console.warn('[TravelStyleResult] createTrip 실패:', msg)
      setCreateError('체크리스트 생성 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.')
      clearActiveTripId()
    } finally {
      setCreatingCity(null)
    }
  }

  return { createChecklist, creatingCity, createError }
}
