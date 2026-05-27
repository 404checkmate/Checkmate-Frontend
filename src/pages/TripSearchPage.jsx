import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'

import { useMobileScrollChromeVisibility } from '@/hooks/useMobileScrollChromeVisibility'
import { useTripMeta } from '@/hooks/useTripMeta'
import { useArchiveEntry } from '@/hooks/useArchiveEntry'
import { useChecklistLoad } from '@/hooks/useChecklistLoad'
import { useChecklistSelection } from '@/hooks/useChecklistSelection'
import { useTripSearchSave } from '@/hooks/useTripSearchSave'
import { useGuestTripUpgrade } from '@/hooks/useGuestTripUpgrade'

import { CATEGORIES, TRIP_SEARCH_CONTEXT } from '@/mocks/searchData'
import { getTabCategories } from '@/utils/checklistAdapter'
import { normalizeItemCategory, sortItemsForDisplay, buildSubcategoryGroups } from '@/utils/tripSearchUtils'
import { buildGuideArchiveDateLine, buildGuideArchiveListTitle } from '@/utils/guideArchivePresentation'
import {
  TRIP_MINT_PAGE_BACKGROUND_STYLE,
  TRIP_SEARCH_MERGE_PAGE_BACKGROUND_STYLE,
} from '@/utils/tripMintPageBackground'
import { trackEvent } from '@/utils/analyticsTracker'
import TripSearchPageHeader from '@/components/search/TripSearchPageHeader'
import TripSearchCategoryFilter from '@/components/search/TripSearchCategoryFilter'
import TripSearchItemsList from '@/components/search/TripSearchItemsList'
import MobileAccordionChecklist from '@/components/search/MobileAccordionChecklist'
import TripSearchSaveModal from '@/components/search/TripSearchSaveModal'
import TripSearchLeaveModal from '@/components/search/TripSearchLeaveModal'
import LoginGateModal from '@/components/search/LoginGateModal'
import TripSearchActionBar from '@/components/search/TripSearchActionBar'
import TripSearchBackNav from '@/components/search/TripSearchBackNav'
import ChecklistSkeleton from '@/components/search/ChecklistSkeleton'
import TripSearchFallbackState from '@/components/search/TripSearchFallbackState'
import DesktopCategoryControls from '@/components/search/DesktopCategoryControls'

