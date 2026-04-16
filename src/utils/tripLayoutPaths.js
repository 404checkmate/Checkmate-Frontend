/** 라우터 pathname 정규화 (끝 슬래시 제거) */
export function normalizePathname(pathname) {
  if (!pathname) return '/'
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/**
 * 모바일에서 TripFlowMobileBar(Step2 스타일)를 쓰고 전역 Header를 숨길 경로
 * — 동일한 상단바를 쓰는 화면과 이중 헤더를 맞추기 위함
 */
export function shouldHideGlobalHeaderOnMobile(pathname) {
  const p = normalizePathname(pathname)
  if (p === '/' || p === '/login' || p === '/404' || p === '/mypage') return true
  if (/^\/trips\/new\/step[2-5]$/.test(p)) return true
  if (/^\/trips\/[^/]+\/search$/.test(p)) return true
  if (/^\/trips\/[^/]+\/checklist$/.test(p)) return true
  if (/^\/trips\/[^/]+\/guide-archive$/.test(p)) return true
  if (/^\/trips\/[^/]+\/guide-archive\/[^/]+$/.test(p)) return true
  return false
}
