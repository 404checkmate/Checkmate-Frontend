import { useEffect, useState } from 'react'
import { getLocalDateYYYYMMDD } from '@/utils/destinationHelpers'

/** 자정·탭 복귀·30초 인터벌로 오늘 날짜(로컬 YYYY-MM-DD)를 최신 상태로 유지 */
export function useTodaySync() {
  const [today, setToday] = useState(getLocalDateYYYYMMDD)

  useEffect(() => {
    const syncToday = () => setToday(getLocalDateYYYYMMDD())
    syncToday()

    const intervalId = setInterval(syncToday, 30_000)

    let midnightTimerId = null
    const scheduleNextMidnight = () => {
      const now = new Date()
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
      const ms = Math.max(500, next.getTime() - now.getTime())
      midnightTimerId = window.setTimeout(() => {
        syncToday()
        scheduleNextMidnight()
      }, ms)
    }
    scheduleNextMidnight()

    const onFocus = () => syncToday()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncToday()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(intervalId)
      if (midnightTimerId != null) window.clearTimeout(midnightTimerId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return today
}
