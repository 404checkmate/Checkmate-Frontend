import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'
import { consumeAuthCallback } from '@/api/auth'
import {
  AUTH_CONSENT_PATH,
  SESSION_LAST_SOCIAL_PROVIDER,
  hasAcceptedLegalConsent,
  hasCompletedOnboarding,
} from '@/utils/onboardingGate'

/**
 * /auth/callback — Google/Kakao (Supabase) 로그인을 한 화면에서 처리.
 *
 * 흐름:
 *   1. URL hash 또는 Supabase 세션에서 access_token + provider + sub 추출 (`consumeAuthCallback`).
 *   2. sub 를 `onboardingGate` 의 mock sub 위치(localStorage) 에 덮어씀 →
 *      기존 게이트 유틸(`hasCompletedOnboarding`, `hasAcceptedLegalConsent`)이 **그대로** 실 사용자용으로 작동.
 *   3. 기존/신규 사용자 분기: 온보딩 완료 → /, 약관 미동의 → /auth/consent, 약관만 OK → /onboarding.
 *
 * 이 페이지는 팀원 작업 중인 `AuthConsentPage.jsx` / `onboardingGate.js` 를 **수정하지 않고** 동일 계약을 재사용.
 *
 * ## StrictMode 안전성
 * React StrictMode 하에서는 dev 환경에서 `useEffect` 가 두 번 실행된다.
 * 컴포넌트 로컬 `useRef` 가드 + cleanup 의 `alive=false` 조합을 쓰면, 1차 effect 의
 * async 가 완료되기 전에 1차 cleanup 이 `alive=false` 로 바꿔버려 `navigate` 가 영원히
 * 호출되지 않고 스피너가 무한히 도는 문제가 생긴다. 따라서 다음 두 가지로 방어한다:
 *   (1) **모듈 레벨 Promise 캐시**로 `consumeAuthCallback()` 을 세션 중 단 한 번만 실행.
 *   (2) cleanup 에서 in-flight 작업을 "취소"하지 않음 (취소 대신 모듈 캐시로 중복 실행 방지).
 *   (3) 결과로 `navigate` 는 async 완료 시 항상 호출되므로 로딩 상태가 반드시 해제된다.
 */

const ONBOARDING_MOCK_SUB_KEY = (provider) => `checkmate:mock_oauth_sub:${provider}`

/** 안전장치: 콜백 처리가 너무 오래 걸리면 에러 화면으로 넘긴다. */
const CALLBACK_TIMEOUT_MS = 15000

/**
 * `consumeAuthCallback` 을 1회만 실행하도록 모듈 레벨에 Promise 를 캐시한다.
 * StrictMode 의 이중 mount / 라우터 재렌더에서도 안전.
 */
let _callbackPromise = null
function runCallbackOnce() {
  if (!_callbackPromise) {
    _callbackPromise = (async () => {
      try {
        // Supabase `detectSessionInUrl` 이 해시 파싱을 완료하기 전일 수 있어
        // 세션을 짧게 재시도한다. (총 최대 ~1.5s)
        let result = await consumeAuthCallback()
        for (let i = 0; i < 5 && (!result || (!result.ok && result.error === 'no_session')); i += 1) {
          await new Promise((r) => setTimeout(r, 300))
          result = await consumeAuthCallback()
        }
        return result
      } catch (err) {
        return { ok: false, error: err?.message || 'unknown_error' }
      }
    })()
  }
  return _callbackPromise
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [errorMessage, setErrorMessage] = useState('')
  const settledRef = useRef(false)

  useEffect(() => {
    let mounted = true

    const markSettled = () => {
      settledRef.current = true
    }

    const showError = (code) => {
      if (!mounted || settledRef.current) return
      markSettled()
      setStatus('error')
      setErrorMessage(mapCallbackError(code))
    }

    const timeoutId = window.setTimeout(() => {
      showError('timeout')
    }, CALLBACK_TIMEOUT_MS)

    ;(async () => {
      try {
        const result = await runCallbackOnce()
        if (!mounted || settledRef.current) return

        if (!result || !result.ok) {
          showError(result?.error)
          return
        }

        const { provider, sub } = result

        // 기존 프론트 게이트(`onboardingGate.js`) 와 호환되도록 실제 sub 를
        // mock sub 슬롯에 주입. 이 한 줄 덕분에 `AuthConsentPage` / `OnboardingProfilePage` 는 수정 불필요.
        try {
          if (sub) localStorage.setItem(ONBOARDING_MOCK_SUB_KEY(provider), sub)
          sessionStorage.setItem(SESSION_LAST_SOCIAL_PROVIDER, provider)
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }
        } catch {
          /* storage access issues: 무시 */
        }

        markSettled()
        navigate(resolveNext(sub), { replace: true })
      } catch (err) {
        showError(err?.message || 'unknown_error')
      }
    })()

    return () => {
      mounted = false
      window.clearTimeout(timeoutId)
    }
  }, [navigate])

  if (status === 'error') {
    return (
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden">
        <BackgroundGlow />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-10 text-center">
          <BrandLogo className="h-10 w-auto md:h-12" alt="CHECKMATE" />
          <h1 className="mt-2 text-lg font-extrabold tracking-tight text-gray-900 md:text-xl">
            로그인을 완료하지 못했어요
          </h1>
          <p className="text-sm leading-relaxed text-gray-600">{errorMessage}</p>
          <button
            type="button"
            className="mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-600 hover:to-teal-600"
            onClick={() => {
              _callbackPromise = null
              navigate('/login', { replace: true })
            }}
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-10 text-center">
        <BrandLogo className="h-10 w-auto md:h-12" alt="CHECKMATE" />
        <div
          aria-hidden
          className="mt-1 h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500"
        />
        <p className="text-base font-semibold text-gray-800">로그인 처리 중…</p>
        <p className="text-xs text-gray-500">잠시만 기다려 주세요.</p>
      </div>
    </div>
  )
}

function resolveNext(sub) {
  if (!sub) return AUTH_CONSENT_PATH
  if (hasCompletedOnboarding(sub)) return '/'
  if (!hasAcceptedLegalConsent(sub)) return AUTH_CONSENT_PATH
  return '/onboarding'
}

function mapCallbackError(code) {
  switch (code) {
    case 'no_session':
      return '세션을 확인할 수 없습니다. 다시 시도해 주세요.'
    case 'invalid_state':
      return '인증 요청이 만료되었거나 일치하지 않습니다. 다시 시도해 주세요.'
    case 'storage_unavailable':
      return '브라우저 저장소에 접근할 수 없어 로그인 상태를 유지할 수 없습니다.'
    default:
      return code ? `오류: ${code}` : '알 수 없는 오류가 발생했습니다.'
  }
}

function BackgroundGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse 120% 85% at 50% -15%, rgba(34, 211, 238, 0.22), transparent 52%),
          radial-gradient(ellipse 70% 50% at 100% 85%, rgba(45, 212, 191, 0.14), transparent 55%),
          linear-gradient(180deg, #f0fdfa 0%, #f8fafc 46%, #ecfeff 100%)
        `,
      }}
      aria-hidden="true"
    />
  )
}
