import { useLocation, Navigate } from 'react-router-dom'
import { resolveStep4NavigationState } from '@/utils/tripStep4Helpers'
import TripNewStep4PageContent from '@/components/trip/step4/TripNewStep4PageContent'

/**
 * 새 여행 Step4 — 라우트 `/trips/new/step4`에만 연결됩니다.
 */
export default function TripNewStep4Page() {
  const location = useLocation()
  const { arrival, hasArrival, mergedNavState } = resolveStep4NavigationState(location)
  if (!hasArrival || !arrival) {
    return <Navigate to="/trips/new/step3" replace />
  }
  return <TripNewStep4PageContent arrival={arrival} mergedNavState={mergedNavState} />
}
