import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadSavedItems } from '@/utils/savedTripItems'
import { trackEvent } from '@/utils/analyticsTracker'
import {
  loadEntryChecklistChecks,
  saveEntryChecklistChecks,
  seedEntryChecksFromSavedIfEmpty,
} from '@/utils/guideArchiveEntryChecklistStorage'

export function useGuideArchiveChecks({ tripId, entry }) {
  const [checks, setChecks] = useState(() => {
    const fromStorage = loadEntryChecklistChecks(tripId, entry.id)
    if (Object.keys(fromStorage).length > 0) return fromStorage
    // 서버 snapshot에 저장된 체크 상태로 초기화 (다기기 지원)
    return (entry.checksState && typeof entry.checksState === 'object') ? entry.checksState : {}
  })

  const archiveItemsFingerprint = useMemo(
    () => [...(entry.items ?? []).map((it) => String(it.id))].sort().join('|'),
    [entry.items],
  )

  useEffect(() => {
    seedEntryChecksFromSavedIfEmpty(tripId, entry.id, loadSavedItems(tripId), entry.items ?? [])
    const stored = loadEntryChecklistChecks(tripId, entry.id)
    if (Object.keys(stored).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecks(stored)
    } else if (entry.checksState && typeof entry.checksState === 'object') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecks(entry.checksState)
    }
  }, [tripId, entry.id, archiveItemsFingerprint, entry.items, entry.checksState])

  const handleToggle = useCallback((itemId) => {
    const id = String(itemId)
    setChecks((prev) => {
      const checkedAfter = !prev[id]
      const next = { ...prev, [id]: checkedAfter }
      // 토글 즉시 localStorage에 저장 (명시적 저장 버튼 없이도 새로고침 시 유지)
      saveEntryChecklistChecks(tripId, entry.id, next)
      trackEvent('item_checked', { item_id: itemId, checked_after: checkedAfter, trip_id: tripId })
      return next
    })
  }, [tripId, entry.id])

  return { checks, setChecks, handleToggle }
}