function TripSearchInner({ tripId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const navBarVisible = useMobileScrollChromeVisibility(true, location.pathname)
  const [searchParams] = useSearchParams()
  const archiveEntryIdRaw = searchParams.get('archiveEntry')
  const archiveEntryId =
    archiveEntryIdRaw && String(archiveEntryIdRaw).trim() ? String(archiveEntryIdRaw).trim() : null

  // ── 데이터 훅 ──────────────────────────────────────────
  const { tripDateLabel, tripCompanions, tripStyles, tripDestinationLabel } = useTripMeta(tripId)
  const { archiveEntry, mergeToArchive, archiveTargetMissing, existingArchiveItemIds } =
    useArchiveEntry(tripId, archiveEntryId)

  const [retryTick, setRetryTick] = useState(0)
  const prefetchedItems = location.state?.prefetchedItems ?? null
  const { loadState, setLoadState, apiItems, apiSummary } = useChecklistLoad(tripId, retryTick, prefetchedItems)

  // ── UI 상태 ────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState('supplies')
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)

  // ── 파생 데이터 ────────────────────────────────────────
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
  const singleCategoryItems = useMemo(
    () =>
      selectedCategory === 'all'
        ? []
        : sourceItems.filter((i) => i.category === selectedCategory).sort(sortItemsForDisplay),
    [selectedCategory, sourceItems],
  )

  // ── 선택 훅 ────────────────────────────────────────────
  const {
    selectedForSave,
    setSelectedForSave,
    toggleItemSelect,
    handleSelectAllInView,
    handleToggleSelectAllInGroup,
    selectableItemsInView,
    allSelectableInViewSelected,
  } = useChecklistSelection({
    sourceItems,
    existingArchiveItemIds,
    tripId,
    selectedCategory,
    singleCategoryItems,
    mergeToArchive,
  })

  // ── 저장 훅 ────────────────────────────────────────────
  const searchStartRef = useRef(0)
  const {
    saving,
    saveError,
    saveConfirmModalOpen,
    loginGateOpen,
    setLoginGateOpen,
    handleSaveButtonClick,
    handleConfirmSaveAndGoArchive,
    closeSaveConfirmModal,
    handleLoginRedirect,
  } = useTripSearchSave({
    tripId,
    archiveEntryId,
    mergeToArchive,
    archiveEntry,
    sourceItems,
    selectedForSave,
    setSelectedForSave,
    searchStartRef,
    location,
  })

  // ── 파생 카운트 ────────────────────────────────────────
  const totalItemCount = sourceItems.length
  const aiRecommendCount = sourceItemsRaw.filter(
    (i) => i.category === 'ai_recommend' || i.prepType === 'ai_recommend' || i.source === 'llm' || i.source === 'curation',
  ).length
  const visibleItemCount = selectedCategory === 'all' ? sourceItems.length : singleCategoryItems.length

  // ── 헤더 파생값 ───────────────────────────────────────
  // archiveEntryId: URL에서 즉시 확인 가능 → 로딩 전부터 올바른 UI 표시
  // mergeToArchive: archiveEntry 로드 완료 후 true → 데이터 의존 항목에만 사용
  const isArchiveMode = Boolean(archiveEntryId)
  const pageMainTitle = isArchiveMode
    ? '여행 필수품 추가'
    : tripDestinationLabel
      ? `${tripDestinationLabel} 여행 체크리스트`
      : TRIP_SEARCH_CONTEXT.title
  const categoryCardHeading = isArchiveMode ? '카테고리별 추가 선택' : '카테고리별 선택'
  const headerDateLine =
    mergeToArchive && archiveEntry ? buildGuideArchiveDateLine(archiveEntry) : tripDateLabel || ''
  const headerDescription =
    mergeToArchive && archiveEntry
      ? `「${buildGuideArchiveListTitle(archiveEntry)}」에 담을 준비물을 고르세요.`
      : '맞춤 준비 항목을 확인하고 나의 체크리스트에 담아보세요!'
  const pageBackgroundStyle = isArchiveMode
    ? TRIP_SEARCH_MERGE_PAGE_BACKGROUND_STYLE
    : TRIP_MINT_PAGE_BACKGROUND_STYLE

  // ── 분석 추적 ──────────────────────────────────────────
  useEffect(() => {
    const t = Date.now()
    searchStartRef.current = t
    trackEvent('search_start', {
      trip_id: tripId,
      timestamp: t,
      merge_to_archive: mergeToArchive,
      archive_entry_id: archiveEntryId ?? undefined,
    })
    if (archiveEntryId) {
      trackEvent('backflow_trigger', { from: 'confirm_loop', trip_id: tripId })
    }
  }, [tripId, mergeToArchive, archiveEntryId])

  // ── guest → 실제 trip 업그레이드 ──────────────────────
  useGuestTripUpgrade({ tripId, setLoadState })

  // ── 모바일 체크리스트 스크롤 ref ───────────────────────
  const mobileChecklistRef = useRef(null)

  // ── 이벤트 핸들러 ──────────────────────────────────────
  const handleCategoryChange = (category) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      trackEvent('research_trigger', { trip_id: tripId, from_category: selectedCategory, to_category: category })
    }
    setSelectedCategory(category)
    // 모바일/태블릿에서만 체크리스트 섹션 최상단으로 스크롤
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        mobileChecklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  const handleLeaveWithoutSave = () => {
    setLeaveModalOpen(false)
    if (mergeToArchive && archiveEntryId) {
      navigate('/guide-archives')
      return
    }
    navigate('/')
  }

  // ── 렌더 ──────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={pageBackgroundStyle}>
      <TripSearchBackNav archiveEntryId={archiveEntryId} />

      <div className="mx-auto w-full max-w-7xl px-3 pb-36 pt-5 md:px-6 md:pb-28 md:pt-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <TripSearchPageHeader
            pageMainTitle={pageMainTitle}
            headerDateLine={headerDateLine}
            companions={tripCompanions}
            travelStyles={tripStyles}
            archiveTargetMissing={archiveTargetMissing}
            loadState={loadState}
            via={loadState.via}
          />

          {loadState.status === 'loading' ? (
            <ChecklistSkeleton count={6} />
          ) : loadState.status === 'fallback' ? (
            <TripSearchFallbackState
              errorMessage={loadState.errorMessage}
              onRetry={() => setRetryTick((n) => n + 1)}
            />
          ) : (
            <>
              {/* 모바일/태블릿 카테고리 탭 바
                  - 처음엔 페이지 헤더 태그 바로 아래 콘텐츠 흐름에 위치
                  - 스크롤 시 화면 상단(헤더 바로 아래)에 고정됨 (sticky)
                  - -mx-3/-mx-6 로 부모 패딩 상쇄 → 화면 너비 꽉 채움 */}
              {tabCategories.length > 0 && (
                <div
                  className={[
                    'lg:hidden sticky z-[50]',
                    '-mx-3 md:-mx-6',
                    'transition-[top] duration-300 ease-out motion-reduce:transition-none',
                    'mb-5',
                    navBarVisible ? 'top-14' : 'top-0',
                  ].join(' ')}
                  role="tablist"
                  aria-label="카테고리 필터"
                >
                  <div className="flex gap-2 overflow-x-auto px-3 py-2.5 scrollbar-hide md:px-6">
                    {tabCategories.map((cat) => {
                      const selected = selectedCategory === cat.value
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          onClick={() => handleCategoryChange(cat.value)}
                          className={[
                            'inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                            selected
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'border border-gray-200 bg-white text-gray-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700',
                          ].join(' ')}
                        >
                          {cat.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <section ref={mobileChecklistRef} className="lg:hidden scroll-mt-28" aria-label="준비물 목록">
                <MobileAccordionChecklist
                  loadState={loadState}
                  groupedItemsByCategory={groupedItemsByCategory}
                  selectedCategory={selectedCategory}
                  selectedForSave={selectedForSave}
                  existingArchiveItemIds={existingArchiveItemIds}
                  onToggleSelectAllInGroup={handleToggleSelectAllInGroup}
                  onToggleItem={toggleItemSelect}
                />
              </section>

              <div className="hidden lg:block">
                {!mergeToArchive && (
                  <TripSearchCategoryFilter
                    categoryCardHeading={categoryCardHeading}
                    tabCategories={tabCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                )}
                <DesktopCategoryControls
                  selectedCategory={selectedCategory}
                  tabCategories={tabCategories}
                  visibleItemCount={visibleItemCount}
                  selectableItemsInView={selectableItemsInView}
                  allSelectableInViewSelected={allSelectableInViewSelected}
                  onSelectAll={handleSelectAllInView}
                />
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
            </>
          )}
        </div>
      </div>

      <TripSearchActionBar
        mergeToArchive={mergeToArchive}
        navBarVisible={navBarVisible}
        selectedCount={selectedForSave.size}
        onLeave={() => setLeaveModalOpen(true)}
        onSave={handleSaveButtonClick}
        saving={saving}
      />

      {/* 게스트 저장 직접 실행 시 모달 없이 로딩 오버레이 표시 */}
      {saving && !saveConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
            <p className="text-sm font-semibold text-gray-700">저장 중…</p>
          </div>
        </div>
      )}

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
      <LoginGateModal
        open={loginGateOpen}
        onLoginRedirect={handleLoginRedirect}
        onClose={() => setLoginGateOpen(false)}
      />
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
