import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { AUTH_TOKEN_STORAGE_KEY } from '@/api/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      // Supabase 미설정 환경: localStorage 토큰으로 판단
      try {
        const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
        setUser(token ? { token } : null)
      } catch {
        setUser(null)
      }
      setLoading(false)
      return
    }

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })

    // 세션 변화 실시간 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, isLoggedIn: !!user }
}
