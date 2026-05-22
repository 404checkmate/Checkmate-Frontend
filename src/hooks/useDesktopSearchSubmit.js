import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveActiveTripPlan, loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { saveActiveTripId, clearActiveTripId } from '@/utils/activeTripIdStorage'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { createTrip } from '@/api/trips'
import { resolveAccessToken } from '@/api/client'
import { trackEvent } from '@/utils/analyticsTracker'

export function useDesktopSearchSubmit({ selectedCountry, startDate, endDate, additionalDests, companionIds, companions, styleIds, travelStyles }) {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const canSubmit = Boolean(selectedCountry) && startDate && endDate && companionIds.length >= 1 && styleIds.length >= 1 && !submitting

  const handleSearch = async () => {
    if (!canSubmit || !selectedCountry) return
    setSubmitError('')
    setSubmitting(true)

    try {
      trackEvent('cta_click', { button: 'desktop_home_search', destination: selectedCountry.city })

      const hasPet = companionIds.some((id) => id === 'pets' || id === 'withPet')
      const companionLabel = companions.filter((c) => companionIds.includes(c.id)).map((c) => c.label).join(', ') || null
      const travelStyleLabels = travelStyles.filter((s) => styleIds.includes(s.id)).map((s) => s.label)

      saveActiveTripPlan({
        destination: {
          iata: selectedCountry.iata,
          city: selectedCountry.city,
          country: selectedCountry.country,
          countryCode: selectedCountry.countryCode,
        },
        tripStartDate: startDate,
        tripEndDate: endDate,
        additionalDestinations: additionalDests,
        companion: companionLabel,
        hasPet,
        travelStyles: travelStyleLabels,
        companionIds,
        travelStyleIds: styleIds,
      })

      const baseState = {
        destination: {
          iata: selectedCountry.iata,
          city: selectedCountry.city,
          country: selectedCountry.country,
          countryCode: selectedCountry.countryCode,
        },
        fromDestinationPage: true,
        tripStartDate: startDate,
        tripEndDate: endDate,
        additionalDestinations: additionalDests,
        step5: { companionIds, travelStyleIds: styleIds },
      }

      const token = await resolveAccessToken()
      if (!token) {
        navigate('/trips/guest/loading', { state: baseState })
        return
      }

      const plan = loadActiveTripPlan()
      const payload = buildCreateTripPayload(plan, { companionIds, hasPet, travelStyleIds: styleIds })

      if (!payload) {
        setSubmitError('여행 정보를 모두 입력한 뒤 다시 시도해 주세요.')
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
      const msg = err?.response?.data?.message || err?.message || '여행 계획을 저장하지 못했어요.'
      console.warn('[DesktopHomeSearchBar] createTrip 실패:', msg)
      setSubmitError('여행 계획 저장 중 문제가 발생했습니다.')
      clearActiveTripId()
    } finally {
      setSubmitting(false)
    }
  }

  return { handleSearch, submitting, submitError, canSubmit }
}
