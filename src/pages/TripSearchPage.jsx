import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { CATEGORIES, MOCK_ITEMS, TRIP_SEARCH_CONTEXT } from '@/mocks/searchData'
import { saveItemForTrip, loadSavedItems } from '@/utils/savedTripItems'
import { buildTripWindowLabelFromRange } from '@/utils/tripDateFormat'
import { appendGuideArchiveEntry, getGuideArchiveEntry, patchGuideArchiveEntry } from '@/utils/guideArchiveStorage'
import { loadEntryChecklistChecks, saveEntryChecklistChecks } from '@/utils/guideArchiveEntryChecklistStorage'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { buildGuideArchiveDateLine, buildGuideArchiveListTitle } from '@/utils/guideArchivePresentation'
import {
  TRIP_MINT_PAGE_BACKGROUND_STYLE,
  TRIP_SEARCH_MERGE_PAGE_BACKGROUND_STYLE,
} from '@/utils/tripMintPageBackground'
import GuideArchiveProgressBar from '@/components/guide/GuideArchiveProgressBar'
import {
  BAGGAGE_CARRY_ON,
  BAGGAGE_CHECKED,
  BAGGAGE_SECTION_LABEL,
  resolveBaggageSection,
} from '@/utils/guideArchiveBaggage'
import aiSparklesImg from '@/assets/ai-sparkles.png'

/** 수하물 필터 — 전체: 기내+위탁 모두 */
const BAGGAGE_FILTER_ALL = 'all'

const SEARCH_BAGGAGE_TABS = [
  { value: BAGGAGE_FILTER_ALL, label: '전체' },
  { value: BAGGAGE_CARRY_ON, label: BAGGAGE_SECTION_LABEL[BAGGAGE_CARRY_ON] },
  { value: BAGGAGE_CHECKED, label: BAGGAGE_SECTION_LABEL[BAGGAGE_CHECKED] },
]

/** 현재 풀 안에서 항목 유형(AI·준비물…)별 그룹 — 보관함 상세와 같이 수하물 블록 안에서 재사용 */
function buildSubcategoryGroups(itemsPool) {
  const order = CATEGORIES.filter((c) => c.value !== 'all').map((c) => c.value)
  const sectionOrder = ['ai_recommend', ...order.filter((v) => v !== 'ai_recommend')]
  return sectionOrder
    .map((value) => {
      const cat = CATEGORIES.find((c) => c.value === value)
      if (!cat) return null
      const items = itemsPool
        .filter((i) => i.category === value)
        .sort((a, b) => a.title.localeCompare(b.title, 'ko'))
      return { categoryValue: value, categoryLabel: cat.label, items }
    })
    .filter((g) => g && g.items.length > 0)
}

const trackEvent = (eventName, properties = {}) => {
  console.debug('[Event]', eventName, properties)
}

/** 가이드 보관함 entry.items에 넣는 형태로 변환 */
function mapMockItemToArchiveItem(i) {
  return {
    id: i.id,
    baggageType: i.baggageType,
    category: i.category,
    categoryLabel: i.categoryLabel,
    title: i.title,
    description: i.description,
    detail: i.detail,
  }
}

/** PNG를 마스크로 써서 버튼·섹션 제목에 맞는 단색으로 표시 (AI 탭은 보라 톤) */
function AiSparkleMaskIcon({ selected, className = 'h-3.5 w-3.5' }) {
  const mask = {
    maskImage: `url(${aiSparklesImg})`,
    WebkitMaskImage: `url(${aiSparklesImg})`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
  }
  return (
    <span
      className={`inline-block shrink-0 ${className} ${selected ? 'bg-white' : 'bg-violet-700'}`}
      style={mask}
      aria-hidden
    />
  )
}

