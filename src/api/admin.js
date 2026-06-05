import { apiClient } from '@/api/client'

/**
 * 관리자 대시보드 지표 API — 백엔드 `admin-metrics` 모듈.
 * 모든 엔드포인트는 ADMIN_EMAILS 허용 목록 가드(403)로 보호된다.
 * from/to: 'YYYY-MM-DD' (생략 시 백엔드 기본 최근 30일)
 */

function rangeParams(range) {
  const params = {}
  if (range?.from) params.from = range.from
  if (range?.to) params.to = range.to
  return params
}

/** 쿼리 1+2. 일별 핵심 퍼널 (방문/탐색/항목선택/저장/로그인/여행생성 + 전환율) */
export async function fetchFunnel(range) {
  const res = await apiClient.get('/admin/metrics/funnel', { params: rangeParams(range) })
  return res.data
}

/** 쿼리 3. 신규/누적 로그인 유저 */
export async function fetchLogins(range) {
  const res = await apiClient.get('/admin/metrics/logins', { params: rangeParams(range) })
  return res.data
}

/** 쿼리 4. 유입 채널별 세션 */
export async function fetchChannels(range) {
  const res = await apiClient.get('/admin/metrics/channels', { params: rangeParams(range) })
  return res.data
}

/** 쿼리 7. 목적지 탐색수 vs 아티클 보유 (전체 기간) */
export async function fetchContentGap() {
  const res = await apiClient.get('/admin/metrics/content-gap')
  return res.data
}

/** 쿼리 8. 가입 코호트별 D1/D7 리텐션 */
export async function fetchRetention(range) {
  const res = await apiClient.get('/admin/metrics/retention', { params: rangeParams(range) })
  return res.data
}

/** 쿼리 9. 저장 유저 vs 비저장 유저 재방문율 (전체 기간) */
export async function fetchSaveRetention() {
  const res = await apiClient.get('/admin/metrics/save-retention')
  return res.data
}

/** 쿼리 10. 게스트 프리뷰 퍼널 */
export async function fetchGuestPreview(range) {
  const res = await apiClient.get('/admin/metrics/guest-preview', { params: rangeParams(range) })
  return res.data
}

/** 쿼리 11. 여행 스타일 테스트 퍼널 (진입→시작→완료→공유/체크리스트) */
export async function fetchTravelTest(range) {
  const res = await apiClient.get('/admin/metrics/travel-test', { params: rangeParams(range) })
  return res.data
}

/** 쿼리 12. 여행 스타일 테스트 결과 유형 분포 */
export async function fetchTravelTestTypes(range) {
  const res = await apiClient.get('/admin/metrics/travel-test-types', { params: rangeParams(range) })
  return res.data
}
