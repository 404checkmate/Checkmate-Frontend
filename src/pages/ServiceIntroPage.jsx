import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRevealOnScrollOnce } from '@/hooks/useRevealOnScrollOnce'
import HomeHeroSection from '@/components/home/HomeHeroSection'
import HomeFeatureSection from '@/components/home/HomeFeatureSection'
import HomeProcessSection from '@/components/home/HomeProcessSection'
import HomeCtaSection from '@/components/home/HomeCtaSection'
import HomeCatchphraseSection from '@/components/home/HomeCatchphraseSection'
import HomeFooter from '@/components/home/HomeFooter'
import HomeScrollToTopFab from '@/components/home/HomeScrollToTopFab'
import { SNAP_TAIL_GROUP } from '@/components/home/constants'
import { trackEvent } from '@/utils/analyticsTracker'

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
    trackEvent('page_view', { page: 'home' })
  }, [])

  const handleStartTrip = () => {
    trackEvent('cta_click', { button: 'start_trip', page: 'home' })
    navigate('/trips/new/destination')
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
        <HomeFooter />
      </div>

      <HomeScrollToTopFab />
    </div>
  )
}

export default HomePage
