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
