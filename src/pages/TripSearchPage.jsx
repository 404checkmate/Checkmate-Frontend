import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams, Link, useLocation } from 'react-router-dom'
import { useMobileScrollChromeVisibility } from '@/hooks/useMobileScrollChromeVisibility'
import { CATEGORIES, MOCK_ITEMS, TRIP_SEARCH_CONTEXT } from '@/mocks/searchData'
import {
  generateChecklist,
  generateChecklistFromContext,
  listChecklistCandidates,
  selectChecklistItem,
} from '@/api/checklists'
import { adaptGeneratedChecklist, getTabCategories } from '@/utils/checklistAdapter'
import { saveItemsForTrip, loadSavedItems } from '@/utils/savedTripItems'
import { buildTripWindowLabelFromRange } from '@/utils/tripDateFormat'
import { appendGuideArchiveEntry, getGuideArchiveEntry, loadGuideArchive, patchGuideArchiveEntry } from '@/utils/guideArchiveStorage'
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

/**
 * 새 여행 플로우(step5 → /trips/1/loading → /trips/1/search) 에서 쓰는 자리표시자 tripId.
 * 이 경우에는 DB 에 Trip 레코드가 아직 없으므로 `/checklists/generate/:tripId` 는 항상 404 가 된다.
 * 프론트에서 먼저 감지해 `generate-from-context` 로 바로 가면 백엔드 `Trip 1 not found` WARN 이 사라진다.
 */
const PLACEHOLDER_TRIP_ID = '1'

function TripSearchInner({ tripId }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navBarVisible = useMobileScrollChromeVisibility(true, pathname)
  const [searchParams] = useSearchParams()
  const archiveEntryIdRaw = searchParams.get('archiveEntry')
  const archiveEntryId =
    archiveEntryIdRaw && String(archiveEntryIdRaw).trim() ? String(archiveEntryIdRaw).trim() : null

  const archiveEntry = useMemo(
    () => (archiveEntryId ? getGuideArchiveEntry(tripId, archiveEntryId) : null),
    [tripId, archiveEntryId],
  )
  const mergeToArchive = Boolean(archiveEntryId && archiveEntry)
  const archiveTargetMissing = Boolean(archiveEntryId && !archiveEntry)

  const pageMainTitle = mergeToArchive ? '여행 필수품 추가' : TRIP_SEARCH_CONTEXT.title
  const categoryCardHeading = mergeToArchive ? '카테고리별 추가 선택' : '카테고리별 선택'
  const existingArchiveItemIds = useMemo(
    () => new Set((mergeToArchive ? archiveEntry.items ?? [] : []).map((i) => String(i.id))),
    [mergeToArchive, archiveEntry],
  )

  const searchStartRef = useRef(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [savedIds, setSavedIds] = useState(() => new Set(loadSavedItems(tripId).map((x) => String(x.id))))
  const [selectedForSave, setSelectedForSave] = useState(() => new Set())
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false)
  const [loadState, setLoadState] = useState({ status: 'loading', fromApi: false })
  const [apiItems, setApiItems] = useState([])
  const [apiSummary, setApiSummary] = useState(null)

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
      const isPlaceholderTrip = String(tripId) === PLACEHOLDER_TRIP_ID

      if (isPlaceholderTrip && contextInput) {
        try {
          const data = await generateChecklistFromContext(contextInput)
          applyAdapted(data, 'context')
          return
        } catch (err) {
          if (cancelled) return
          console.warn('[TripSearchPage] generateFromContext (fast path) 실패, 목데이터로 폴백:', err?.message ?? err)
          applyFallback(err?.response?.data?.message || err?.message)
          return
        }
      }

      try {
        const cachedData = await listChecklistCandidates(tripId)
        applyAdapted(cachedData, 'db-cached')
        return
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
  }, [tripId])

  const sourceItemsRaw = loadState.fromApi ? apiItems : MOCK_ITEMS
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
      : TRIP_SEARCH_CONTEXT.tripWindowLabel
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
    const ids = items.map((i) => i.serverId).filter((id) => id && String(id).trim())
    if (ids.length === 0) return
    ids.forEach((serverId) => {
      selectChecklistItem(serverId).catch((err) => {
        console.warn(
          `[TripSearchPage] selectChecklistItem(${serverId}) 실패 — localStorage 저장은 완료:`,
          err?.response?.data?.message || err?.message || err,
        )
      })
    })
  }

  const closeSaveConfirmModal = () => setSaveConfirmModalOpen(false)

  const handleConfirmSaveAndGoArchive = () => {
    const itemsToSave = sourceItems.filter((i) => selectedForSave.has(String(i.id)))
    if (itemsToSave.length === 0) { closeSaveConfirmModal(); return }

    if (mergeToArchive) {
      const existing = archiveEntry.items ?? []
      const existingIds = new Set(existing.map((i) => String(i.id)))
      const selectedSources = itemsToSave.filter((i) => !existingIds.has(String(i.id)))
      const additions = selectedSources.map(mapMockItemToArchiveItem)
      if (additions.length === 0) { closeSaveConfirmModal(); return }

      markItemsSelectedOnServer(selectedSources)
      patchGuideArchiveEntry(tripId, archiveEntryId, { items: [...existing, ...additions] })

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
      closeSaveConfirmModal()
      setSelectedForSave(new Set())
      navigate(`/trips/${tripId}/guide-archive/${archiveEntryId}`)
      return
    }

    const selectedIdSet = new Set(itemsToSave.map((i) => String(i.id)))
    const isDuplicateEntry = loadGuideArchive(tripId).some((archive) => {
      const archiveIds = new Set((archive.items ?? []).map((i) => String(i.id)))
      return (
        archiveIds.size === selectedIdSet.size &&
        [...selectedIdSet].every((id) => archiveIds.has(id))
      )
    })
    if (isDuplicateEntry) {
      closeSaveConfirmModal()
      navigate(`/trips/${tripId}/guide-archive`)
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

    const nextArchiveList = appendGuideArchiveEntry(tripId, {
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
    })
    const newArchiveEntry = nextArchiveList[0]
    if (newArchiveEntry?.id) {
      const checksInit = Object.fromEntries((newArchiveEntry.items ?? []).map((it) => [String(it.id), false]))
      saveEntryChecklistChecks(tripId, newArchiveEntry.id, checksInit)
    }

    trackEvent('save_confirm_navigate_guide_archive', { trip_id: tripId, item_count: itemsToSave.length })
    closeSaveConfirmModal()
    navigate(`/trips/${tripId}/guide-archive`)
  }

  const handleLeaveWithoutSave = () => {
    setLeaveModalOpen(false)
    if (mergeToArchive && archiveEntryId) {
      navigate(`/trips/${tripId}/guide-archive/${archiveEntryId}`)
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
            headerDescription={headerDescription}
            archiveTargetMissing={archiveTargetMissing}
            loadState={loadState}
            apiSummary={apiSummary}
            aiRecommendCount={aiRecommendCount}
            totalItemCount={totalItemCount}
          />

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

          <div className="mb-6 flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-3">
            <p className="min-w-0 flex-1 text-sm font-semibold text-gray-700 md:text-base">
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
              onClick={() => { if (selectedForSave.size > 0) setSaveConfirmModalOpen(true) }}
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
      />
      <TripSearchLeaveModal
        open={leaveModalOpen}
        onLeave={handleLeaveWithoutSave}
        onClose={() => setLeaveModalOpen(false)}
      />
    </div>
  )
}

function TripSearchPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  return <TripSearchInner key={`${id}-${searchParams.toString()}`} tripId={id} />
}

export default TripSearchPage
