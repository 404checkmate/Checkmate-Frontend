import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams, useSearchParams, Link, useLocation } from 'react-router-dom'

import { useMobileScrollChromeVisibility } from '@/hooks/useMobileScrollChromeVisibility'
import { CATEGORIES, TRIP_SEARCH_CONTEXT } from '@/mocks/searchData'
import { getTrip, createTrip } from '@/api/trips'
import {
  generateChecklist,
  generateChecklistFromContext,
  listChecklistCandidates,
  upsertChecklistItems,
} from '@/api/checklists'
import { adaptGeneratedChecklist, getTabCategories } from '@/utils/checklistAdapter'
import { saveItemsForTrip, loadSavedItems } from '@/utils/savedTripItems'
import { buildTripWindowLabelFromRange } from '@/utils/tripDateFormat'
import {
  fetchTripGuideArchives,
  createGuideArchive,
  updateGuideArchive,
} from '@/api/guideArchives'
import { loadEntryChecklistChecks, saveEntryChecklistChecks } from '@/utils/guideArchiveEntryChecklistStorage'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { buildGuideArchiveDateLine, buildGuideArchiveListTitle } from '@/utils/guideArchivePresentation'
import {
  TRIP_MINT_PAGE_BACKGROUND_STYLE,
  TRIP_SEARCH_MERGE_PAGE_BACKGROUND_STYLE,
} from '@/utils/tripMintPageBackground'
import {
  normalizeItemCategory,
  sortItemsForDisplay,
  buildSubcategoryGroups,
  buildContextInputFromPlan,
  mapMockItemToArchiveItem,
} from '@/utils/tripSearchUtils'
import GuideArchiveProgressBar from '@/components/guide/GuideArchiveProgressBar'
import TripSearchPageHeader from '@/components/search/TripSearchPageHeader'
import TripSearchCategoryFilter from '@/components/search/TripSearchCategoryFilter'
import TripSearchItemsList from '@/components/search/TripSearchItemsList'
import TripSearchSaveModal from '@/components/search/TripSearchSaveModal'
import TripSearchLeaveModal from '@/components/search/TripSearchLeaveModal'
import { trackEvent } from '@/utils/analyticsTracker'
import { getSupabaseClient } from '@/lib/supabase'
import { AUTH_TOKEN_STORAGE_KEY } from '@/api/client'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { saveActiveTripId } from '@/utils/activeTripIdStorage'
import { savePendingGuestSearch, loadPendingGuestSearch, clearPendingGuestSearch } from '@/utils/pendingGuestSearch'

