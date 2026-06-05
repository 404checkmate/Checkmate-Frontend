// 여행 스타일 테스트 결과 보관 — 마이페이지 "내 여행 유형" 카드에서 사용
const KEY = 'checkmate:travel_style_result_v1'

export function saveTravelStyleResult({ theme, piece }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ theme, piece, at: new Date().toISOString() }))
  } catch {
    /* ignore */
  }
}

export function loadTravelStyleResult() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.theme && parsed?.piece ? parsed : null
  } catch {
    return null
  }
}
