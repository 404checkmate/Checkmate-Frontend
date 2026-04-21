import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 브라우저 클라이언트 싱글톤.
 *
 * - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 미설정 시 `null` 을 반환하여
 *   env 없이도 앱이 로드되도록 한다 (개발 초기에 팀원이 env 없이 UI 만지는 걸 막지 않기 위함).
 * - `onAuthStateChange` / `signInWithOAuth` / `getSession` 등은 이 클라이언트를 통해서만 호출.
 */

let _client = null

export function getSupabaseClient() {
  if (_client) return _client

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    if (import.meta.env.DEV) {
      console.warn(
        '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. 소셜 로그인 비활성 상태로 동작합니다.',
      )
    }
    return null
  }

  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // /auth/callback 에서 해시를 자동 파싱
      flowType: 'implicit',
    },
  })
  return _client
}

/** 환경변수 없이도 동작해야 하는 자리(로그인 버튼 등)에서 호출. */
export function isSupabaseConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
}
