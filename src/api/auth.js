import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import {
  apiClient,
  AUTH_PROVIDER_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from '@/api/client'

/**
 * 소셜 로그인 진입 / 세션 조회 / 로그아웃 헬퍼.
 *
 * 설계 원칙:
 * - Google/Kakao 는 Supabase Auth 가 처리(`supabase.auth.signInWithOAuth`).
 * - Naver 는 Supabase 가 네이티브 지원하지 않아 **백엔드 `/auth/naver/login` 중개 경로** 로 이동.
 * - 콜백 처리(`consumeAuthCallback`)는 두 경로 모두 `/auth/callback` 한 곳에서 통합.
 */

const FRONT_ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''
const DEFAULT_CALLBACK = `${FRONT_ORIGIN}/auth/callback`

const NAVER_LOGIN_URL =
  import.meta.env.VITE_AUTH_NAVER_LOGIN_URL ||
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/naver/login`

// ------------------------------------------------------------------
// 로그인 진입
// ------------------------------------------------------------------

/** @param {{ redirectTo?: string }} [opts] */
export async function startGoogleLogin(opts = {}) {
  await startSupabaseOAuth('google', opts)
}

/** @param {{ redirectTo?: string }} [opts] */
export async function startKakaoLogin(opts = {}) {
  await startSupabaseOAuth('kakao', opts)
}

/** 네이버는 페이지 전체 리다이렉트로 백엔드 중개 경로 진입. */
export function startNaverLogin() {
  window.location.href = NAVER_LOGIN_URL
}

async function startSupabaseOAuth(provider, opts) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase 환경변수 미설정: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 .env.local 에 채워 주세요.',
    )
  }
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: opts?.redirectTo ?? DEFAULT_CALLBACK,
    },
  })
  if (error) throw error
}

// ------------------------------------------------------------------
// /auth/callback 에서 호출 — URL 해시 파싱 + 세션 확정
// ------------------------------------------------------------------

/**
 * /auth/callback 에서 호출:
 * - Supabase 경로(`detectSessionInUrl: true`) 는 세션이 자동 생성되므로 `getSession()` 만 읽으면 됨.
 * - Naver 경로는 URL fragment 에 `access_token=...` 이 수동 첨부되어 있음 → 파싱해 localStorage 에 저장.
 *
 * @returns {Promise<{ ok: true, provider: 'google'|'kakao'|'naver', sub: string } | { ok: false, error: string }>}
 */
export async function consumeAuthCallback() {
  const hashParams = parseHashParams(
    typeof window !== 'undefined' ? window.location.hash : '',
  )

  if (hashParams.error) {
    return { ok: false, error: hashParams.error }
  }

  // Naver (우리 백엔드 중개) — hash 에 provider=naver 와 access_token 이 함께 옴.
  if (hashParams.provider === 'naver' && hashParams.access_token) {
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, hashParams.access_token)
      localStorage.setItem(AUTH_PROVIDER_STORAGE_KEY, 'naver')
    } catch {
      return { ok: false, error: 'storage_unavailable' }
    }
    const sub = decodeJwtSub(hashParams.access_token)
    return { ok: true, provider: 'naver', sub: sub ?? '' }
  }

  // Google / Kakao — Supabase 가 URL 을 파싱했을 수도 있음. getSession() 으로 확인.
  const supabase = getSupabaseClient()
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const session = data?.session
    if (session?.access_token) {
      const provider =
        session.user?.app_metadata?.provider === 'kakao'
          ? 'kakao'
          : session.user?.app_metadata?.provider === 'google'
            ? 'google'
            : null
      try {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.access_token)
        if (provider) localStorage.setItem(AUTH_PROVIDER_STORAGE_KEY, provider)
      } catch {
        /* ignore */
      }
      return { ok: true, provider: provider ?? 'google', sub: session.user?.id ?? '' }
    }
  }

  return { ok: false, error: 'no_session' }
}

// ------------------------------------------------------------------
// /auth/me / logout
// ------------------------------------------------------------------

export async function getMe() {
  const res = await apiClient.get('/auth/me')
  return res.data?.user ?? null
}

export async function signOut() {
  try {
    const supabase = getSupabaseClient()
    if (supabase) await supabase.auth.signOut()
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_PROVIDER_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------

function parseHashParams(hash) {
  if (!hash || hash.length <= 1) return {}
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(h)
  const out = {}
  for (const [k, v] of params.entries()) out[k] = v
  return out
}

function decodeJwtSub(token) {
  try {
    const payload = token.split('.')[1]
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(b64)
    const obj = JSON.parse(json)
    return typeof obj.sub === 'string' ? obj.sub : null
  } catch {
    return null
  }
}
