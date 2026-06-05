import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import AppRoutes from '@/router'
import { trackEvent } from '@/utils/analyticsTracker'
import { ga4SetUserId, ga4SetUserProperty } from '@/utils/ga4'
import { useAuth } from '@/hooks/useAuth'
import { isInAppBrowser, isAndroid, openInExternalBrowser } from '@/utils/browserUtils'

const SESSION_START_KEY = 'cm_session_start_fired'
const EXTERNAL_BROWSER_TRIED_KEY = 'external_browser_tried'

function App() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      ga4SetUserId(user.id)
      ga4SetUserProperty({ login_status: 'logged_in' })
    } else {
      ga4SetUserId(null)
      ga4SetUserProperty({ login_status: 'guest' })
    }
  }, [user, loading])

  useEffect(() => {
    if (isInAppBrowser() && isAndroid()) {
      try {
        if (!sessionStorage.getItem(EXTERNAL_BROWSER_TRIED_KEY)) {
          sessionStorage.setItem(EXTERNAL_BROWSER_TRIED_KEY, 'true')
          openInExternalBrowser()
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_START_KEY)) {
        const lastVisit = localStorage.getItem('checkmate:last_visit')
        // 유입 채널 — 어드민 대시보드 쿼리 4(channels)에서 사용
        const params = new URLSearchParams(window.location.search)
        trackEvent('session_start', {
          is_returning: !!lastVisit,
          utm_source: params.get('utm_source') || null,
          utm_medium: params.get('utm_medium') || null,
          utm_campaign: params.get('utm_campaign') || null,
          referrer: document.referrer || null,
          landing: window.location.pathname,
        })
        sessionStorage.setItem(SESSION_START_KEY, '1')
        localStorage.setItem('checkmate:last_visit', String(Date.now()))
      }
    } catch {}
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
      <Analytics />
    </BrowserRouter>
  )
}

export default App