function TripSearchInner({ tripId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const navBarVisible = useMobileScrollChromeVisibility(true, location.pathname)
  const [searchParams] = useSearchParams()
  const archiveEntryIdRaw = searchParams.get('archiveEntry')
  const archiveEntryId =
    archiveEntryIdRaw && String(archiveEntryIdRaw).trim() ? String(archiveEntryIdRaw).trim() : null

  const [archiveEntry, setArchiveEntry] = useState(null)
  /** archiveEntryId 가 있을 때 한해서 'loading' → 'ready' | 'missing' | 'error'. 그 외엔 'idle'. */
  const [archiveEntryStatus, setArchiveEntryStatus] = useState(archiveEntryId ? 'loading' : 'idle')

  const [tripDateLabel, setTripDateLabel] = useState('')
  const [tripCompanions, setTripCompanions] = useState([])
  const [tripStyles, setTripStyles] = useState([])

  useEffect(() => {
    if (tripId === 'guest') {
      const plan = loadActiveTripPlan()
      if (plan?.tripStartDate && plan?.tripEndDate) {
        setTripDateLabel(buildTripWindowLabelFromRange(plan.tripStartDate, plan.tripEndDate))
      }
      if (plan?.companion) setTripCompanions([plan.companion])
      if (plan?.travelStyles?.length > 0) setTripStyles(plan.travelStyles)
      return
    }
    let cancelled = false
    getTrip(tripId)
      .then((trip) => {
        if (cancelled) return
        if (trip?.tripStart && trip?.tripEnd) {
          const start = String(trip.tripStart).slice(0, 10)
          const end = String(trip.tripEnd).slice(0, 10)
          setTripDateLabel(buildTripWindowLabelFromRange(start, end))
        }
        if (trip?.companions?.length > 0) {
          setTripCompanions(
            trip.companions.map((c) => c.companionType?.labelKo).filter(Boolean)
          )
        }
        if (trip?.travelStyles?.length > 0) {
          setTripStyles(
            trip.travelStyles.map((s) => s.travelStyle?.labelKo).filter(Boolean)
          )
        }
      })
      .catch((err) => {
        console.error('[TripSearchPage] getTrip 실패:', err)
        // tripDateLabel, tripCompanions, tripStyles는 초기 빈 값 유지
      })
    return () => { cancelled = true }
  }, [tripId])

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
          console.warn('[TripSearchPage] archiveEntry 조회 실패:', err?.message ?? err)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tripId, archiveEntryId])

  const mergeToArchive = Boolean(archiveEntryId && archiveEntry)
  const archiveTargetMissing = Boolean(archiveEntryId && archiveEntryStatus === 'missing')

  const pageMainTitle = mergeToArchive ? '여행 필수품 추가' : TRIP_SEARCH_CONTEXT.title
  const categoryCardHeading = mergeToArchive ? '카테고리별 추가 선택' : '카테고리별 선택'
  const existingArchiveItemIds = useMemo(
    () => new Set((mergeToArchive ? archiveEntry.items ?? [] : []).map((i) => String(i.id))),
    [mergeToArchive, archiveEntry],
  )

  const guestTripRanRef = useRef(false)
  const guestTripCancelledRef = useRef(false)
  const searchStartRef = useRef(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [savedIds, setSavedIds] = useState(() => new Set(loadSavedItems(tripId).map((x) => String(x.id))))
  const [selectedForSave, setSelectedForSave] = useState(() => new Set())
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false)
  const [loginGateOpen, setLoginGateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loadState, setLoadState] = useState({ status: 'loading', fromApi: false })
  const [apiItems, setApiItems] = useState([])
  const [apiSummary, setApiSummary] = useState(null)
  const [retryTick, setRetryTick] = useState(0)

  // guest 모드 + 로그인 상태: 실제 trip 생성 후 replace 이동
  useEffect(() => {
    if (tripId !== 'guest') return
    guestTripCancelledRef.current = false
    if (guestTripRanRef.current) return
    guestTripRanRef.current = true
    ;(async () => {
      const supabase = getSupabaseClient()
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      if (!data?.session?.access_token) return
      if (guestTripCancelledRef.current) return

      const pending = loadPendingGuestSearch()
      if (!pending?.companionId || !pending?.travelStyleIds?.length) return

      const plan = loadActiveTripPlan()
      const hasPet = pending.companionId === 'pets' || pending.companionId === 'withPet'
      const payload = buildCreateTripPayload(plan, {
        companionId: pending.companionId,
        hasPet,
        travelStyleIds: pending.travelStyleIds,
      })
      if (!payload) {
        setLoadState({ status: 'fallback', fromApi: false, errorMessage: '여행 정보가 부족합니다. 처음부터 다시 시도해 주세요.' })
        return
      }

      try {
        const created = await createTrip(payload)
        if (guestTripCancelledRef.current) return
        const rawId = created?.id ?? created?.tripId
        const realId = rawId != null ? String(rawId) : null
        if (!realId) return

        const selectedItems = pending.selectedItems ?? []
        clearPendingGuestSearch()
        saveActiveTripId(realId)

        if (selectedItems.length > 0) {
          const upsertPayload = selectedItems
            .filter((i) => i.title)
            .map((item, idx) => ({
              title: item.title,
              ...(item.description ? { description: item.description } : {}),
              categoryCode: item.subCategory || 'ai_recommend',
              prepType: item.prepType || 'item',
              baggageType: item.baggageType || 'none',
              source: item.source || 'template',
              orderIndex: idx,
            }))
          if (upsertPayload.length > 0) {
            await upsertChecklistItems(realId, upsertPayload).catch((err) => {
              console.error('[TripSearchPage] upsertChecklistItems 실패:', err)
            })
          }

          const dest = plan?.destination
          const ts = plan?.tripStartDate
          const te = plan?.tripEndDate
          const fromDestination = Boolean(dest && ts && te)
          const snapshot = {
            pageTitle: fromDestination ? `${dest.country} · ${dest.city} 여행 준비` : TRIP_SEARCH_CONTEXT.title,
            pageSubtitle: '',
            destination: fromDestination ? dest.city : TRIP_SEARCH_CONTEXT.destination,
            country: fromDestination ? dest.country : TRIP_SEARCH_CONTEXT.country,
            tripWindowLabel: fromDestination ? buildTripWindowLabelFromRange(ts, te) : TRIP_SEARCH_CONTEXT.tripWindowLabel,
            tripStartDate: fromDestination ? ts : '',
            tripEndDate: fromDestination ? te : '',
            countryCode: fromDestination ? dest.countryCode : '',
            iata: fromDestination ? dest.iata : '',
            weatherSummary: TRIP_SEARCH_CONTEXT.weatherSummary,
            temperatureRange: TRIP_SEARCH_CONTEXT.temperatureRange,
            rainChance: TRIP_SEARCH_CONTEXT.rainChance,
            environmentTags: TRIP_SEARCH_CONTEXT.environmentTags.map((t) => ({ ...t })),
            phaseHints: TRIP_SEARCH_CONTEXT.phaseHints.map((p) => ({ ...p })),
            items: selectedItems.map(mapMockItemToArchiveItem),
            dailySummaries: [],
            dailyGuidesFull: [],
          }
          const archiveCreated = await createGuideArchive(realId, {
            name: snapshot.pageTitle,
            snapshot,
          })
          if (guestTripCancelledRef.current) return
          if (archiveCreated?.id) {
            sessionStorage.setItem('lastSavedArchiveId', String(archiveCreated.id))
          }
          navigate('/guide-archives', { replace: true })
          return
        }

        navigate(`/trips/${realId}/search`, { replace: true })
      } catch (err) {
        if (guestTripCancelledRef.current) return
        setLoadState({
          status: 'fallback',
          fromApi: false,
          errorMessage: err?.response?.data?.message || err?.message || '여행 계획 저장에 실패했습니다. 다시 시도해 주세요.',
        })
      }
    })()
    return () => { guestTripCancelledRef.current = true }
  }, [tripId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = Date.now()
    searchStartRef.current = t
    trackEvent('search_start', {
      trip_id: tripId,
      timestamp: t,
      merge_to_archive: mergeToArchive,
      archive_entry_id: archiveEntryId ?? undefined,
    })
  }, [tripId, mergeToArchive, archiveEntryId])

  useEffect(() => {
    let cancelled = false
    setLoadState({ status: 'loading', fromApi: false })

    const applyAdapted = (data, via) => {
      if (cancelled) return
      const adapted = adaptGeneratedChecklist(data)
      setApiItems(adapted.items)
      setApiSummary(adapted.summary)
      setLoadState({ status: 'ready', fromApi: true, via })
      trackEvent('search_items_loaded', {
        trip_id: tripId,
        via,
        total: adapted.items.length,
        from_template: adapted.summary?.fromTemplate ?? 0,
        from_llm: adapted.summary?.fromLlm ?? 0,
        llm_tokens: adapted.summary?.llmTokensUsed ?? 0,
        model: adapted.summary?.model ?? null,
      })
    }

    const applyFallback = (errorMessage) => {
      if (cancelled) return
      setApiItems([])
      setApiSummary(null)
      setLoadState({ status: 'fallback', fromApi: false, errorMessage: errorMessage || '알 수 없는 오류' })
    }

    ;(async () => {
      const plan = loadActiveTripPlan()
      const contextInput = buildContextInputFromPlan(plan)

      // guest 모드: 서버 API 없이 로컬 플랜으로 context 생성 경로 직행
      if (tripId === 'guest') {
        if (contextInput) {
          try {
            const data = await generateChecklistFromContext(contextInput)
            applyAdapted(data, 'context')
          } catch (err) {
            if (cancelled) return
            console.warn('[TripSearchPage] guest generateFromContext 실패:', err?.message ?? err)
            applyFallback(err?.response?.data?.message || err?.message)
          }
        } else {
          applyFallback('여행 정보가 없습니다. 처음부터 다시 시작해 주세요.')
        }
        return
      }

      try {
        const cachedData = await listChecklistCandidates(tripId)
        if (cachedData?.items?.length > 0) {
          applyAdapted(cachedData, 'db-cached')
          return
        }
        // items 없는 빈 Checklist(lazy 생성 잔재) → generate 경로로 fall-through
      } catch (candidateErr) {
        if (candidateErr?.response?.status !== 404) {
          console.warn('[TripSearchPage] listCandidates 실패, generate로 폴백:', candidateErr?.message ?? candidateErr)
        }
      }

      try {
        const data = await generateChecklist(tripId)
        applyAdapted(data, 'trip')
        return
      } catch (err1) {
        const status = err1?.response?.status
        if (cancelled) return
        if (status === 404 || status === 400) {
          if (contextInput) {
            try {
              const data2 = await generateChecklistFromContext(contextInput)
              applyAdapted(data2, 'context')
              return
            } catch (err2) {
              if (cancelled) return
              console.warn('[TripSearchPage] generateFromContext 실패, 목데이터로 폴백:', err2?.message ?? err2)
            }
          } else {
            console.warn('[TripSearchPage] trip 없음 + 로컬 플랜도 없어 context 재시도 불가 — 목데이터 폴백')
          }
        } else {
          console.warn('[TripSearchPage] generateChecklist 실패, 목데이터로 폴백:', err1?.message ?? err1)
        }
        applyFallback(err1?.response?.data?.message || err1?.message)
      }
    })()

    return () => { cancelled = true }
  }, [tripId, retryTick])

  const sourceItemsRaw = loadState.fromApi ? apiItems : []
  const sourceItems = useMemo(() => sourceItemsRaw.map(normalizeItemCategory), [sourceItemsRaw])
  const tabCategories = useMemo(
    () => (loadState.fromApi ? getTabCategories() : CATEGORIES).filter((c) => c.value !== 'ai_recommend'),
    [loadState.fromApi],
  )

  useEffect(() => {
    if (!tabCategories.some((c) => c.value === selectedCategory)) {
      setSelectedCategory('all')
    }
  }, [tabCategories, selectedCategory])

  const groupedItemsByCategory = useMemo(() => buildSubcategoryGroups(sourceItems), [sourceItems])

  const singleCategoryItems = useMemo(() => {
    if (selectedCategory === 'all') return []
    return sourceItems.filter((i) => i.category === selectedCategory).sort(sortItemsForDisplay)
  }, [selectedCategory, sourceItems])

  const selectableItemsInView = useMemo(() => {
    const list = selectedCategory === 'all' ? sourceItems : singleCategoryItems
    return list.filter((i) => !existingArchiveItemIds.has(String(i.id)))
  }, [selectedCategory, singleCategoryItems, sourceItems, existingArchiveItemIds])

  const allSelectableInViewSelected = useMemo(() => {
    if (selectableItemsInView.length === 0) return false
    return selectableItemsInView.every((i) => selectedForSave.has(String(i.id)))
  }, [selectableItemsInView, selectedForSave])

  const selectionProgressPercent = useMemo(() => {
    if (sourceItems.length === 0) return 0
    return Math.min(100, Math.round((selectedForSave.size / sourceItems.length) * 100))
  }, [selectedForSave.size, sourceItems.length])

  const totalItemCount = sourceItems.length
  const aiRecommendCount = sourceItemsRaw.filter(
    (i) => i.category === 'ai_recommend' || i.prepType === 'ai_recommend' || i.source === 'llm',
  ).length
  const visibleItemCount = selectedCategory === 'all' ? sourceItems.length : singleCategoryItems.length

  const headerDateLine =
    mergeToArchive && archiveEntry
      ? buildGuideArchiveDateLine(archiveEntry)
      : tripDateLabel || ''
  const headerDescription =
    mergeToArchive && archiveEntry
      ? `「${buildGuideArchiveListTitle(archiveEntry)}」에 담을 준비물을 고르세요.`
      : '맞춤 준비 항목을 확인하고 나의 체크리스트에 담아보세요!'
  const pageBackgroundStyle = mergeToArchive
    ? TRIP_SEARCH_MERGE_PAGE_BACKGROUND_STYLE
    : TRIP_MINT_PAGE_BACKGROUND_STYLE

  const handleCategoryChange = (category) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      trackEvent('research_trigger', { trip_id: tripId, from_category: selectedCategory, to_category: category })
    }
    setSelectedCategory(category)
  }

  const toggleItemSelect = (item) => {
    const id = String(item.id)
    if (existingArchiveItemIds.has(id)) return
    setSelectedForSave((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    trackEvent('search_item_toggle_select', {
      trip_id: tripId,
      item_id: item.id,
      item_category: item.category,
      selected_after: !selectedForSave.has(id),
    })
  }

  const handleSelectAllInView = () => {
    if (selectableItemsInView.length === 0) return
    if (allSelectableInViewSelected) {
      setSelectedForSave((prev) => {
        const next = new Set(prev)
        for (const item of selectableItemsInView) next.delete(String(item.id))
        return next
      })
      trackEvent('search_deselect_all_in_view', {
        trip_id: tripId, category: selectedCategory, removed_count: selectableItemsInView.length, merge_to_archive: mergeToArchive,
      })
      return
    }
    setSelectedForSave((prev) => {
      const next = new Set(prev)
      for (const item of selectableItemsInView) next.add(String(item.id))
      return next
    })
    trackEvent('search_select_all_in_view', {
      trip_id: tripId, category: selectedCategory, added_count: selectableItemsInView.filter((i) => !selectedForSave.has(String(i.id))).length, merge_to_archive: mergeToArchive,
    })
  }

  const handleToggleSelectAllInGroup = (group) => {
    const selectable = group.items.filter((i) => !existingArchiveItemIds.has(String(i.id)))
    if (selectable.length === 0) return
    const allOn = selectable.every((i) => selectedForSave.has(String(i.id)))
    setSelectedForSave((prev) => {
      const next = new Set(prev)
      if (allOn) {
        for (const item of selectable) next.delete(String(item.id))
      } else {
        for (const item of selectable) next.add(String(item.id))
      }
      return next
    })
    trackEvent(allOn ? 'search_deselect_all_in_group' : 'search_select_all_in_group', {
      trip_id: tripId, group_category: group.categoryValue, item_count: selectable.length, merge_to_archive: mergeToArchive,
    })
  }

  const markItemsSelectedOnServer = (items) => {
    const payload = items
      .filter((i) => i.title)
      .map((item, idx) => ({
        title: item.title,
        ...(item.description ? { description: item.description } : {}),
        categoryCode: item.subCategory || 'ai_recommend',
        prepType: item.prepType || 'item',
        baggageType: item.baggageType || 'none',
        source: item.source || 'template',
        orderIndex: idx,
      }))
    if (payload.length === 0) return
    upsertChecklistItems(tripId, payload).catch((err) => {
      console.warn(
        '[TripSearchPage] upsertChecklistItems 실패 — localStorage 저장은 완료:',
        err?.response?.data?.message || err?.message || err,
      )
    })
  }

  const closeSaveConfirmModal = () => {
    if (saving) return
    setSaveConfirmModalOpen(false)
    setSaveError('')
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
        const existing = archiveEntry.items ?? []
        const existingIds = new Set(existing.map((i) => String(i.id)))
        const selectedSources = itemsToSave.filter((i) => !existingIds.has(String(i.id)))
        const additions = selectedSources.map(mapMockItemToArchiveItem)
        if (additions.length === 0) {
          setSaveConfirmModalOpen(false)
          setSaving(false)
          return
        }

        markItemsSelectedOnServer(selectedSources)

        // archiveEntry 의 server snapshot 을 통째로 보내야 백엔드가 다른 필드를 보존 (snapshot 은 PUT 의미).
        const baseSnap = Object.fromEntries(
          Object.entries(archiveEntry).filter(
            ([k]) => !['id', 'serverId', 'archivedAt', 'updatedAt'].includes(k),
          ),
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
        navigate('/guide-archives')
        return
      }

      // 비-merge: 새 entry 생성 전, server 에서 동일 id 집합 archive 가 있는지 검사.
      const selectedIdSet = new Set(itemsToSave.map((i) => String(i.id)))
      const existingArchives = await fetchTripGuideArchives(tripId)
      const duplicateEntry = existingArchives.find((archive) => {
        const archiveIds = new Set((archive.items ?? []).map((i) => String(i.id)))
        return (
          archiveIds.size === selectedIdSet.size &&
          [...selectedIdSet].every((id) => archiveIds.has(id))
        )
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
      const dest = plan?.destination
      const ts = plan?.tripStartDate
      const te = plan?.tripEndDate
      const fromDestination = Boolean(dest && ts && te)

      const snapshot = {
        pageTitle: fromDestination ? `${dest.country} · ${dest.city} 여행 준비` : TRIP_SEARCH_CONTEXT.title,
        pageSubtitle: '',
        destination: fromDestination ? dest.city : TRIP_SEARCH_CONTEXT.destination,
        country: fromDestination ? dest.country : TRIP_SEARCH_CONTEXT.country,
        tripWindowLabel: fromDestination ? buildTripWindowLabelFromRange(ts, te) : TRIP_SEARCH_CONTEXT.tripWindowLabel,
        tripStartDate: fromDestination ? ts : '',
        tripEndDate: fromDestination ? te : '',
        countryCode: fromDestination ? dest.countryCode : '',
        iata: fromDestination ? dest.iata : '',
        weatherSummary: TRIP_SEARCH_CONTEXT.weatherSummary,
        temperatureRange: TRIP_SEARCH_CONTEXT.temperatureRange,
        rainChance: TRIP_SEARCH_CONTEXT.rainChance,
        environmentTags: TRIP_SEARCH_CONTEXT.environmentTags.map((t) => ({ ...t })),
        phaseHints: TRIP_SEARCH_CONTEXT.phaseHints.map((p) => ({ ...p })),
        items: itemsToSave.map(mapMockItemToArchiveItem),
        dailySummaries: [],
        dailyGuidesFull: [],
      }
      const created = await createGuideArchive(tripId, {
        name: snapshot.pageTitle,
        snapshot,
      })

      // server 가 부여한 id 로 entry 체크 상태(localStorage 별도 파일) 시드.
      if (created?.id) {
        const checksInit = Object.fromEntries(
          (snapshot.items ?? []).map((it) => [String(it.id), false]),
        )
        saveEntryChecklistChecks(tripId, created.id, checksInit)
      }

      trackEvent('save_confirm_navigate_guide_archive', { trip_id: tripId, item_count: itemsToSave.length })
      setSaving(false)
      setSaveConfirmModalOpen(false)
      if (created?.id) sessionStorage.setItem('lastSavedArchiveId', String(created.id))
      navigate('/guide-archives')
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      setSaveError(msg)
      setSaving(false)
      if (import.meta.env.DEV) {
        console.warn('[TripSearchPage] save 실패', err)
      }
    }
  }

  const handleSaveButtonClick = async () => {
    if (selectedForSave.size === 0) return
    // guest 모드: 세션 체크 없이 무조건 로그인 유도
    if (tripId === 'guest') {
      setLoginGateOpen(true)
      return
    }
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

  const handleLeaveWithoutSave = () => {
    setLeaveModalOpen(false)
    if (mergeToArchive && archiveEntryId) {
      navigate('/guide-archives')
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={pageBackgroundStyle}>
      <div className="mx-auto flex w-full max-w-7xl items-center px-3 pt-4 md:px-6 md:pt-8 lg:px-8">
        {mergeToArchive ? (
          <button
            type="button"
            onClick={() => navigate(`/trips/${tripId}/guide-archive`)}
            className="text-sm font-medium text-teal-700 hover:text-teal-900"
          >
            ← 나의 체크리스트로
          </button>
        ) : (
          <Link to="/" className="text-sm font-medium text-teal-700 hover:text-teal-900">
            ← 내 여행으로
          </Link>
        )}
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 pb-36 pt-5 md:px-6 md:pb-28 md:pt-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <TripSearchPageHeader
            mergeToArchive={mergeToArchive}
            pageMainTitle={pageMainTitle}
            headerDateLine={headerDateLine}
            companions={tripCompanions}
            travelStyles={tripStyles}
            headerDescription={headerDescription}
            archiveTargetMissing={archiveTargetMissing}
            loadState={loadState}
            apiSummary={apiSummary}
            aiRecommendCount={aiRecommendCount}
            totalItemCount={totalItemCount}
          />

          {loadState.status === 'loading' ? (
            <div className="mt-6 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : loadState.status === 'fallback' ? (
            <div className="mt-6 rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
              <p className="mb-2 text-sm font-semibold text-red-500">체크리스트를 불러오지 못했습니다.</p>
              {loadState.errorMessage ? (
                <p className="mb-6 text-xs text-gray-500">{loadState.errorMessage}</p>
              ) : null}
              <button
                type="button"
                onClick={() => setRetryTick((n) => n + 1)}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-teal-800"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  <span>
                    {mergeToArchive ? '추가 선택' : '선택한 항목'}{' '}
                    <span className="tabular-nums text-slate-800">{selectedForSave.size}</span>
                    {' / '}
                    <span className="tabular-nums text-slate-800">{totalItemCount}</span>
                  </span>
                  <span className="tabular-nums text-slate-800">{selectionProgressPercent}%</span>
                </div>
                <GuideArchiveProgressBar value={selectionProgressPercent} />
              </div>

              <TripSearchCategoryFilter
                categoryCardHeading={categoryCardHeading}
                tabCategories={tabCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />

              <div className="mb-[14px] flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-2">
                <p className="min-w-0 flex-1 text-base font-extrabold text-gray-700 md:text-lg">
                  <span className="text-slate-700">
                    {selectedCategory === 'all'
                      ? '전체 유형'
                      : tabCategories.find((c) => c.value === selectedCategory)?.label}
                  </span>
                  <span className="ml-1.5 tabular-nums text-gray-900">{visibleItemCount}</span>개
                </p>
                <button
                  type="button"
                  onClick={handleSelectAllInView}
                  disabled={selectableItemsInView.length === 0}
                  className="shrink-0 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-bold text-sky-800 shadow-sm transition-colors hover:bg-sky-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  {allSelectableInViewSelected ? '전체 해제' : '전체 선택'}
                  <span className="ml-1 font-semibold text-sky-600 tabular-nums">({selectableItemsInView.length})</span>
                </button>
              </div>

              <section aria-label="준비물 목록">
                <TripSearchItemsList
                  loadState={loadState}
                  selectedCategory={selectedCategory}
                  groupedItemsByCategory={groupedItemsByCategory}
                  singleCategoryItems={singleCategoryItems}
                  selectedForSave={selectedForSave}
                  existingArchiveItemIds={existingArchiveItemIds}
                  onToggleSelectAllInGroup={handleToggleSelectAllInGroup}
                  onToggleItem={toggleItemSelect}
                  tabCategories={tabCategories}
                />
              </section>
            </>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-16 left-0 right-0 z-40 bg-transparent py-3 transition-[bottom] duration-300 ease-out [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] md:bottom-0"
        style={!navBarVisible ? { bottom: 0 } : undefined}
      >
        <div className="mx-auto w-full max-w-7xl px-3 md:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-3xl gap-3">
            <button
              type="button"
              onClick={() => setLeaveModalOpen(true)}
              className="min-w-0 flex-1 basis-0 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
            >
              {mergeToArchive ? '뒤로가기' : '홈으로'}
            </button>
            <button
              type="button"
              onClick={handleSaveButtonClick}
              disabled={selectedForSave.size === 0}
              className="min-w-0 flex-1 basis-0 rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
            >
              {mergeToArchive ? '추가' : '저장'}
            </button>
          </div>
        </div>
      </div>

      <TripSearchSaveModal
        open={saveConfirmModalOpen}
        onConfirm={handleConfirmSaveAndGoArchive}
        onClose={closeSaveConfirmModal}
        mergeToArchive={mergeToArchive}
        saving={saving}
        error={saveError}
      />
      <TripSearchLeaveModal
        open={leaveModalOpen}
        onLeave={handleLeaveWithoutSave}
        onClose={() => setLeaveModalOpen(false)}
      />
      {loginGateOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center p-4"
              onClick={() => setLoginGateOpen(false)}
            >
              <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-[1] mx-4 w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="mb-1.5 text-center text-base font-semibold text-gray-900">
                  로그인이 필요한 서비스입니다
                </h2>
                <p className="mb-6 text-center text-sm text-gray-500">
                  로그인 후 체크리스트를 저장할 수 있어요
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:from-cyan-400 hover:to-teal-500"
                    onClick={handleLoginRedirect}
                  >
                    로그인 또는 회원가입 하러가기
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setLoginGateOpen(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function TripSearchPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const tripId = id ?? 'guest'
  return <TripSearchInner key={`${tripId}-${searchParams.toString()}`} tripId={tripId} />
}

export default TripSearchPage
