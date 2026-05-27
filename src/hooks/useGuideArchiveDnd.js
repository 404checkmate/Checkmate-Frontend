import { useCallback, useMemo, useState } from 'react'
import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  moveItemAppendToDirectSection,
  moveItemAppendToSection,
  moveItemInsertIntoDirectSection,
  moveItemInsertIntoSection,
  parseGuideArchiveDropTarget,
  reorderGuideArchiveDirectItems,
  reorderGuideArchiveSectionItems,
  resolveGuideArchiveCategoryForSection,
} from '@/utils/guideArchiveChecklistReorder'
import { GUIDE_USER_DIRECT_CATEGORY, resolveBaggageSection } from '@/utils/guideArchiveBaggage'
import { CATEGORIES } from '@/mocks/searchData'
import { trackEvent } from '@/utils/analyticsTracker'

export function useGuideArchiveDnd({ localItems, setLocalItems, effectiveBaggageFilter, tripId, dndLocked }) {
  const [activeDragId, setActiveDragId] = useState(null)
  const [activeDragRect, setActiveDragRect] = useState(null)

  const activeDragItem = useMemo(
    () => activeDragId ? localItems.find((i) => String(i.id) === activeDragId) ?? null : null,
    [activeDragId, localItems],
  )

  const dndSensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  const handleGuideArchiveDragEnd = useCallback((event) => {
    if (dndLocked) return
    const { active, over } = event
    if (!over) return

    const aid = String(active.id)
    const oid = String(over.id)
    if (aid === oid) return

    const activeItem = localItems.find((x) => String(x.id) === aid)
    if (!activeItem) return

    const dropParsed = parseGuideArchiveDropTarget(oid)
    const overItem = dropParsed ? null : localItems.find((x) => String(x.id) === oid)

    const activeBag = resolveBaggageSection(activeItem)
    const activeRaw = activeItem.category ?? '_misc'
    const activeCat = resolveGuideArchiveCategoryForSection(activeItem)

    if (overItem) {
      const overBag = resolveBaggageSection(overItem)
      const overRaw = overItem.category ?? '_misc'
      const overCat = resolveGuideArchiveCategoryForSection(overItem)

      const sameNormalSection =
        activeRaw !== GUIDE_USER_DIRECT_CATEGORY &&
        overRaw !== GUIDE_USER_DIRECT_CATEGORY &&
        activeBag === overBag &&
        activeCat === overCat

      const sameDirect =
        activeRaw === GUIDE_USER_DIRECT_CATEGORY &&
        overRaw === GUIDE_USER_DIRECT_CATEGORY &&
        (effectiveBaggageFilter === 'all' || activeBag === effectiveBaggageFilter) &&
        (effectiveBaggageFilter === 'all' || overBag === effectiveBaggageFilter)

      if (sameNormalSection) {
        const sectionList = localItems.filter(
          (x) =>
            resolveBaggageSection(x) === activeBag &&
            resolveGuideArchiveCategoryForSection(x) === activeCat &&
            (x.category ?? '_misc') !== GUIDE_USER_DIRECT_CATEGORY,
        )
        const oldI = sectionList.findIndex((x) => String(x.id) === aid)
        const newI = sectionList.findIndex((x) => String(x.id) === oid)
        if (oldI >= 0 && newI >= 0 && oldI !== newI) {
          setLocalItems((p) => reorderGuideArchiveSectionItems(p, activeBag, activeCat, oldI, newI))
        }
        return
      }

      if (sameDirect) {
        const directList = localItems.filter(
          (x) =>
            (x.category ?? '_misc') === GUIDE_USER_DIRECT_CATEGORY &&
            (effectiveBaggageFilter === 'all' || resolveBaggageSection(x) === effectiveBaggageFilter),
        )
        const oldI = directList.findIndex((x) => String(x.id) === aid)
        const newI = directList.findIndex((x) => String(x.id) === oid)
        if (oldI >= 0 && newI >= 0 && oldI !== newI) {
          setLocalItems((p) => reorderGuideArchiveDirectItems(p, effectiveBaggageFilter, oldI, newI))
        }
        return
      }

      if (overRaw === GUIDE_USER_DIRECT_CATEGORY) {
        if (activeRaw === GUIDE_USER_DIRECT_CATEGORY) return
        setLocalItems((p) => moveItemInsertIntoDirectSection(p, aid, oid, effectiveBaggageFilter))
        return
      }

      if (activeRaw === GUIDE_USER_DIRECT_CATEGORY) {
        const targetCv = resolveGuideArchiveCategoryForSection(overItem)
        const catLabel =
          targetCv === 'supplies'
            ? CATEGORIES.find((c) => c.value === 'supplies')?.label ?? '준비물'
            : overItem.categoryLabel || overItem.category || '준비물'
        setLocalItems((p) => moveItemInsertIntoSection(p, aid, overBag, targetCv, catLabel, oid))
        return
      }

      if (activeBag !== overBag || activeCat !== overCat) {
        const targetCv = resolveGuideArchiveCategoryForSection(overItem)
        const catLabel =
          targetCv === 'supplies'
            ? CATEGORIES.find((c) => c.value === 'supplies')?.label ?? '준비물'
            : overItem.categoryLabel || overItem.category || '준비물'
        setLocalItems((p) => moveItemInsertIntoSection(p, aid, overBag, targetCv, catLabel, oid))
      }
      return
    }

    if (!dropParsed) return

    if (dropParsed.kind === 'direct') {
      if (activeRaw === GUIDE_USER_DIRECT_CATEGORY) return
      setLocalItems((p) => moveItemAppendToDirectSection(p, aid))
      return
    }

    const { bagKey, categoryValue, categoryLabel } = dropParsed
    const sameAsActive =
      activeRaw !== GUIDE_USER_DIRECT_CATEGORY &&
      activeBag === bagKey &&
      activeCat === categoryValue

    if (sameAsActive) return
    setLocalItems((p) => moveItemAppendToSection(p, aid, bagKey, categoryValue, categoryLabel))
  }, [dndLocked, localItems, effectiveBaggageFilter])

  const handleGuideArchiveDragStart = useCallback(({ active }) => {
    const sid = String(active.id)
    setActiveDragId(sid)

    const applyMeasured = () => {
      const initial = active.rect?.current?.initial
      if (initial && initial.width > 0) {
        setActiveDragRect({ width: Math.round(initial.width), height: Math.round(initial.height) })
        return true
      }
      const el = document.querySelector(`[data-guide-archive-dnd-item="${sid}"]`)
      if (el) {
        const cr = el.getBoundingClientRect()
        if (cr.width > 0) {
          setActiveDragRect({ width: Math.round(cr.width), height: Math.round(cr.height) })
          return true
        }
      }
      setActiveDragRect(null)
      return false
    }

    if (!applyMeasured()) requestAnimationFrame(applyMeasured)
  }, [])

  const handleGuideArchiveDragCancel = useCallback(() => {
    setActiveDragId(null)
    setActiveDragRect(null)
  }, [])

  const handleGuideArchiveDragEndWithOverlay = useCallback((event) => {
    const { active, over } = event
    if (!dndLocked && over && String(active.id) !== String(over.id)) {
      trackEvent('edit_reorder', { trip_id: tripId })
    }
    handleGuideArchiveDragEnd(event)
    setActiveDragId(null)
    setActiveDragRect(null)
  }, [dndLocked, handleGuideArchiveDragEnd, tripId])

  return {
    dndSensors,
    activeDragItem,
    activeDragRect,
    handleGuideArchiveDragStart,
    handleGuideArchiveDragCancel,
    handleGuideArchiveDragEndWithOverlay,
  }
}
