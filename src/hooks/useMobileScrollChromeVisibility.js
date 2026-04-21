import { useState, useEffect, useRef } from 'react'

/** Tailwind `md` 미만과 동일 (768px 미만만 모바일 크롬) */
const MOBILE_MAX_PX = 767

/** 이 높이 이하면 항상 상단·하단 크롬 표시 */
const TOP_ALWAYS_SHOW_PX = 32

/** 너무 작은 스크롤은 무시 (터치 지터 완화) */
const DELTA_MIN = 8

/**
 * 모바일에서 스크롤 방향에 따라 상단 헤더·하단 탭 동시 표시 여부.
 * - 아래로 스크롤 → 숨김
 * - 위로 스크롤 → 표시
 * - 거의 맨 위 → 항상 표시
 *
 * @param {boolean} enabled 약관·온보딩 등 제외 화면에서만 true
 * @param {string} pathname 라우트 변경 시 표시를 맨 위 기준으로 리셋
 */
export function useMobileScrollChromeVisibility(enabled, pathname) {
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
