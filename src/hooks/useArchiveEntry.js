import { useState, useEffect, useMemo } from 'react'
import { fetchTripGuideArchives } from '@/api/guideArchives'

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
  const existingArchiveItemIds = useMemo(
    () => new Set((mergeToArchive ? archiveEntry.items ?? [] : []).map((i) => String(i.id))),
    [mergeToArchive, archiveEntry],
  )

  return { archiveEntry, archiveEntryStatus, mergeToArchive, archiveTargetMissing, existingArchiveItemIds }
}
