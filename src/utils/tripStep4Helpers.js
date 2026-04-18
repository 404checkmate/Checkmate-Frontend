import { loadStep4NavigationState } from '@/utils/tripFlowDraftStorage'

/** Step3 또는 목적지 페이지에서 저장한 draft의 destination과 라우터 state 병합. 목 기본 입국지 없음. */
export function resolveStep4NavigationState(location) {
  const draft = loadStep4NavigationState()
  const routerState = location.state ?? {}
  const merged = { ...draft, ...routerState }
  const fromRouterDest = routerState.destination ?? null
  const draftDest = draft?.destination ?? null
  const arrival = fromRouterDest || draftDest || null
  const hasArrival = Boolean(arrival)

  return { arrival, hasArrival, mergedNavState: merged }
}

export function arrayMove(arr, fromIndex, toIndex) {
  if (fromIndex === toIndex) return arr
  const next = [...arr]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

/** 방문 시작·종료가 여행 전체 기간 안에 있고 시작≤종료인지 */
export function visitRangeOk(visitStart, visitEnd, tripStart, tripEnd) {
  if (!visitStart || !visitEnd || !tripStart || !tripEnd) return false
  if (new Date(visitEnd) < new Date(visitStart)) return false
  if (visitStart < tripStart || visitEnd > tripEnd) return false
  return true
}

/** API/목데이터로 여행 기간이 바뀌었을 때, 이미 입력된 방문일이 범위 밖이면 자동 보정 */
export function clampVisitDatesToTripWindow(visit, tripStart, tripEnd) {
  if (!tripStart || !tripEnd) return visit
  let start = visit.start
  let end = visit.end
  if (start) {
    if (start < tripStart) start = tripStart
    if (start > tripEnd) start = ''
  }
  if (end) {
    if (end > tripEnd) end = tripEnd
    if (end < tripStart) end = ''
  }
  if (start && end && end < start) end = start
  return { ...visit, start, end }
}
