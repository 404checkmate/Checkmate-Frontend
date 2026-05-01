import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * 인증이 필요한 라우트를 보호합니다.
 *
 * useAuth가 Supabase onAuthStateChange를 구독하므로
 * 로그아웃 시 자동으로 /login으로 리다이렉트됩니다.
 * 세션 확인 중(loading)에는 전체 화면 스피너를 표시합니다.
 * 미인증 시 /login으로 리다이렉트하고 현재 경로를 state.from에 담아
 * 로그인 후 원래 페이지로 돌아올 수 있게 합니다.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isLoggedIn, loading } = useAuth()

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
    </div>
  )

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
