import { useRoutes, Navigate } from 'react-router-dom'

import RootLayout from '@/layouts/RootLayout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import AuthConsentPage from '@/pages/AuthConsentPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import OnboardingProfilePage from '@/pages/OnboardingProfilePage'
/* 회원가입 UI 보관: 복구 시 아래 라우트를 SignupPage로 되돌리고 import 활성화 */
// import SignupPage from '@/pages/SignupPage'
import TripNewStep2Page from '@/pages/TripNewStep2Page'
import TripNewDestinationPage from '@/pages/TripNewDestinationPage'
import TripNewStep3Page from '@/pages/TripNewStep3Page'
import TripNewStep4Page from '@/pages/TripNewStep4Page'
import TripNewStep5Page from '@/pages/TripNewStep5Page'
import TripLoadingPage from '@/pages/TripLoadingPage'
import TripSearchPage from '@/pages/TripSearchPage'
import TripGuideArchivePage from '@/pages/TripGuideArchivePage'
import TripGuideArchiveDetailPage from '@/pages/TripGuideArchiveDetailPage'
import NotFoundPage from '@/pages/NotFoundPage'
import MyPage from '@/pages/MyPage'
import ErrorPage from '@/pages/ErrorPage'
import { FEATURE_PROFILE_ONBOARDING_ENABLED } from '@/utils/onboardingGate'

/**
 * AppRoutes - useRoutes 기반 라우터 설정 (03_decision_log.md 기반)
 *
 * 페이지 구조:
 *   /                       홈 / 랜딩
 *   /login                  로그인 (회원가입은 현재 /login 으로 통합)
 *   /auth/consent           소셜 로그인 직후 약관·개인정보 동의 → (온보딩 켜짐 시 /onboarding, 아니면 /)
 *   /onboarding             보관용 프로필 온보딩 — FEATURE_PROFILE_ONBOARDING_ENABLED 일 때만 표시, 아니면 / 로 리다이렉트
 *   /trips/new              → /trips/new/step2 리다이렉트 (TripNewPage 제거)
 *   /trips/new/step2~       새 여행 플로우 (/destination = 예매 전 도시·날짜)
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
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        { path: '/',                    element: <HomePage /> },
        { path: '/login',               element: <LoginPage /> },
        { path: '/auth/consent',        element: <AuthConsentPage /> },
        { path: '/auth/callback',       element: <AuthCallbackPage /> },
        {
          path: '/onboarding',
          element:
            FEATURE_PROFILE_ONBOARDING_ENABLED ? <OnboardingProfilePage /> : <Navigate to="/" replace />,
        },
        { path: '/signup',              element: <Navigate to="/login" replace /> },
        { path: '/mypage',              element: <MyPage /> },
        { path: '/trips/new',           element: <Navigate to="/trips/new/step2" replace /> },
        { path: '/trips/new/step2',     element: <TripNewStep2Page /> },
        { path: '/trips/new/destination', element: <TripNewDestinationPage /> },
        { path: '/trips/new/step3',     element: <TripNewStep3Page /> },
        /** Step4: 이 경로는 TripNewStep4Page 단 하나만 사용 (중복 라우트 없음) */
        { path: '/trips/new/step4',     element: <TripNewStep4Page /> },
        { path: '/trips/new/step5',     element: <TripNewStep5Page /> },
        { path: '/trips/:id/search',                  element: <TripSearchPage /> },
        { path: '/trips/:id/guide-archive/:entryId',  element: <TripGuideArchiveDetailPage /> },
        { path: '/trips/:id/guide-archive',           element: <TripGuideArchivePage /> },
        { path: '/404',                 element: <NotFoundPage /> },
      ],
    },

    // 로딩 페이지 - Header/Footer 없는 독립 풀스크린 (RootLayout 미적용)
    { path: '/trips/:id/loading', element: <TripLoadingPage /> },

    // Fallback - 정의되지 않은 URL → 404 페이지로 이동
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ])

  return routes
}

export default AppRoutes
