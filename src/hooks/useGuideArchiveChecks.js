import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadSavedItems } from '@/utils/savedTripItems'
import { trackEvent } from '@/utils/analyticsTracker'
import {
  loadEntryChecklistChecks,
  seedEntryChecksFromSavedIfEmpty,
} from '@/utils/guideArchiveEntryChecklistStorage'

export function useGuideArchiveChecks({ tripId, entry }) {
  const [checks, setChecks] = useState(() => loadEntryChecklistChecks(tripId, entry.id))

  const archiveItemsFingerprint = useMemo(
    () => [...(entry.items ?? []).map((it) => String(it.id))].sort().join('|'),
    [entry.items],
  )

  useEffect(() => {
    seedEntryChecksFromSavedIfEmpty(tripId, entry.id, loadSavedItems(tripId), entry.items ?? [])
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecks(loadEntryChecklistChecks(tripId, entry.id))
  }, [tripId, entry.id, archiveItemsFingerprint, entry.items])

  const handleToggle = useCallback((itemId) => {
    const id = String(itemId)
    setChecks((prev) => {
      const checkedAfter = !prev[id]
      trackEvent('item_checked', { item_id: itemId, checked_after: checkedAfter, trip_id: tripId })
      return { ...prev, [id]: checkedAfter }
    })
  }, [tripId])

  return { checks, setChecks, handleToggle }
}
