import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { upsertChecklistItems } from '@/api/checklists'
import { fetchTripGuideArchives, createGuideArchive, updateGuideArchive } from '@/api/guideArchives'
import { loadEntryChecklistChecks, saveEntryChecklistChecks } from '@/utils/guideArchiveEntryChecklistStorage'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { saveItemsForTrip, loadSavedItems } from '@/utils/savedTripItems'
import { mapMockItemToArchiveItem, buildArchiveSnapshot } from '@/utils/tripSearchUtils'
import { isInExistingArchive } from '@/hooks/useArchiveEntry'
import { savePendingGuestSearch } from '@/utils/pendingGuestSearch'
import { trackEvent } from '@/utils/analyticsTracker'
import { getSupabaseClient } from '@/lib/supabase'
import { AUTH_TOKEN_STORAGE_KEY } from '@/api/client'

export function useTripSearchSave({
  tripId,
  archiveEntryId,
  mergeToArchive,
  archiveEntry,
  sourceItems,
  selectedForSave,
  setSelectedForSave,
  searchStartRef,
  location,
}) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false)
  const [loginGateOpen, setLoginGateOpen] = useState(false)
  const [savedIds, setSavedIds] = useState(
    () => new Set(loadSavedItems(tripId).map((x) => String(x.id)))
  )

  const markItemsSelectedOnServer = (items) => {
    const VALID_SOURCES = ['template', 'llm', 'user_added']
    const payload = items
      .filter((i) => i.title)
      .map((item, idx) => ({
        title: item.title,
        categoryCode: item.subCategory || 'ai_recommend',
        prepType: item.prepType || 'item',
        baggageType: item.baggageType || 'none',
        source: VALID_SOURCES.includes(item.source) ? item.source : 'user_added',
        orderIndex: idx,
      }))
    if (payload.length === 0) return
    upsertChecklistItems(tripId, payload).catch((err) => {
      console.warn('[useTripSearchSave] upsertChecklistItems 실패:', err?.response?.data?.message || err?.message || err)
    })
  }

  const closeSaveConfirmModal = () => {
    if (saving) return
    setSaveConfirmModalOpen(false)
    setSaveError('')
  }

  const executeMergeSave = async (itemsToSave) => {
    const existing = archiveEntry.items ?? []
    const existingSet = (() => {
      const s = new Set()
      existing.forEach((i) => {
        if (i.id) s.add(String(i.id))
        if (i.title) s.add(`${i.subCategory ?? ''}::${String(i.title ?? '').trim()}`)
      })
      return s
    })()
    const additions = itemsToSave.filter((i) => !isInExistingArchive(i, existingSet)).map(mapMockItemToArchiveItem)
    if (additions.length === 0) {
      setSaving(false)
      setSaveConfirmModalOpen(false)
      return
    }

    markItemsSelectedOnServer(itemsToSave.filter((i) => !isInExistingArchive(i, existingSet)))

    const baseSnap = Object.fromEntries(
      Object.entries(archiveEntry).filter(([k]) => !['id', 'serverId', 'archivedAt', 'updatedAt'].includes(k))
    )
    await updateGuideArchive(archiveEntryId, {
      snapshot: { ...baseSnap, items: [...existing, ...additions] },
    })

    const prevChecks = loadEntryChecklistChecks(tripId, archiveEntryId)
    const mergedChecks = { ...prevChecks }
    for (const it of additions) mergedChecks[String(it.id)] = false
    saveEntryChecklistChecks(tripId, archiveEntryId, mergedChecks)

    const newAdditions = additions.filter((i) => !savedIds.has(String(i.id)))
    saveItemsForTrip(tripId, newAdditions)
    newAdditions.forEach((item) => {
      trackEvent('save_complete', {
        trip_id: tripId, item_id: item.id, item_category: item.category,
        mode: 'guide_archive_merge', archive_entry_id: archiveEntryId,
        elapsed_ms: searchStartRef.current ? Date.now() - searchStartRef.current : null,
      })
    })
    setSavedIds((prev) => {
      const next = new Set(prev)
      additions.forEach((i) => next.add(String(i.id)))
      return next
    })
    trackEvent('save_confirm_navigate_guide_archive_merge', {
      trip_id: tripId, archive_entry_id: archiveEntryId, added_count: additions.length,
    })
    window.dispatchEvent(new CustomEvent('guide-archive-checklist-saved', {
      detail: { tripId: String(tripId), entryId: String(archiveEntryId), progress: undefined },
    }))
    setSaving(false)
    setSaveConfirmModalOpen(false)
    setSelectedForSave(new Set())
    sessionStorage.setItem('lastSavedArchiveId', String(archiveEntryId))
    sessionStorage.removeItem('curationSave')
    navigate('/guide-archives')
  }

  const executeNewArchiveSave = async (itemsToSave) => {
    if (tripId === 'guest') {
      setSaveError('여행을 먼저 생성해야 저장할 수 있습니다.')
      setSaving(false)
      return
    }
    const selectedIdSet = new Set(itemsToSave.map((i) => String(i.id)))
    const existingArchives = await fetchTripGuideArchives(tripId)
    const duplicateEntry = existingArchives.find((archive) => {
      const archiveIds = new Set((archive.items ?? []).map((i) => String(i.id)))
      return archiveIds.size === selectedIdSet.size && [...selectedIdSet].every((id) => archiveIds.has(id))
    })
    if (duplicateEntry) {
      setSaving(false)
      setSaveConfirmModalOpen(false)
      sessionStorage.setItem('lastSavedArchiveId', String(duplicateEntry.id))
      navigate('/guide-archives')
      return
    }

    markItemsSelectedOnServer(itemsToSave)

    const newItems = itemsToSave.filter((i) => !savedIds.has(String(i.id)))
    saveItemsForTrip(tripId, newItems)
    newItems.forEach((item) => {
      trackEvent('save_complete', {
        trip_id: tripId, item_id: item.id, item_category: item.category,
        elapsed_ms: searchStartRef.current ? Date.now() - searchStartRef.current : null,
      })
    })
    setSavedIds((prev) => {
      const next = new Set(prev)
      itemsToSave.forEach((i) => next.add(String(i.id)))
      return next
    })

    const plan = loadActiveTripPlan()
    const snapshot = buildArchiveSnapshot(plan, itemsToSave)
    const created = await createGuideArchive(tripId, { name: snapshot.pageTitle, snapshot })
    if (created?.id) {
      const checksInit = Object.fromEntries((snapshot.items ?? []).map((it) => [String(it.id), false]))
      saveEntryChecklistChecks(tripId, created.id, checksInit)
    }

    trackEvent('save_confirm_navigate_guide_archive', { trip_id: tripId, item_count: itemsToSave.length })
    setSaving(false)
    setSaveConfirmModalOpen(false)
    if (created?.id) sessionStorage.setItem('lastSavedArchiveId', String(created.id))
    sessionStorage.removeItem('curationSave')
    navigate('/guide-archives')
  }

  const handleConfirmSaveAndGoArchive = async () => {
    if (saving) return
    const itemsToSave = sourceItems.filter((i) => selectedForSave.has(String(i.id)))
    if (itemsToSave.length === 0) {
      setSaveConfirmModalOpen(false)
      setSaveError('')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      if (mergeToArchive) {
        await executeMergeSave(itemsToSave)
      } else {
        await executeNewArchiveSave(itemsToSave)
      }
    } catch (err) {
      setSaveError(err?.response?.data?.message || err?.message || '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setSaving(false)
      if (import.meta.env.DEV) console.warn('[useTripSearchSave] save 실패', err)
    }
  }

  const handleSaveButtonClick = async () => {
    if (selectedForSave.size === 0) return

    // 로그인 여부를 먼저 확인 (guest 여부와 무관)
    const supabase = getSupabaseClient()
    let isLoggedIn = false
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      isLoggedIn = !!data?.session?.access_token
    } else {
      isLoggedIn = !!localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    }

    if (!isLoggedIn) {
      setLoginGateOpen(true)
      return
    }

    // 로그인 상태지만 guest tripId → 여행 생성 위저드로 안내 (curationSave 보존)
    if (tripId === 'guest') {
      navigate('/trips/new/destination', {
        state: { fromCuration: !!sessionStorage.getItem('curationSave') },
      })
      return
    }

    setSaveConfirmModalOpen(true)
  }

  const handleLoginRedirect = () => {
    setLoginGateOpen(false)
    if (tripId === 'guest') {
      const step5 = location.state?.step5
      savePendingGuestSearch({
        companionId: step5?.companionId ?? null,
        travelStyleIds: step5?.travelStyleIds ?? [],
        selectedItems: sourceItems.filter((i) => selectedForSave.has(String(i.id))),
      })
    }
    navigate('/login', { state: { from: location } })
  }

  return {
    saving,
    saveError,
    saveConfirmModalOpen,
    loginGateOpen,
    setLoginGateOpen,
    handleSaveButtonClick,
    handleConfirmSaveAndGoArchive,
    closeSaveConfirmModal,
    handleLoginRedirect,
  }
}
