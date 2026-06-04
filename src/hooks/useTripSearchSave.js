import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { upsertChecklistItems } from '@/api/checklists'
import { fetchTripGuideArchives, createGuideArchive, updateGuideArchive } from '@/api/guideArchives'
import { createTrip } from '@/api/trips'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { saveActiveTripId } from '@/utils/activeTripIdStorage'
import { loadEntryChecklistChecks, saveEntryChecklistChecks } from '@/utils/guideArchiveEntryChecklistStorage'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { saveItemsForTrip, loadSavedItems } from '@/utils/savedTripItems'
import { mapMockItemToArchiveItem, buildArchiveSnapshot } from '@/utils/tripSearchUtils'
import { isInExistingArchive } from '@/hooks/useArchiveEntry'
import { savePendingGuestSearch } from '@/utils/pendingGuestSearch'
import { trackEvent } from '@/utils/analyticsTracker'
import { ga4Event } from '@/utils/ga4'
import { getSupabaseClient } from '@/lib/supabase'
import { AUTH_TOKEN_STORAGE_KEY } from '@/api/client'

const BACKEND_PREP_TYPES = new Set(['item', 'pre_booking', 'pre_departure_check', 'ai_recommend', 'etc'])
const toBackendPrepType = (v) => (v && BACKEND_PREP_TYPES.has(v) ? v : 'item')

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
        ...(item.description ? { description: item.description } : {}),
        categoryCode: item.subCategory || 'ai_recommend',
        prepType: toBackendPrepType(item.prepType),
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
    if (newAdditions.length > 0) {
      trackEvent('save_complete', {
        trip_id: tripId,
        item_count: newAdditions.length,
        mode: 'guide_archive_merge',
        archive_entry_id: archiveEntryId,
        elapsed_ms: searchStartRef.current ? Date.now() - searchStartRef.current : null,
      })
    }
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
    if (newItems.length > 0) {
      trackEvent('save_complete', {
        trip_id: tripId,
        item_count: newItems.length,
        elapsed_ms: searchStartRef.current ? Date.now() - searchStartRef.current : null,
      })
    }
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
    ga4Event('checklist_save_click', { item_count: selectedForSave.size })

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
      if (tripId === 'guest') {
        const step5 = location.state?.step5
        savePendingGuestSearch({
          companionIds: step5?.companionIds ?? [],
          travelStyleIds: step5?.travelStyleIds ?? [],
          selectedItems: sourceItems.filter((i) => selectedForSave.has(String(i.id))),
        })
        navigate('/trips/guest/guide-archive/preview')
        return
      }
      setLoginGateOpen(true)
      return
    }

    // 로그인 상태 + guest tripId → 플랜 데이터로 여행 즉시 생성 후 저장
    if (tripId === 'guest') {
      const plan = loadActiveTripPlan()
      const companionIds = plan?.companionIds?.length ? plan.companionIds : []
      const travelStyleIds = plan?.travelStyleIds?.length ? plan.travelStyleIds : []

      if (!companionIds.length || !travelStyleIds.length) {
        // 플랜 정보 부족 → 여행 생성 위저드로
        navigate('/trips/new/destination', {
          state: { fromCuration: !!sessionStorage.getItem('curationSave') },
        })
        return
      }

      setSaving(true)
      setSaveError('')
      try {
        const hasPet = companionIds.some((id) => id === 'pets' || id === 'withPet')
        const payload = buildCreateTripPayload(plan, { companionIds, hasPet, travelStyleIds })
        if (!payload) {
          navigate('/trips/new/destination', { state: { fromCuration: false } })
          setSaving(false)
          return
        }

        const itemsToSave = sourceItems.filter((i) => selectedForSave.has(String(i.id)))
        const created = await createTrip(payload)
        const rawId = created?.id ?? created?.tripId
        const realId = rawId != null ? String(rawId) : null
        if (!realId) throw new Error('여행 생성에 실패했습니다.')

        saveActiveTripId(realId)

        if (itemsToSave.length > 0) {
          const upsertPayload = itemsToSave
            .filter((i) => i.title)
            .map((item, idx) => ({
              title: item.title,
              ...(item.description ? { description: item.description } : {}),
              categoryCode: item.subCategory || 'ai_recommend',
              prepType: toBackendPrepType(item.prepType),
              baggageType: item.baggageType || 'none',
              source: item.source || 'template',
              orderIndex: idx,
            }))
          if (upsertPayload.length > 0) {
            await upsertChecklistItems(realId, upsertPayload).catch((err) => {
              console.error('[useTripSearchSave] guest upsertItems 실패:', err)
            })
          }
          const snapshot = buildArchiveSnapshot(loadActiveTripPlan(), itemsToSave)
          const archiveCreated = await createGuideArchive(realId, { name: snapshot.pageTitle, snapshot })
          if (archiveCreated?.id) sessionStorage.setItem('lastSavedArchiveId', String(archiveCreated.id))
          sessionStorage.removeItem('curationSave')
          setSaving(false)
          navigate('/guide-archives')
        } else {
          setSaving(false)
          navigate(`/trips/${realId}/search`)
        }
      } catch (err) {
        setSaveError(err?.response?.data?.message || err?.message || '저장 중 오류가 발생했습니다.')
        setSaving(false)
      }
      return
    }

    setSaveConfirmModalOpen(true)
  }

  const handleLoginRedirect = () => {
    setLoginGateOpen(false)
    if (tripId === 'guest') {
      const step5 = location.state?.step5
      savePendingGuestSearch({
        companionIds: step5?.companionIds ?? [],
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
