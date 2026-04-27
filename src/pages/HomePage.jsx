import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { isMockWebSessionLoggedIn } from '@/utils/onboardingGate'
import { useRevealOnScrollOnce } from '@/hooks/useRevealOnScrollOnce'
import HomeHeroSection from '@/components/home/HomeHeroSection'
import HomeFeatureSection from '@/components/home/HomeFeatureSection'
import HomeProcessSection from '@/components/home/HomeProcessSection'
import HomeCtaSection from '@/components/home/HomeCtaSection'
import HomeCatchphraseSection from '@/components/home/HomeCatchphraseSection'
import HomeFooter from '@/components/home/HomeFooter'
import HomeScrollToTopFab from '@/components/home/HomeScrollToTopFab'
import { SNAP_TAIL_GROUP } from '@/components/home/constants'

const HOME_SCROLL_SNAP_HTML_CLASS = 'home-page-scroll-snap'

const HOME_PAGE_BG_STYLE = {
  backgroundColor: '#f3fff8',
  backgroundImage: `radial-gradient(circle at 8% 12%, rgba(117, 221, 255, 0.34) 0%, rgba(117, 221, 255, 0) 20%),
    radial-gradient(circle at 80% 16%, rgba(248, 215, 116, 0.34) 0%, rgba(248, 215, 116, 0) 24%),
    radial-gradient(circle at 10% 44%, rgba(117, 221, 255, 0.18) 0%, rgba(117, 221, 255, 0) 20%),
    radial-gradient(circle at 68% 78%, rgba(251, 222, 132, 0.2) 0%, rgba(251, 222, 132, 0) 28%),
    linear-gradient(180deg, #e8fffe 0%, #f4fff1 52%, #fff9e8 100%)`,
}

function HomePage() {
  const navigate = useNavigate()
  const noticeToastTimerRef = useRef(null)
  const [noticeToastVisible, setNoticeToastVisible] = useState(false)
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false)
  const [heroRevealed, setHeroRevealed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const [featuresRef, featuresRevealed] = useRevealOnScrollOnce({
    threshold: 0.2,
    rootMargin: '0px 0px -12% 0px',
  })
  const [processRef, processRevealed] = useRevealOnScrollOnce({
    threshold: 0.16,
    rootMargin: '0px 0px -10% 0px',
  })
  const [ctaRef, ctaRevealed] = useRevealOnScrollOnce({
    threshold: 0.18,
    rootMargin: '0px 0px -10% 0px',
  })
  const [catchphraseRef, catchphraseRevealed] = useRevealOnScrollOnce({
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px',
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return undefined
    document.documentElement.classList.add(HOME_SCROLL_SNAP_HTML_CLASS)
    return () => {
      document.documentElement.classList.remove(HOME_SCROLL_SNAP_HTML_CLASS)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setHeroRevealed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (noticeToastTimerRef.current) {
        window.clearTimeout(noticeToastTimerRef.current)
      }
    }
  }, [])

  const handleStartTrip = () => {
    if (isMockWebSessionLoggedIn()) {
      navigate('/trips/new/destination')
    } else {
      setLoginRequiredOpen(true)
    }
  }

  const showNoticePreparingToast = () => {
    if (noticeToastTimerRef.current) {
      window.clearTimeout(noticeToastTimerRef.current)
    }
    setNoticeToastVisible(true)
    noticeToastTimerRef.current = window.setTimeout(() => {
      setNoticeToastVisible(false)
      noticeToastTimerRef.current = null
    }, 3000)
  }

  return (
    <div className="relative" style={HOME_PAGE_BG_STYLE}>
      <HomeHeroSection heroRevealed={heroRevealed} onStartTrip={handleStartTrip} />
      <HomeFeatureSection featuresRef={featuresRef} featuresRevealed={featuresRevealed} />
      <HomeProcessSection processRef={processRef} processRevealed={processRevealed} />
      <HomeCtaSection ctaRef={ctaRef} ctaRevealed={ctaRevealed} onStartTrip={handleStartTrip} />

      <div className={SNAP_TAIL_GROUP}>
        <HomeCatchphraseSection
          catchphraseRef={catchphraseRef}
          catchphraseRevealed={catchphraseRevealed}
        />
        <HomeFooter showNoticePreparingToast={showNoticePreparingToast} />
      </div>

      {loginRequiredOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="닫기"
                onClick={() => setLoginRequiredOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-[1] w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-xl"
              >
                <p className="text-center text-base font-semibold text-gray-900">
                  로그인이 필요한 서비스입니다
                </p>
                <p className="mt-1.5 text-center text-sm text-gray-500">
                  로그인 후 이용해 주세요.
                </p>
                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                    onClick={() => setLoginRequiredOpen(false)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:from-cyan-400 hover:to-teal-500"
                    onClick={() => {
                      setLoginRequiredOpen(false)
                      navigate('/login')
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {noticeToastVisible ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          준비중입니다
        </div>
      ) : null}

      <HomeScrollToTopFab />
    </div>
  )
}

export default HomePage
