import { useState, useEffect } from 'react'
import { getTrip } from '@/api/trips'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { buildTripWindowLabelFromRange } from '@/utils/tripDateFormat'

export function useTripMeta(tripId) {
  const [tripDateLabel, setTripDateLabel] = useState('')
  const [tripCompanions, setTripCompanions] = useState([])
  const [tripStyles, setTripStyles] = useState([])
  const [tripDestinationLabel, setTripDestinationLabel] = useState('')

  useEffect(() => {
    if (tripId === 'guest') {
      const plan = loadActiveTripPlan()
      if (plan?.tripStartDate && plan?.tripEndDate) {
        setTripDateLabel(buildTripWindowLabelFromRange(plan.tripStartDate, plan.tripEndDate))
      }
      if (plan?.companion) setTripCompanions([plan.companion])
      if (plan?.travelStyles?.length > 0) setTripStyles(plan.travelStyles)
      if (plan?.destination) {
        const { city, country } = plan.destination
        setTripDestinationLabel(city || country || '')
      }
      return
    }

    let cancelled = false
    getTrip(tripId)
      .then((trip) => {
        if (cancelled) return
        if (trip?.tripStart && trip?.tripEnd) {
          const start = String(trip.tripStart).slice(0, 10)
          const end = String(trip.tripEnd).slice(0, 10)
          setTripDateLabel(buildTripWindowLabelFromRange(start, end))
        }
        if (trip?.title) {
          setTripDestinationLabel(String(trip.title).replace(/\s*여행$/, '').trim())
        } else {
          const plan = loadActiveTripPlan()
          if (plan?.destination) {
            const { city, country } = plan.destination
            setTripDestinationLabel(city || country || '')
          }
        }
        if (trip?.companions?.length > 0) {
          setTripCompanions(trip.companions.map((c) => c.companionType?.labelKo).filter(Boolean))
        }
        if (trip?.travelStyles?.length > 0) {
          setTripStyles(trip.travelStyles.map((s) => s.travelStyle?.labelKo).filter(Boolean))
        }
      })
      .catch((err) => {
        console.error('[useTripMeta] getTrip 실패:', err)
      })
    return () => { cancelled = true }
  }, [tripId])

  return { tripDateLabel, tripCompanions, tripStyles, tripDestinationLabel }
}
