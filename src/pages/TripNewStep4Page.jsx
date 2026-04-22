import { useLocation, Navigate } from 'react-router-dom'
import { resolveStep4NavigationState } from '@/utils/tripStep4Helpers'
import TripNewStep4PageContent from '@/components/trip/step4/TripNewStep4PageContent'

/**
 * 새 여행 플로우 2/3 — 방문 지역 등. 직전 단계: `/trips/new/destination`, 다음: `/trips/new/step5`.
 * 입국 정보 없으면 `/trips/new/destination`으로 돌려보냄.
 */
export default function TripNewStep4Page() {
  const location = useLocation()
  const { arrival, hasArrival, mergedNavState } = resolveStep4NavigationState(location)
  if (!hasArrival || !arrival) {
    return <Navigate to="/trips/new/destination" replace />
  }
  return <TripNewStep4PageContent arrival={arrival} mergedNavState={mergedNavState} />
}
