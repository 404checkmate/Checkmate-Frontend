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
import SelectionProgressCard from '@/components/search/SelectionProgressCard'
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
  const { loadState, setLoadState, apiItems, apiSummary } = useChecklistLoad(tripId, retryTick)

  // ── UI 상태 ────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState('all')
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
    selectionProgressPercent,
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
    (i) => i.category === 'ai_recommend' || i.prepType === 'ai_recommend' || i.source === 'llm',
  ).length
  const visibleItemCount = selectedCategory === 'all' ? sourceItems.length : singleCategoryItems.length

  // ── 헤더 파생값 ───────────────────────────────────────
  const pageMainTitle = mergeToArchive
    ? '여행 필수품 추가'
    : tripDestinationLabel
      ? `${tripDestinationLabel} 여행 체크리스트`
      : TRIP_SEARCH_CONTEXT.title
  const categoryCardHeading = mergeToArchive ? '카테고리별 추가 선택' : '카테고리별 선택'
  const headerDateLine =
    mergeToArchive && archiveEntry ? buildGuideArchiveDateLine(archiveEntry) : tripDateLabel || ''
  const headerDescription =
    mergeToArchive && archiveEntry
      ? `「${buildGuideArchiveListTitle(archiveEntry)}」에 담을 준비물을 고르세요.`
      : '맞춤 준비 항목을 확인하고 나의 체크리스트에 담아보세요!'
  const pageBackgroundStyle = mergeToArchive
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

  // ── 이벤트 핸들러 ──────────────────────────────────────
  const handleCategoryChange = (category) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      trackEvent('research_trigger', { trip_id: tripId, from_category: selectedCategory, to_category: category })
    }
    setSelectedCategory(category)
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
      <TripSearchBackNav mergeToArchive={mergeToArchive} tripId={tripId} />

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
            <ChecklistSkeleton count={6} />
          ) : loadState.status === 'fallback' ? (
            <TripSearchFallbackState
              errorMessage={loadState.errorMessage}
              onRetry={() => setRetryTick((n) => n + 1)}
            />
          ) : (
            <>
              <SelectionProgressCard
                mergeToArchive={mergeToArchive}
                selectedCount={selectedForSave.size}
                totalCount={totalItemCount}
                progressPercent={selectionProgressPercent}
              />

              <section className="lg:hidden" aria-label="준비물 목록">
                <MobileAccordionChecklist
                  loadState={loadState}
                  groupedItemsByCategory={groupedItemsByCategory}
                  selectedForSave={selectedForSave}
                  existingArchiveItemIds={existingArchiveItemIds}
                  onToggleSelectAllInGroup={handleToggleSelectAllInGroup}
                  onToggleItem={toggleItemSelect}
                />
              </section>

              <div className="hidden lg:block">
                <TripSearchCategoryFilter
                  categoryCardHeading={categoryCardHeading}
                  tabCategories={tabCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
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
      />

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
