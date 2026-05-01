import axios from 'axios'
import { getSupabaseClient } from '@/lib/supabase'

/**
 * 백엔드 API 호출용 axios 인스턴스.
 *
 * 토큰 우선순위:
 *   1. Supabase 세션 (`getSession`) — Google/Kakao 로그인 (기본 경로)
 *   2. localStorage `checkmate:auth_token` — 폴백 (명시적으로 토큰을 저장한 경우)
 */

export const AUTH_TOKEN_STORAGE_KEY = 'checkmate:auth_token'
export const AUTH_PROVIDER_STORAGE_KEY = 'checkmate:auth_provider'

const baseURL = import.meta.env.VITE_API_BASE_URL
if (!baseURL) throw new Error('VITE_API_BASE_URL is required at build time')

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: false,
})

apiClient.interceptors.request.use(async (config) => {
  const token = await resolveAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  } else if (import.meta.env.DEV) {
    console.warn(
      `[apiClient] no access_token resolved → request to ${config.url} will go without Authorization`,
    )
  }
  return config
})

// 401 응답이 와도 localStorage 토큰을 자동 삭제하지 않는다.
// 과거에는 `removeItem(AUTH_TOKEN_STORAGE_KEY)` 가 들어 있었는데,
// (a) 비로그인 상태에서 보호된 라우트에 한 번 진입하면 401 → 폴백 영구 wipe,
// (b) 백엔드 일시 장애로 401 이 떨어져도 사용자는 "갑자기 로그아웃" 되고 supabase 세션도
//     hydration 레이스로 잠깐 비면 토큰 자체가 사라지는 사고가 잦았다.
// 명시적인 로그아웃은 `auth.signOut()` 이 처리하므로 인터셉터에서는 토큰을 건드리지 않는다.
apiClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
)

export async function resolveAccessToken() {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      if (token) {
        return token
      }
    } catch {
      /* fall through to localStorage */
    }
  }
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || null
  } catch {
    return null
  }
}
