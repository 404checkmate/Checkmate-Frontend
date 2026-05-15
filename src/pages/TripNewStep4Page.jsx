import { useLocation, Navigate } from 'react-router-dom'
import { resolveStep4NavigationState } from '@/utils/tripStep4Helpers'
import TripNewStep4PageContent from '@/components/trip/step4/TripNewStep4PageContent'

/**
 * 새 여행 플로우 2/3 — 방문 지역 등. 직전 단계: `/trips/new/destination`, 다음: `/trips/new/step5`.
 * 모바일/태블릿: TripNewDestinationPage로 리다이렉트.
 */
export default function TripNewStep4Page() {
  const location = useLocation()

  if (window.innerWidth < 768) {
    return <Navigate to="/trips/new/destination" replace />
  }

  const { arrival, hasArrival, mergedNavState } = resolveStep4NavigationState(location)
  if (!hasArrival || !arrival) {
    return <Navigate to="/trips/new/destination" replace />
  }
  return <TripNewStep4PageContent arrival={arrival} mergedNavState={mergedNavState} />
}
