import { useEffect, useRef, useState } from 'react'

/**
 * 스크롤로 요소가 뷰포트에 들어올 때 한 번만 true.
 * 스크롤 스냅과 함께 쓸 때 rootMargin 으로 트리거 시점을 조정.
 */
export function useRevealOnScrollOnce({
  threshold = 0.18,
  rootMargin = '0px 0px -8% 0px',
} = {}) {
  const ref = useRef(null)
  const [isRevealed, setIsRevealed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            setIsRevealed(true)
            observer.unobserve(el)
            return
          }
        }
      },
      { threshold: [0, threshold, 0.35, 0.55], rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isRevealed]
}
