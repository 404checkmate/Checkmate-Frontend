/**
 * 온보딩·법적 동의 진입 게이트 — **백엔드 없을 때** 소셜 로그인 직후 분기용 플레이스홀더.
 *
 * ## 제품 흐름 (프론트 시뮬레이션)
 * - **신규(첫 서비스 이용)**: 소셜 로그인 성공 → `/auth/consent`(약관·개인정보) → `/onboarding` → 완료 후 홈
 * - **기존 사용자**: 소셜 로그인 성공 → **바로 `/` (동의·온보딩 화면 생략)**
 *
 * 여기서 **「기존 사용자」**는 로컬 스토리지상 **프로필 온보딩까지 완료한 계정**과 동일합니다.
 * (실서비스에서는 백엔드의 `onboarding_completed` / `profile_completed` 등으로 같은 의미를 쓰면 됩니다.)
 * 온보딩을 **중간에만** 하고 나간 계정은 다음 로그인 시 **남은 단계(온보딩)** 로 이어집니다.
 *
 * 백엔드 연동 후:
 * - OAuth 콜백에서 `user.sub`(또는 id)와 서버 플래그만 보고 `navigate(...)` 분기하면 되고,
 * - 이 모듈의 localStorage/sessionStorage 키는 제거해도 됩니다.
 */

const NS = 'checkmate'
const KEY_ONBOARDED = `${NS}:onboarded_account_ids`
const KEY_LEGAL_CONSENT = `${NS}:legal_consent_account_ids`
const mockSubKey = (provider) => `${NS}:mock_oauth_sub:${String(provider).toLowerCase()}`
export const SESSION_LAST_SOCIAL_PROVIDER = `${NS}:last_social_provider`

/** 약관·개인정보 동의 화면 경로 */
export const AUTH_CONSENT_PATH = '/auth/consent'

/** UI 작업용: 이 쿼리가 있으면 로그인·완료 여부와 관계없이 동의 화면을 표시 */
export const AUTH_CONSENT_PREVIEW_PARAM = 'preview'

function readIdSet(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeIdSet(storageKey, set) {
  localStorage.setItem(storageKey, JSON.stringify([...set]))
}

function readOnboardedSet() {
  return readIdSet(KEY_ONBOARDED)
}

function writeOnboardedSet(set) {
  writeIdSet(KEY_ONBOARDED, set)
}

function readLegalConsentSet() {
  return readIdSet(KEY_LEGAL_CONSENT)
}

function writeLegalConsentSet(set) {
  writeIdSet(KEY_LEGAL_CONSENT, set)
}

/**
 * 프로바이더별로 브라우저에 고정되는 **가짜 OAuth subject** (실제 JWT `sub` 대역).
 */
export function getOrCreateMockOAuthSubject(provider) {
  const p = String(provider).toLowerCase()
  let sub = localStorage.getItem(mockSubKey(p))
  if (!sub) {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    sub = `${p}:${id}`
    localStorage.setItem(mockSubKey(p), sub)
  }
  return sub
}

/** 서비스 **초기 설정 완료**(= 기존 회원). 백엔드의 온보딩 완료 플래그와 대응. */
export function hasCompletedOnboarding(accountSubject) {
  if (!accountSubject) return false
  return readOnboardedSet().has(accountSubject)
}

export function markOnboardingComplete(accountSubject) {
  if (!accountSubject) return
  const s = readOnboardedSet()
  s.add(accountSubject)
  writeOnboardedSet(s)
}

export function hasAcceptedLegalConsent(accountSubject) {
  if (!accountSubject) return false
  return readLegalConsentSet().has(accountSubject)
}

/**
 * @param {string} accountSubject
 * @param {{ marketingOptIn?: boolean }} [options] 선택 마케팅 동의 — 백엔드 연동 시 API로 전송
 */
export function markLegalConsentAccepted(accountSubject, options = {}) {
  if (!accountSubject) return
  const s = readLegalConsentSet()
  s.add(accountSubject)
  writeLegalConsentSet(s)
  if (options.marketingOptIn) {
    try {
      localStorage.setItem(`${NS}:marketing_opt_in:${accountSubject}`, '1')
    } catch {
      /* ignore quota */
    }
  }
}

/**
 * 소셜 로그인 성공 직후(플레이스홀더 클릭) 이동 경로.
 * 순서: 기존(온보딩 완료) → 홈 / 신규·미동의 → 동의 / 동의만 한 신규 → 온보딩
 *
 * @param {'google'|'kakao'} provider
 * @returns {'/'|'/auth/consent'|'/onboarding'}
 */
export function resolvePostSocialLoginPath(provider) {
  if (typeof window === 'undefined') return '/'
  const p = String(provider).toLowerCase()
  sessionStorage.setItem(SESSION_LAST_SOCIAL_PROVIDER, p)
  const sub = getOrCreateMockOAuthSubject(p)
  if (hasCompletedOnboarding(sub)) return '/'
  if (!hasAcceptedLegalConsent(sub)) return AUTH_CONSENT_PATH
  return '/onboarding'
}

export function getActiveOnboardingSubject() {
  if (typeof window === 'undefined') return null
  const prov = sessionStorage.getItem(SESSION_LAST_SOCIAL_PROVIDER)
  if (!prov) return null
  return getOrCreateMockOAuthSubject(prov)
}

/**
 * 온보딩 페이지 마운트 시 리다이렉트.
 * @returns {'login'|'home'|'consent'|null}
 */
export function getOnboardingEntryRedirect() {
  const sub = getActiveOnboardingSubject()
  if (!sub) return 'login'
  if (hasCompletedOnboarding(sub)) return 'home'
  if (!hasAcceptedLegalConsent(sub)) return 'consent'
  return null
}

/**
 * 동의 페이지 진입 가능 여부(이미 동의·온보딩 끝이면 다른 곳으로 보냄).
 * @returns {'login'|'home'|'onboarding'|null} null이면 동의 화면 유지
 */
export function getAuthConsentEntryRedirect() {
  const sub = getActiveOnboardingSubject()
  if (!sub) return 'login'
  if (hasCompletedOnboarding(sub)) return 'home'
  if (hasAcceptedLegalConsent(sub)) return 'onboarding'
  return null
}
