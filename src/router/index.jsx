import { lazy, Suspense } from 'react'
import { useRoutes, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

const RootLayout = lazy(() => import('@/layouts/RootLayout'))
const HomePage = lazy(() => import('@/pages/HomePage'))
const ServiceIntroPage = lazy(() => import('@/pages/ServiceIntroPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const AuthConsentPage = lazy(() => import('@/pages/AuthConsentPage'))
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const OnboardingProfilePage = lazy(() => import('@/pages/OnboardingProfilePage'))
/* 회원가입 UI 보관: 복구 시 아래 라우트를 SignupPage로 되돌리고 import 활성화 */
// import SignupPage from '@/pages/SignupPage'
const TripNewDestinationPage = lazy(() => import('@/pages/TripNewDestinationPage'))
const TripLoadingPage = lazy(() => import('@/pages/TripLoadingPage'))
const TripSearchPage = lazy(() => import('@/pages/TripSearchPage'))
const TripGuideArchiveDetailPage = lazy(() => import('@/pages/TripGuideArchiveDetailPage'))
const GuestGuideArchivePreviewPage = lazy(() => import('@/pages/GuestGuideArchivePreviewPage'))
const MyGuideArchivesPage = lazy(() => import('@/pages/MyGuideArchivesPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const MyPage = lazy(() => import('@/pages/MyPage'))
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'))
const ErrorPage = lazy(() => import('@/pages/ErrorPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const CurationArticlePage = lazy(() => import('@/pages/CurationArticlePage'))
import { FEATURE_PROFILE_ONBOARDING_ENABLED } from '@/utils/onboardingGate'

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-slate-500">
      페이지를 불러오는 중...
    </div>
  )
}

function withSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

/**
 * AppRoutes - useRoutes 기반 라우터 설정 (03_decision_log.md 기반)
 *
 * 페이지 구조:
 *   /                       홈 / 랜딩
 *   /login                  로그인 (회원가입은 현재 /login 으로 통합)
 *   /auth/consent           소셜 로그인 직후 약관·개인정보 동의 → (온보딩 켜짐 시 /onboarding, 아니면 /)
 *   /onboarding             보관용 프로필 온보딩 — FEATURE_PROFILE_ONBOARDING_ENABLED 일 때만 표시, 아니면 / 로 리다이렉트
 *   /trips/new              → /trips/new/destination (3단계 플로우 1/3)
 *   /trips/new/step2, step3 보관용 라우트(활성 플로우 미사용) / destination → step4 → step5
 *   /trips/:id/search       준비 항목 탐색         (Store Loop - DRD-1)
 *   /trips/:id/guide-archive 저장 가이드 목록 → /guide-archive/:entryId 상세에서 준비물 체크
 *   *                       404 NotFound
 *
 * 페이지 추가 시:
 *   1. pages/ 에 컴포넌트 생성
 *   2. 아래 routes 배열에 { path, element } 항목 추가
 *   3. 인증이 필요한 페이지는 ProtectedRoute로 감싸기
 */
const AppRoutes = () => {
  const routes = useRoutes([
    // Layout 적용 라우트
    {
      element: withSuspense(<RootLayout />),
      errorElement: withSuspense(<ErrorPage />),
      children: [
        { path: '/',                    element: withSuspense(<HomePage />) },
        { path: '/about',               element: withSuspense(<ServiceIntroPage />) },
        { path: '/login',               element: withSuspense(<LoginPage />) },
        { path: '/auth/consent',        element: withSuspense(<AuthConsentPage />) },
        { path: '/auth/callback',       element: withSuspense(<AuthCallbackPage />) },
        {
          path: '/onboarding',
          element:
            FEATURE_PROFILE_ONBOARDING_ENABLED
              ? withSuspense(<OnboardingProfilePage />)
              : <Navigate to="/" replace />,
        },
        { path: '/signup',              element: <Navigate to="/login" replace /> },
        { path: '/mypage',              element: <ProtectedRoute>{withSuspense(<MyPage />)}</ProtectedRoute> },
        { path: '/admin/dashboard',     element: <ProtectedRoute>{withSuspense(<AdminDashboardPage />)}</ProtectedRoute> },
        { path: '/trips/new',             element: <Navigate to="/trips/new/destination" replace /> },
        { path: '/trips/new/destination', element: withSuspense(<TripNewDestinationPage />) },
        { path: '/trips/new/step2',       element: <Navigate to="/" replace /> },
        { path: '/trips/new/step3',       element: <Navigate to="/" replace /> },
        { path: '/trips/new/step4',       element: <Navigate to="/" replace /> },
        { path: '/trips/new/step5',       element: <Navigate to="/" replace /> },
        { path: '/trips/guest/search',                element: withSuspense(<TripSearchPage />) },
        { path: '/trips/guest/guide-archive/preview', element: withSuspense(<GuestGuideArchivePreviewPage />) },
        { path: '/trips/:id/search',                  element: <ProtectedRoute>{withSuspense(<TripSearchPage />)}</ProtectedRoute> },
        { path: '/guide-archives',                    element: <ProtectedRoute>{withSuspense(<MyGuideArchivesPage />)}</ProtectedRoute> },
        { path: '/trips/:id/guide-archive/:entryId',  element: <ProtectedRoute>{withSuspense(<TripGuideArchiveDetailPage />)}</ProtectedRoute> },
        { path: '/curation/:country',                 element: withSuspense(<CurationArticlePage />) },
        { path: '/404',                 element: withSuspense(<NotFoundPage />) },
      ],
    },

    // 로딩 페이지 - Header/Footer 없는 독립 풀스크린 (RootLayout 미적용)
    { path: '/trips/guest/loading',   element: withSuspense(<TripLoadingPage />) },
    { path: '/trips/:id/loading', element: <ProtectedRoute>{withSuspense(<TripLoadingPage />)}</ProtectedRoute> },

    // 법적 고지 - Header/Footer 없는 단독 페이지 (누구나 접근 가능)
    { path: '/privacy', element: withSuspense(<PrivacyPage />) },
    { path: '/terms',   element: withSuspense(<TermsPage />) },

    // Fallback - 정의되지 않은 URL → 404 페이지로 이동
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ])

  return routes
}

export default AppRoutes
