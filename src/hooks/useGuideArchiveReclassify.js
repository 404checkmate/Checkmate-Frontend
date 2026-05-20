import { useEffect, useMemo, useRef } from 'react'
import { reclassifyGuideArchiveItems } from '@/api/checklists'
import { patchGuideArchiveEntry } from '@/utils/guideArchiveStorage'
import { GUIDE_USER_DIRECT_CATEGORY } from '@/utils/guideArchiveBaggage'

/** AI 2차 분류 — refinedCategory 미확정 항목을 백엔드에 분류 요청하고 결과를 반영한다 */
export function useGuideArchiveReclassify({ tripId, entry, localItems, setLocalItems, onArchiveMutated }) {
  const attemptedRef = useRef(new Set())

  const candidatesSignature = useMemo(() => {
    return (localItems ?? [])
      .filter((it) => {
        const base = String(it?.category ?? '')
        if (!base || base === GUIDE_USER_DIRECT_CATEGORY) return false
        return !String(it?.refinedCategory ?? '').trim()
      })
      .map((it) => String(it.id))
      .sort((a, b) => a.localeCompare(b))
      .join('|')
  }, [localItems])

  useEffect(() => {
    if (!candidatesSignature) return
    const requestKey = `${String(tripId)}:${String(entry.id)}:${candidatesSignature}`
    if (attemptedRef.current.has(requestKey)) return
    attemptedRef.current.add(requestKey)

    const candidates = (localItems ?? []).filter((it) => {
      const base = String(it?.category ?? '')
      if (!base || base === GUIDE_USER_DIRECT_CATEGORY) return false
      return !String(it?.refinedCategory ?? '').trim()
    })
    if (candidates.length === 0) return

    let cancelled = false
    ;(async () => {
      try {
        const response = await reclassifyGuideArchiveItems({
          tripId: String(tripId),
          entryId: String(entry.id),
          items: candidates.map((it) => ({
            id: String(it.id),
            title: it.title ?? '',
            description: it.description ?? '',
            detail: it.detail ?? '',
            category: it.category ?? '',
            prepType: it.prepType ?? '',
            subCategory: it.subCategory ?? '',
          })),
        })

        const mapped = new Map(
          (Array.isArray(response?.items) ? response.items : [])
            .filter((row) => row && row.id != null)
            .map((row) => [
              String(row.id),
              {
                refinedCategory: String(row.category ?? '').trim(),
                refinedSubCategory: String(row.subCategory ?? '').trim(),
                refineConfidence:
                  typeof row.confidence === 'number' && Number.isFinite(row.confidence)
                    ? row.confidence
                    : undefined,
              },
            ]),
        )
        if (mapped.size === 0 || cancelled) return

        let changed = false
        const refinedAt = new Date().toISOString()
        const nextItems = localItems.map((it) => {
          const key = String(it.id)
          const hit = mapped.get(key)
          if (!hit) return it
          const nextRefinedCategory =
            hit.refinedCategory || String(it.refinedCategory ?? '').trim() || String(it.category ?? '')
          const nextRefinedSubCategory =
            hit.refinedSubCategory || String(it.refinedSubCategory ?? '').trim() || undefined
          const sameCategory = String(it.refinedCategory ?? '') === nextRefinedCategory
          const sameSubCategory = String(it.refinedSubCategory ?? '') === String(nextRefinedSubCategory ?? '')
          if (sameCategory && sameSubCategory) return it
          changed = true
          return {
            ...it,
            refinedCategory: nextRefinedCategory,
            refinedSubCategory: nextRefinedSubCategory,
            refineConfidence: hit.refineConfidence ?? it.refineConfidence,
            refinedByModel: response?.model ?? it.refinedByModel,
            refinedAt,
          }
        })

        if (!changed || cancelled) return
        patchGuideArchiveEntry(tripId, entry.id, {
          items: nextItems,
          checklistSavedAt: new Date().toISOString(),
        })
        setLocalItems(nextItems)
        onArchiveMutated?.()
      } catch (err) {
        console.warn(
          '[useGuideArchiveReclassify] 2차 분류 요청 실패(기존 분류 유지):',
          err?.response?.data?.message || err?.message || err,
        )
      }
    })()

    return () => { cancelled = true }
  }, [tripId, entry.id, candidatesSignature, localItems, onArchiveMutated])
}
