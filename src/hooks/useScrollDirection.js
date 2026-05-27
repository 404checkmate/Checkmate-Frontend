import { useEffect, useRef, useState } from 'react'

/** 스크롤 방향을 감지해 바텀 네비 표시 여부를 반환 */
export function useScrollDirection() {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 10) setVisible(true)
      else if (y > lastScrollY.current) setVisible(false)
      else setVisible(true)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return visible
}
