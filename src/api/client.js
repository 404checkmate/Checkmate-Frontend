import axios from 'axios'
import { getSupabaseClient } from '@/lib/supabase'

/**
 * 백엔드 API 호출용 axios 인스턴스.
 *
 * 토큰 우선순위:
 *   1. Supabase 세션 (`getSession`) — Google/Kakao 로그인
 *   2. localStorage `checkmate:auth_token` — Naver (백엔드 중개) 로그인
 *
 * 이 구조 덕분에 프로바이더에 관계없이 동일하게 `client.get('/trips', ...)` 사용 가능.
 */

export const AUTH_TOKEN_STORAGE_KEY = 'checkmate:auth_token'
export const AUTH_PROVIDER_STORAGE_KEY = 'checkmate:auth_provider'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

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
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
        localStorage.removeItem(AUTH_PROVIDER_STORAGE_KEY)
      } catch {
        /* quota/access issues: ignore */
      }
    }
    return Promise.reject(err)
  },
)

export async function resolveAccessToken() {
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      if (token) return token
    } catch {
      /* fall through */
    }
  }
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || null
  } catch {
    return null
  }
}
