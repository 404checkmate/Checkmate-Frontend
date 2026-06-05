// 비로그인 상태에서 트립 초대 링크를 연 경우, 로그인 후 수락 페이지로 복귀시키기 위한 토큰 보관
const KEY = 'checkmate_pending_trip_invite_v1'

export function savePendingTripInvite(token) {
  try {
    sessionStorage.setItem(KEY, token)
  } catch {
    /* ignore */
  }
}

export function loadPendingTripInvite() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearPendingTripInvite() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
