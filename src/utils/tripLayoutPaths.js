/** 라우터 pathname 정규화 (끝 슬래시 제거) */
export function normalizePathname(pathname) {
  if (!pathname) return '/'
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/**
 * 모바일에서 전역 Header 표시 여부.
 * 예전에는 TripFlowMobileBar와 겹쳐 숨겼으나, 모바일도 전역 Header(햄버거)로 통일함.
 */
/** 모바일 전용 하단 탭 네비를 숨길 경로 (데스크톱은 원래 `md:hidden`으로 안 보임) */
const MOBILE_BOTTOM_NAV_HIDDEN_PATHS = new Set(['/auth/consent', '/onboarding'])

export function shouldHideMobileBottomNav(pathname) {
  return MOBILE_BOTTOM_NAV_HIDDEN_PATHS.has(normalizePathname(pathname))
}

/**
 * 모바일에서 `RootLayout`의 `<main>`에 `pb-16`(바텀 탭 대비)을 줄지.
 * `/trips/new/*` 플로우는 페이지 안에서 이미 `pb-44` 등으로 여백을 두므로,
 * 중복 시 스크롤 맨 아래에 흰 띠가 생김 → false.
 */
export function shouldPadMainForMobileBottomNav(pathname) {
  const p = normalizePathname(pathname)
  if (shouldHideMobileBottomNav(pathname)) return false
  /** 홈·서비스소개: 그라데이션 배경으로 전체 영역을 채우므로 흰 띠 방지 */
  if (p === '/' || p === '/about') return false
  if (p === '/trips/new' || p.startsWith('/trips/new/')) return false
  /** 가이드 목록·상세: 그라데이션 배경이 있고, main pb-16 이 흰 띠로 보이는 것 방지 */
  if (/^\/trips\/[^/]+\/guide-archive(\/[^/]+)?$/.test(p)) return false
  return true
}

export function shouldHideGlobalHeaderOnMobile(_pathname) {
  return false
}
