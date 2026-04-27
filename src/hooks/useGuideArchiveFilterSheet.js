import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const DISMISS_PX = 100
const CLOSE_FALLBACK_MS = 480
const OPEN_FALLBACK_MS = 450

export function useGuideArchiveFilterSheet() {
  const [filterSheetPhase, setFilterSheetPhase] = useState('closed')
  const [filterEnterAnimActive, setFilterEnterAnimActive] = useState(false)
  const [sheetPullY, setSheetPullY] = useState(0)
  const [sheetPullDragging, setSheetPullDragging] = useState(false)
  const filterPhaseRef = useRef('closed')
  const sheetPullAmountRef = useRef(0)
  const sheetPullDragRef = useRef({ active: false, startY: 0 })
  const filterSheetPullZoneRef = useRef(null)

  const openFilterSheet = useCallback(() => {
    setFilterEnterAnimActive(true)
    setFilterSheetPhase((p) => (p === 'closed' ? 'open' : p))
  }, [])

  const closeFilterSheet = useCallback(() => {
    setSheetPullY(0)
    sheetPullAmountRef.current = 0
    sheetPullDragRef.current.active = false
    setSheetPullDragging(false)
    setFilterSheetPhase((p) => (p === 'open' ? 'closing' : p))
  }, [])

  useEffect(() => {
    filterPhaseRef.current = filterSheetPhase
  }, [filterSheetPhase])

  useEffect(() => {
    if (filterSheetPhase !== 'closing') return
    const id = window.setTimeout(() => {
      setFilterSheetPhase((prev) => (prev === 'closing' ? 'closed' : prev))
    }, CLOSE_FALLBACK_MS)
    return () => window.clearTimeout(id)
  }, [filterSheetPhase])

  useEffect(() => {
    if (filterSheetPhase !== 'open' || !filterEnterAnimActive) return
    const id = window.setTimeout(() => {
      setFilterEnterAnimActive(false)
    }, OPEN_FALLBACK_MS)
    return () => window.clearTimeout(id)
  }, [filterSheetPhase, filterEnterAnimActive])

  useLayoutEffect(() => {
    if (filterSheetPhase !== 'open') return
    const el = filterSheetPullZoneRef.current
    if (!el) return
    const onMove = (e) => {
      if (!sheetPullDragRef.current.active || filterPhaseRef.current !== 'open') return
      if (e.touches.length === 0) return
      const dy = e.touches[0].clientY - sheetPullDragRef.current.startY
      if (dy > 0) {
        setSheetPullY(dy)
        sheetPullAmountRef.current = dy
        e.preventDefault()
      }
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [filterSheetPhase])

  useLayoutEffect(() => {
    if (filterSheetPhase !== 'open') return
    setSheetPullY(0)
    sheetPullAmountRef.current = 0
    setSheetPullDragging(false)
    sheetPullDragRef.current.active = false
  }, [filterSheetPhase])

  useEffect(() => {
    if (filterSheetPhase === 'closed') return
    const onKey = (e) => {
      if (e.key === 'Escape') closeFilterSheet()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filterSheetPhase, closeFilterSheet])

  useEffect(() => {
    if (filterSheetPhase === 'closed') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [filterSheetPhase])

  useEffect(() => {
    const onResize = () => {
      if (typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 768px)').matches) {
        setFilterSheetPhase('closed')
        setSheetPullY(0)
        sheetPullAmountRef.current = 0
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onPullStart = useCallback((e) => {
    if (filterPhaseRef.current !== 'open') return
    sheetPullDragRef.current = { active: true, startY: e.touches[0].clientY }
    setSheetPullDragging(true)
  }, [])

  const onPullEnd = useCallback(() => {
    if (!sheetPullDragRef.current.active) return
    sheetPullDragRef.current.active = false
    setSheetPullDragging(false)
    const d = sheetPullAmountRef.current
    if (d >= DISMISS_PX) {
      closeFilterSheet()
    } else {
      setSheetPullY(0)
    }
    sheetPullAmountRef.current = 0
  }, [closeFilterSheet])

  const onPanelAnimEnd = useCallback(
    (e) => {
      const name = e.animationName
      if (name === 'guide-archive-filter-sheet-down' && filterPhaseRef.current === 'closing') {
        setFilterSheetPhase('closed')
        return
      }
      if (name === 'guide-archive-filter-sheet-up' && filterPhaseRef.current === 'open') {
        setFilterEnterAnimActive(false)
      }
    },
    [],
  )

  return {
    filterSheetPhase,
    filterEnterAnimActive,
    sheetPullY,
    sheetPullDragging,
    filterSheetPullZoneRef,
    isOpen: filterSheetPhase !== 'closed',
    openFilterSheet,
    closeFilterSheet,
    onPullStart,
    onPullEnd,
    onPanelAnimEnd,
  }
}
