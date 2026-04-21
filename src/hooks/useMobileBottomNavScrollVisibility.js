import { useState, useEffect, useRef } from 'react'

/** Tailwind `md` 미만과 동일 (768px 미만만 모바일 하단 탭) */
const MOBILE_MAX_PX = 767

/** 이 높이 이하면 항상 네비 표시 */
const TOP_ALWAYS_SHOW_PX = 32

/** 너무 작은 스크롤은 무시 (터치 지터 완화) */
const DELTA_MIN = 8

/**
 * 모바일에서 스크롤 방향에 따라 하단 탭 표시 여부.
 * - 아래로 스크롤 → 숨김
 * - 위로 스크롤 → 표시
 * - 거의 맨 위 → 항상 표시
 *
 * @param {boolean} enabled 네비가 실제로 렌더되는 화면에서만 true (약관·온보딩 제외)
 * @param {string} pathname 라우트 변경 시 표시 상태를 맨 위 기준으로 리셋
 */
export function useMobileBottomNavScrollVisibility(enabled, pathname) {
  const [visible, setVisible] = useState(true)
  const lastYRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    lastYRef.current = window.scrollY || document.documentElement.scrollTop
    setVisible(true)
  }, [pathname, enabled])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setVisible(true)
      return
    }

    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`)

    const readY = () => window.scrollY || document.documentElement.scrollTop

    const onScroll = () => {
      if (!mq.matches) return
      const y = readY()
      if (y <= TOP_ALWAYS_SHOW_PX) {
        setVisible(true)
        lastYRef.current = y
        return
      }
      const lastY = lastYRef.current
      const delta = y - lastY
      lastYRef.current = y
      if (Math.abs(delta) < DELTA_MIN) return
      if (delta > 0) setVisible(false)
      else setVisible(true)
    }

    const onMqChange = () => {
      if (!mq.matches) setVisible(true)
      lastYRef.current = readY()
    }

    lastYRef.current = readY()
    window.addEventListener('scroll', onScroll, { passive: true })
    mq.addEventListener('change', onMqChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', onMqChange)
    }
  }, [enabled])

  return visible
}
