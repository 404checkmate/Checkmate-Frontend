import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { AUTH_TOKEN_STORAGE_KEY } from '@/api/client'

/**
 * 인증이 필요한 라우트를 보호합니다.
 *
 * 세션 판정 우선순위 (client.js resolveAccessToken 과 동일):
 *   1. Supabase 세션 (getSession + onAuthStateChange)
 *   2. localStorage `checkmate:auth_token` — Supabase 미설정 환경 폴백
 *
 * 세션 확인 중에는 null을 반환(빈 화면 유지)하여 깜박임을 방지합니다.
 * 미인증 시 /login 으로 리다이렉트하고 현재 경로를 state.from 에 담아
 * 로그인 후 원래 페이지로 돌아올 수 있게 합니다.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  /** @type {'loading'|'authenticated'|'unauthenticated'} */
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
        setStatus(token ? 'authenticated' : 'unauthenticated')
      } catch {
        setStatus('unauthenticated')
      }
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setStatus('unauthenticated')
      return
    }

    let cancelled = false

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setStatus(session?.access_token ? 'authenticated' : 'unauthenticated')
    })

    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (cancelled) return
        setStatus(data?.session?.access_token ? 'authenticated' : 'unauthenticated')
      } catch {
        if (!cancelled) setStatus('unauthenticated')
      }
    })()

    return () => {
      cancelled = true
      try { sub?.subscription?.unsubscribe?.() } catch { /* ignore */ }
    }
  }, [])

  if (status === 'loading') return null

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