function TripSearchInner({ tripId }) {
  const navigate = useNavigate()
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

  /** 병합 모드: 보관함에서 연 “여행 필수품 추가” 화면 전용 카피 */
  const pageMainTitle = mergeToArchive ? '여행 필수품 추가' : TRIP_SEARCH_CONTEXT.title
  /** 보관함 상세 「카테고리별 선택」 카드 제목과 동일 톤 — 병합 모드만 문구 구분 */
  const categoryCardHeading = mergeToArchive ? '카테고리별 추가 선택' : '카테고리별 선택'
  const existingArchiveItemIds = useMemo(
    () => new Set((mergeToArchive ? archiveEntry.items ?? [] : []).map((i) => String(i.id))),
    [mergeToArchive, archiveEntry],
  )

  const searchStartRef = useRef(0)
  /** 기내 반입 / 위탁 수하물 — 보관함 상세 수하물 구간과 동일 개념 */
  const [selectedBaggage, setSelectedBaggage] = useState(BAGGAGE_CARRY_ON)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [savedIds, setSavedIds] = useState(() => new Set(loadSavedItems(tripId).map((x) => String(x.id))))
  /** 체크리스트에 넣을 항목 선택 (id 문자열) */
  const [selectedForSave, setSelectedForSave] = useState(() => new Set())
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false)

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

  const handleBaggageChange = (baggage) => {
    if (baggage !== selectedBaggage) {
      trackEvent('search_baggage_change', {
        trip_id: tripId,
        from_baggage: selectedBaggage,
        to_baggage: baggage,
      })
    }
    setSelectedBaggage(baggage)
    setSelectedCategory('all')
  }

  const handleCategoryChange = (category) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      trackEvent('research_trigger', {
        trip_id: tripId,
        baggage: selectedBaggage,
        from_category: selectedCategory,
        to_category: category,
      })
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

  const openSaveConfirmModal = () => {
    if (selectedForSave.size === 0) return
    setSaveConfirmModalOpen(true)
  }

  const closeSaveConfirmModal = () => setSaveConfirmModalOpen(false)

  /** 확인 모달에서만 실행: 체크리스트 저장 + 가이드 보관함 스냅샷 후 이동 (또는 기존 엔트리에 항목 병합) */
  const handleConfirmSaveAndGoArchive = () => {
    const itemsToSave = MOCK_ITEMS.filter((i) => selectedForSave.has(String(i.id)))
    if (itemsToSave.length === 0) {
      closeSaveConfirmModal()
      return
    }

    if (mergeToArchive) {
      const existing = archiveEntry.items ?? []
      const existingIds = new Set(existing.map((i) => String(i.id)))
      const additions = itemsToSave.filter((i) => !existingIds.has(String(i.id))).map(mapMockItemToArchiveItem)
      if (additions.length === 0) {
        closeSaveConfirmModal()
        return
      }
      const merged = [...existing, ...additions]
      patchGuideArchiveEntry(tripId, archiveEntryId, { items: merged })

      const prevChecks = loadEntryChecklistChecks(tripId, archiveEntryId)
      const mergedChecks = { ...prevChecks }
      for (const it of additions) {
        mergedChecks[String(it.id)] = false
      }
      saveEntryChecklistChecks(tripId, archiveEntryId, mergedChecks)

      additions.forEach((item) => {
        if (savedIds.has(String(item.id))) return
        saveItemForTrip(tripId, {
          id: item.id,
          category: item.category,
          title: item.title,
          subtitle: item.detail || item.description || '',
        })
        trackEvent('save_complete', {
          trip_id: tripId,
          item_id: item.id,
          item_category: item.category,
          mode: 'guide_archive_merge',
          archive_entry_id: archiveEntryId,
          elapsed_ms: searchStartRef.current ? Date.now() - searchStartRef.current : null,
        })
      })

      setSavedIds((prev) => {
        const next = new Set(prev)
        additions.forEach((i) => next.add(String(i.id)))
        return next
      })

      trackEvent('save_confirm_navigate_guide_archive_merge', {
        trip_id: tripId,
        archive_entry_id: archiveEntryId,
        added_count: additions.length,
      })

      window.dispatchEvent(
        new CustomEvent('guide-archive-checklist-saved', {
          detail: { tripId: String(tripId), entryId: String(archiveEntryId), progress: undefined },
        }),
      )

      closeSaveConfirmModal()
      setSelectedForSave(new Set())
      navigate(`/trips/${tripId}/guide-archive/${archiveEntryId}`)
      return
    }

    itemsToSave.forEach((item) => {
      if (savedIds.has(String(item.id))) return
      saveItemForTrip(tripId, {
        id: item.id,
        category: item.category,
        title: item.title,
        subtitle: item.detail || item.description || '',
      })
      trackEvent('save_complete', {
        trip_id: tripId,
        item_id: item.id,
        item_category: item.category,
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
      pageTitle: fromDestination
        ? `${dest.country} · ${dest.city} 여행 준비`
        : TRIP_SEARCH_CONTEXT.title,
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
      items: itemsToSave.map((i) => ({
        id: i.id,
        baggageType: i.baggageType,
        category: i.category,
        categoryLabel: i.categoryLabel,
        title: i.title,
        description: i.description,
        detail: i.detail,
      })),
      dailySummaries: [],
      dailyGuidesFull: [],
    })
    const newArchiveEntry = nextArchiveList[0]
    if (newArchiveEntry?.id) {
      const checksInit = Object.fromEntries((newArchiveEntry.items ?? []).map((it) => [String(it.id), false]))
      saveEntryChecklistChecks(tripId, newArchiveEntry.id, checksInit)
    }

    trackEvent('save_confirm_navigate_guide_archive', {
      trip_id: tripId,
      item_count: itemsToSave.length,
    })

    closeSaveConfirmModal()
    navigate(`/trips/${tripId}/guide-archive`)
  }

  const openHomeConfirmModal = () => setLeaveModalOpen(true)

  const handleLeaveWithoutSave = () => {
    setLeaveModalOpen(false)
    if (mergeToArchive && archiveEntryId) {
      navigate(`/trips/${tripId}/guide-archive/${archiveEntryId}`)
      return
    }
    navigate('/')
  }

  const handleModalBack = () => setLeaveModalOpen(false)

  /** 선택한 수하물 구간(전체 | 기내 | 위탁)에 해당하는 목록만 */
  const baggageFilteredItems = useMemo(() => {
    if (selectedBaggage === BAGGAGE_FILTER_ALL) return MOCK_ITEMS
    return MOCK_ITEMS.filter((i) => resolveBaggageSection(i) === selectedBaggage)
  }, [selectedBaggage])

  /** 목록에 표시할 수하물 구간 순서(전체 필터면 기내 → 위탁, 아니면 선택 한 구간만) */
  const baggageSectionKeys = useMemo(() => {
    if (selectedBaggage === BAGGAGE_FILTER_ALL) return [BAGGAGE_CARRY_ON, BAGGAGE_CHECKED]
    return [selectedBaggage]
  }, [selectedBaggage])

  /** 수하물 구간별 → 항목 유형별 그룹(조회 리스트에서 기내/위탁이 항상 나뉨) */
  const groupedItemsByBaggage = useMemo(() => {
    return baggageSectionKeys
      .map((bagKey) => {
        const pool = baggageFilteredItems.filter((i) => resolveBaggageSection(i) === bagKey)
        const grouped = buildSubcategoryGroups(pool)
        return { bagKey, bagTitle: BAGGAGE_SECTION_LABEL[bagKey], grouped }
      })
      .filter((section) => section.grouped.length > 0)
  }, [baggageFilteredItems, baggageSectionKeys])

  /** 단일 서브 카테고리: 수하물 구간별 목록(기내 / 위탁 분리) */
  const singleCategoryBaggageSections = useMemo(() => {
    if (selectedCategory === 'all') return []
    return baggageSectionKeys
      .map((bagKey) => ({
        bagKey,
        bagTitle: BAGGAGE_SECTION_LABEL[bagKey],
        items: baggageFilteredItems
          .filter((i) => resolveBaggageSection(i) === bagKey && i.category === selectedCategory)
          .sort((a, b) => a.title.localeCompare(b.title, 'ko')),
      }))
      .filter((s) => s.items.length > 0)
  }, [selectedCategory, baggageFilteredItems, baggageSectionKeys])

  const sortedItemsSingleCategory = useMemo(() => {
    if (selectedCategory === 'all') return []
    return singleCategoryBaggageSections.flatMap((s) => s.items)
  }, [selectedCategory, singleCategoryBaggageSections])

  const visibleItemCount = selectedCategory === 'all' ? baggageFilteredItems.length : sortedItemsSingleCategory.length

  /** 현재 탭에서 선택 가능한 항목(이미 보관함에 있는 것 제외) */
  const selectableItemsInView = useMemo(() => {
    const list = selectedCategory === 'all' ? baggageFilteredItems : sortedItemsSingleCategory
    return list.filter((i) => !existingArchiveItemIds.has(String(i.id)))
  }, [selectedCategory, sortedItemsSingleCategory, baggageFilteredItems, existingArchiveItemIds])

  const allSelectableInViewSelected = useMemo(() => {
    if (selectableItemsInView.length === 0) return false
    return selectableItemsInView.every((i) => selectedForSave.has(String(i.id)))
  }, [selectableItemsInView, selectedForSave])

  const handleSelectAllInView = () => {
    if (selectableItemsInView.length === 0) return
    if (allSelectableInViewSelected) {
      setSelectedForSave((prev) => {
        const next = new Set(prev)
        for (const item of selectableItemsInView) {
          next.delete(String(item.id))
        }
        return next
      })
      trackEvent('search_deselect_all_in_view', {
        trip_id: tripId,
        baggage: selectedBaggage,
        category: selectedCategory,
        removed_count: selectableItemsInView.length,
        merge_to_archive: mergeToArchive,
      })
      return
    }
    setSelectedForSave((prev) => {
      const next = new Set(prev)
      for (const item of selectableItemsInView) {
        next.add(String(item.id))
      }
      return next
    })
    trackEvent('search_select_all_in_view', {
      trip_id: tripId,
      baggage: selectedBaggage,
      category: selectedCategory,
      added_count: selectableItemsInView.filter((i) => !selectedForSave.has(String(i.id))).length,
      merge_to_archive: mergeToArchive,
    })
  }

  /** 「전체」 탭 — 섹션(카테고리) 단위 전체 선택/해제 */
  const selectionProgressPercent = useMemo(() => {
    if (MOCK_ITEMS.length === 0) return 0
    return Math.min(100, Math.round((selectedForSave.size / MOCK_ITEMS.length) * 100))
  }, [selectedForSave.size])

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
      trip_id: tripId,
      baggage: selectedBaggage,
      group_category: group.categoryValue,
      item_count: selectable.length,
      merge_to_archive: mergeToArchive,
    })
  }

  const headerDateLine =
    mergeToArchive && archiveEntry
      ? buildGuideArchiveDateLine(archiveEntry)
      : TRIP_SEARCH_CONTEXT.tripWindowLabel

  const headerDescription =
    mergeToArchive && archiveEntry
      ? `「${buildGuideArchiveListTitle(archiveEntry)}」에 담을 준비물을 고르세요.`
      : '골라 저장한 체크리스트로 필수품을 빠짐없이 챙겨보세요!'

  const pageBackgroundStyle = mergeToArchive
    ? TRIP_SEARCH_MERGE_PAGE_BACKGROUND_STYLE
    : TRIP_MINT_PAGE_BACKGROUND_STYLE

  return (
    <div className="min-h-screen" style={pageBackgroundStyle}>
      <div className="mx-auto flex max-w-6xl items-center px-4 pt-4 md:pt-8">
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

      <div className="mx-auto max-w-3xl px-5 pb-36 pt-5 md:px-4 md:pb-28 md:pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-gray-900 md:text-3xl">
            {pageMainTitle}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-700 md:text-lg">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal-600 md:h-2.5 md:w-2.5"
              aria-hidden
            />
            {headerDateLine}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">{headerDescription}</p>
          {archiveTargetMissing ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              연결된 체크리스트를 찾을 수 없어 일반 검색으로 표시합니다. 보관함에서 다시 들어와 주세요.
            </p>
          ) : null}
        </header>

        <div className="sticky top-0 z-20 -mx-5 mb-6 border-b border-slate-100/90 bg-white px-5 py-3 backdrop-blur-sm md:static md:mx-0 md:rounded-xl md:border md:border-slate-100 md:bg-white md:px-5 md:py-4 md:shadow-sm">
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
            <span>
              {mergeToArchive ? '추가 선택' : '담기 선택'}{' '}
              <span className="tabular-nums text-slate-800">{selectedForSave.size}</span>
              {' / '}
              <span className="tabular-nums text-slate-800">{MOCK_ITEMS.length}</span>
            </span>
            <span className="tabular-nums text-slate-800">{selectionProgressPercent}%</span>
          </div>
          <GuideArchiveProgressBar value={selectionProgressPercent} />
        </div>

        <section
          className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-5"
          aria-label="카테고리 필터"
        >
          <h2 className="mb-3.5 text-lg font-extrabold tracking-tight text-gray-900">{categoryCardHeading}</h2>

          <p id="search-baggage-label" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            수하물 구간
          </p>
          <div
            className="mb-5 flex gap-2 overflow-x-auto pb-0.5 scrollbar-thin"
            role="tablist"
            aria-labelledby="search-baggage-label"
          >
            {SEARCH_BAGGAGE_TABS.map((tab) => {
              const selected = selectedBaggage === tab.value
              const tabClass = selected
                ? 'border-2 border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-900/15'
                : 'border-2 border-teal-100 bg-teal-50/80 text-teal-900 shadow-sm hover:border-teal-300 hover:bg-teal-100/80'
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleBaggageChange(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${tabClass}`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <p id="search-subcategory-label" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            항목 유형
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-thin"
            role="tablist"
            aria-labelledby="search-subcategory-label"
          >
            {CATEGORIES.map((cat) => {
              const isAi = cat.value === 'ai_recommend'
              const selected = selectedCategory === cat.value
              const tabClass = isAi
                ? selected
                  ? 'border-2 border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-900/20'
                  : 'border-2 border-violet-200 bg-violet-50/95 text-violet-900 shadow-sm hover:border-violet-300 hover:bg-violet-100/90'
                : selected
                  ? 'border-2 border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-900/15'
                  : 'border-2 border-sky-100 bg-slate-50/80 text-slate-600 shadow-sm hover:border-sky-200 hover:bg-sky-50'
              return (
                <button
                  key={cat.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tabClass}`}
                >
                  {isAi ? <AiSparkleMaskIcon selected={selected} className="h-3.5 w-3.5" /> : null}
                  {cat.label}
                </button>
              )
            })}
          </div>
        </section>

        <div className="mb-6 flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-3">
          <p className="min-w-0 flex-1 text-sm font-semibold text-gray-700 md:text-base">
            <span className="text-teal-900">
              {selectedBaggage === BAGGAGE_FILTER_ALL ? '전체 구간' : BAGGAGE_SECTION_LABEL[selectedBaggage]}
            </span>
            <span className="mx-1.5 text-gray-400" aria-hidden>
              ·
            </span>
            <span className="text-slate-700">
              {selectedCategory === 'all' ? '전체 유형' : CATEGORIES.find((c) => c.value === selectedCategory)?.label}
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
          {selectedCategory === 'all' ? (
            <div className="space-y-10">
              {groupedItemsByBaggage.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
                  이 수하물 구간에 표시할 항목이 없습니다.
                </div>
              ) : null}
              {groupedItemsByBaggage.map(({ bagKey, bagTitle, grouped }) => (
                <div key={bagKey} className="space-y-6">
                  <div className="flex flex-col gap-2 border-b border-teal-100/90 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <h2 className="text-base font-extrabold tracking-tight text-[#0a3d3d]">{bagTitle}</h2>
                  </div>
                  <div className="space-y-8">
                    {grouped.map((group) => {
                      const selectableInGroup = group.items.filter(
                        (i) => !existingArchiveItemIds.has(String(i.id)),
                      )
                      const allInGroupSelected =
                        selectableInGroup.length > 0 &&
                        selectableInGroup.every((i) => selectedForSave.has(String(i.id)))
                      const isAiGroup = group.categoryValue === 'ai_recommend'
                      return (
                        <div
                          key={`${bagKey}-${group.categoryValue}`}
                          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5"
                        >
                          <div
                            className={`mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${
                              isAiGroup ? 'border-violet-200/90' : 'border-teal-100/90'
                            }`}
                          >
                            <h3
                              className={`flex min-w-0 items-center gap-2 text-base font-extrabold tracking-tight ${
                                isAiGroup ? 'text-violet-950' : 'text-[#0a3d3d]'
                              }`}
                            >
                              {isAiGroup ? <AiSparkleMaskIcon selected={false} className="h-4 w-4 shrink-0" /> : null}
                              {group.categoryLabel}
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleToggleSelectAllInGroup(group)}
                              disabled={selectableInGroup.length === 0}
                              className={`shrink-0 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-bold shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-40 sm:text-sm sm:px-3 ${
                                isAiGroup
                                  ? 'border-violet-200 text-violet-900 hover:bg-violet-50'
                                  : 'border-sky-200 text-sky-800 hover:bg-sky-50'
                              }`}
                            >
                              {allInGroupSelected ? '전체 해제' : '전체 선택'}
                              <span
                                className={`ml-1 font-semibold tabular-nums ${
                                  isAiGroup ? 'text-violet-600' : 'text-sky-600'
                                }`}
                              >
                                ({selectableInGroup.length})
                              </span>
                            </button>
                          </div>
                          <div className="flex flex-col gap-3">
                            {group.items.map((item) => (
                              <SearchResultItem
                                key={item.id}
                                item={item}
                                selected={selectedForSave.has(String(item.id))}
                                inArchiveAlready={existingArchiveItemIds.has(String(item.id))}
                                onToggle={() => toggleItemSelect(item)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {singleCategoryBaggageSections.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">해당 카테고리에 항목이 없습니다.</div>
              ) : (
                <div className="space-y-10">
                  {singleCategoryBaggageSections.map(({ bagKey, bagTitle, items }) => (
                    <div key={bagKey} className="space-y-6">
                      <div className="flex flex-col gap-2 border-b border-teal-100/90 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                        <h2 className="text-base font-extrabold tracking-tight text-[#0a3d3d]">{bagTitle}</h2>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
                        <div
                          className={`mb-3 border-b pb-2 ${
                            selectedCategory === 'ai_recommend' ? 'border-violet-200/90' : 'border-teal-100/90'
                          }`}
                        >
                          <h3
                            className={`flex items-center gap-2 text-base font-extrabold tracking-tight ${
                              selectedCategory === 'ai_recommend' ? 'text-violet-950' : 'text-[#0a3d3d]'
                            }`}
                          >
                            {selectedCategory === 'ai_recommend' ? (
                              <AiSparkleMaskIcon selected={false} className="h-4 w-4 shrink-0" />
                            ) : null}
                            {CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? '준비물'}
                          </h3>
                        </div>
                        <div className="flex flex-col gap-3">
                          {items.map((item) => (
                            <SearchResultItem
                              key={item.id}
                              item={item}
                              selected={selectedForSave.has(String(item.id))}
                              inArchiveAlready={existingArchiveItemIds.has(String(item.id))}
                              onToggle={() => toggleItemSelect(item)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 bg-transparent px-5 py-3 md:bottom-0 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl gap-3">
          <button
            type="button"
            onClick={openHomeConfirmModal}
            className="min-w-0 flex-1 basis-0 rounded-2xl border-2 border-gray-100 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
          >
            {mergeToArchive ? '뒤로가기' : '홈으로'}
          </button>
          <button
            type="button"
            onClick={openSaveConfirmModal}
            disabled={selectedForSave.size === 0}
            className="min-w-0 flex-1 basis-0 rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            {mergeToArchive ? '추가' : '저장'}
          </button>
        </div>
      </div>

      {/* 저장 확인 → 가이드 보관함 이동 */}
      {saveConfirmModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={closeSaveConfirmModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-checklist-modal-title"
            className={`relative w-full rounded-2xl bg-white p-6 shadow-xl ${mergeToArchive ? 'max-w-md' : 'max-w-sm'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="save-checklist-modal-title"
              className={`text-center font-bold leading-snug text-gray-900 ${mergeToArchive ? 'mb-6 text-sm md:text-base' : 'mb-8 text-base'}`}
            >
              {mergeToArchive ? (
                '선택한 항목을 이 체크리스트에 추가합니다. 확인 시 해당 체크리스트 화면으로 돌아갑니다.'
              ) : (
                <>
                  저장하시겠습니까?
                  <br />
                  확인 버튼을 클릭하면 체크리스트로 전환됩니다
                </>
              )}
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={handleConfirmSaveAndGoArchive}
                className="min-h-12 flex-1 rounded-2xl bg-amber-400 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md"
              >
                확인
              </button>
              <button
                type="button"
                onClick={closeSaveConfirmModal}
                className="min-h-12 flex-1 rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 홈 이동 확인 모달 */}
      {leaveModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={handleModalBack}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-modal-title"
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="leave-modal-title" className="mb-8 text-center text-base font-bold leading-snug text-gray-900">
              저장하지 않으시겠습니까?
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={handleLeaveWithoutSave}
                className="min-h-12 flex-1 rounded-2xl bg-amber-400 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md"
              >
                저장안함
              </button>
              <button
                type="button"
                onClick={handleModalBack}
                className="min-h-12 flex-1 rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchResultItem({ item, selected, onToggle, inArchiveAlready = false, className = '' }) {
  const subtitleText = item.description || item.detail || ''

  if (inArchiveAlready) {
    return (
      <div
        className={`w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-left shadow-sm ${className}`.trim()}
        role="group"
        aria-label="이미 이 체크리스트에 담긴 항목"
      >
        <div className="flex gap-3">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-amber-300 bg-amber-100"
            aria-hidden
          >
            <svg className="h-3 w-3 text-amber-800" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 6.2 5 8.7 9.5 3.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-extrabold leading-snug text-gray-900">{item.title}</span>
              <span className="rounded-full bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                담김
              </span>
            </p>
            {subtitleText ? (
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{subtitleText}</p>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const btnShell = selected
    ? 'w-full cursor-pointer rounded-2xl border-2 border-amber-400 bg-amber-200/95 p-4 text-left shadow-sm ring-1 ring-amber-300/70 transition-all duration-200'
    : 'w-full cursor-pointer rounded-2xl border-2 border-gray-100 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:bg-gray-50'

  const checkShell = selected ? 'border-amber-600 bg-amber-600' : 'border-gray-300 bg-white'

  return (
    <button type="button" onClick={onToggle} aria-pressed={selected} className={`${btnShell} ${className}`.trim()}>
      <div className="flex gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${checkShell}`}
          aria-hidden
        >
          {selected ? (
            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 6.2 5 8.7 9.5 3.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold leading-snug text-gray-900">{item.title}</p>
          {subtitleText ? (
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{subtitleText}</p>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function TripSearchPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  return <TripSearchInner key={`${id}-${searchParams.toString()}`} tripId={id} />
}

export default TripSearchPage
