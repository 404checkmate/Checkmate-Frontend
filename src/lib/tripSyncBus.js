// 같은 탭 안의 변이 지점(체크/편집/저장)이 발생시킨 변경을
// useTripRealtimeSync 훅(브로드캐스트 발신자)에게 전달하는 초경량 이벤트 버스.
// (docs/collab-checklist-plan.md Phase 3)
const listeners = new Set()

export function notifyTripChange(tripId, meta = {}) {
  if (tripId == null) return
  for (const listener of listeners) {
    try {
      listener(String(tripId), meta)
    } catch {
      /* 리스너 오류는 변이 흐름에 영향 주지 않음 */
    }
  }
}

export function subscribeTripChanges(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
