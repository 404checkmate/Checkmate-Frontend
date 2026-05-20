import { useState, useEffect, useMemo } from 'react'
import { fetchTripGuideArchives } from '@/api/guideArchives'

function archiveTitleKey(i) {
  return `${i.subCategory ?? ''}::${String(i.title ?? '').trim()}`
}

/**
 * item.id 가 slug(슬러그) vs 백엔드 ID 불일치 시에도 title 기반으로 fallback 비교한다.
 * generateChecklist 응답에는 id 가 없어 slug ID 로 저장됐다가,
 * 이후 listChecklistCandidates 에서 백엔드 ID 로 반환되면 Set.has(id) 가 false 가 되는 문제를 방지.
 */
export function isInExistingArchive(item, existingSet) {
  return existingSet.has(String(item.id)) || existingSet.has(archiveTitleKey(item))
}

export function useArchiveEntry(tripId, archiveEntryId) {
  const [archiveEntry, setArchiveEntry] = useState(null)
  const [archiveEntryStatus, setArchiveEntryStatus] = useState(archiveEntryId ? 'loading' : 'idle')

  useEffect(() => {
    if (!archiveEntryId) {
      setArchiveEntry(null)
      setArchiveEntryStatus('idle')
      return undefined
    }
    let cancelled = false
    setArchiveEntryStatus('loading')
    ;(async () => {
      try {
        const list = await fetchTripGuideArchives(tripId)
        if (cancelled) return
        const found = list.find((e) => String(e.id) === String(archiveEntryId)) ?? null
        setArchiveEntry(found)
        setArchiveEntryStatus(found ? 'ready' : 'missing')
      } catch (err) {
        if (cancelled) return
        setArchiveEntry(null)
        setArchiveEntryStatus('error')
        if (import.meta.env.DEV) {
          console.warn('[useArchiveEntry] 조회 실패:', err?.message ?? err)
        }
      }
    })()
    return () => { cancelled = true }
  }, [tripId, archiveEntryId])

  const mergeToArchive = Boolean(archiveEntryId && archiveEntry)
  const archiveTargetMissing = Boolean(archiveEntryId && archiveEntryStatus === 'missing')
  const existingArchiveItemIds = useMemo(() => {
    const items = mergeToArchive ? archiveEntry.items ?? [] : []
    const set = new Set()
    items.forEach((i) => {
      if (i.id) set.add(String(i.id))
      if (i.title) set.add(archiveTitleKey(i))
    })
    return set
  }, [mergeToArchive, archiveEntry])

  return { archiveEntry, archiveEntryStatus, mergeToArchive, archiveTargetMissing, existingArchiveItemIds }
}
