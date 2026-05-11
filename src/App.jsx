import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import AppRoutes from '@/router'
import { trackEvent } from '@/utils/analyticsTracker'
import { isInAppBrowser, isAndroid, openInExternalBrowser } from '@/utils/browserUtils'

const SESSION_START_KEY = 'cm_session_start_fired'
const EXTERNAL_BROWSER_TRIED_KEY = 'external_browser_tried'

function App() {
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
        trackEvent('session_start', { is_returning: !!lastVisit })
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
