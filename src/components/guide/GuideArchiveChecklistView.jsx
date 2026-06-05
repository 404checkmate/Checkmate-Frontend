import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import {
  patchSavedItemContent,
  removeSavedItem,
  saveItemForTrip,
  setSavedItemChecked,
} from '@/utils/savedTripItems'
import { patchGuideArchiveEntry } from '@/utils/guideArchiveStorage'
import { trackEvent } from '@/utils/analyticsTracker'
import { deselectChecklistItem } from '@/api/checklists'
import { buildGuideArchiveDateLine, buildGuideArchiveListTitle } from '@/utils/guideArchivePresentation'
import { CATEGORIES } from '@/mocks/searchData'
import { saveEntryChecklistChecks } from '@/utils/guideArchiveEntryChecklistStorage'
import {
  BAGGAGE_SECTION_LABEL,
  GUIDE_USER_DIRECT_CATEGORY,
  GUIDE_USER_DIRECT_SECTION_LABEL,
  resolveBaggageSection,
} from '@/utils/guideArchiveBaggage'
import { buildGuideArchiveDirectDroppableId } from '@/utils/guideArchiveChecklistReorder'
import { GUIDE_ARCHIVE_DROP_ANIMATION, resolveDirectAddCategory } from '@/utils/guideArchiveSupplies'
import GuideArchiveSectionDndList from '@/components/guide/GuideArchiveSectionDndList'
import { GuideArchiveChecklistDragPreview } from '@/components/guide/GuideArchiveSortableChecklistItem'
import GuideChecklistCategoryFilter, {
  VIEW_BASIS_SUPPLIES,
  VIEW_BASIS_BAGGAGE,
} from '@/components/guide/GuideChecklistCategoryFilter'
import GuideChecklistSectionEditModal from '@/components/guide/GuideChecklistSectionEditModal'
import GuideChecklistDirectAddModal from '@/components/guide/GuideChecklistDirectAddModal'
import GuideArchiveChecklistHeader from '@/components/guide/GuideArchiveChecklistHeader'
import GuideArchiveProgressCard from '@/components/guide/GuideArchiveProgressCard'
import GuideArchiveBottomBar from '@/components/guide/GuideArchiveBottomBar'
import GuideArchiveSaveConfirmModal from '@/components/guide/GuideArchiveSaveConfirmModal'
import GuideArchiveDeleteItemModal from '@/components/guide/GuideArchiveDeleteItemModal'
import { useMobileScrollChromeVisibility } from '@/hooks/useMobileScrollChromeVisibility'
import { useGuideArchiveReclassify } from '@/hooks/useGuideArchiveReclassify'
import { useGuideArchiveDnd } from '@/hooks/useGuideArchiveDnd'
import { useGuideArchiveChecks } from '@/hooks/useGuideArchiveChecks'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import SectionHeaderWithHint from '@/components/guide/SectionHeaderWithHint'
import SuppliesView from '@/components/guide/SuppliesView'
import BaggageView from '@/components/guide/BaggageView'
import { useGuideArchiveSections } from '@/hooks/useGuideArchiveSections'

function calcProgress(items, checksState) {
  if (items.length === 0) return 0
  const checked = items.filter((it) => checksState[String(it.id)]).length
  return Math.round((checked / items.length) * 100)
}

/**
 * 가이드 보관함 상세 — 이 여행 스냅샷에 담긴 필수품을 하나씩 체크하며 준비합니다.
 * 체크 상태는 entry 단위로 저장되며, 같은 trip에 다른 여행지 목록이 있어도 섞이지 않습니다.
 * 화면에서의 체크/해제는 메모리만 바꾸고, **저장 → 확인**을 눌렀을 때만 스토리지에 반영합니다(뒤로가기 시 폐기).
 * 준비물 **삭제**는 각 행의 휴지통에서 확인 후 스토리지에 즉시 반영됩니다.
 * **수정**: 각 행의 연필 아이콘으로 해당 항목만 편집 모달을 엽니다.
 * **직접 추가**: 직접 추가로 항목을 저장하면 **기내 반입**으로 분류되어 본문 **맨 아래** `직접 추가` 블록에 붙습니다.
 * **순서 변경**: 카드 오른쪽 **드래그 핸들**만 잡고 이동(@dnd-kit). 스토리지 반영은 「완료」와 동일 시점.
 * `onArchiveMutated`: 삭제·저장 후 부모가 스토리지에서 entry를 다시 읽을 때 호출합니다.
 */
export default function GuideArchiveChecklistView({ tripId, entry, companions = [], travelStyles = [], onArchiveMutated, isPreview = false, onItemsChange, onSaveIntent, syncTick = 0 }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navBarVisible = useMobileScrollChromeVisibility(true, pathname)

  // ── 기본 UI 상태 ──────────────────────────────────────
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tempSaved, setTempSaved] = useState(false)

  // ── 모달 상태 ──────────────────────────────────────────
  const [sectionEditModalOpen, setSectionEditModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [sectionEditDraft, setSectionEditDraft] = useState(null)
  const [directAddModalOpen, setDirectAddModalOpen] = useState(false)
  const [deleteItemConfirm, setDeleteItemConfirm] = useState(null)
  const [directAddDraft, setDirectAddDraft] = useState({
    title: '', memo: '', prepType: '', subCategory: 'essentials', baggageType: 'none',
  })

  // ── 보기 필터 상태 ────────────────────────────────────
  const [viewBasis, setViewBasis] = useState(VIEW_BASIS_SUPPLIES)
  const [suppliesCategory, setSuppliesCategory] = useState('all')
  const [baggageSection, setBaggageSection] = useState('all')

  // ── 로컬 아이템 (드래그 순서용) ──────────────────────
  const entryOrderSignature = useMemo(
    () => `${entry.id}:${(entry.items ?? []).map((it) => String(it.id)).join('')}`,
    [entry.id, entry.items],
  )
  const [localItems, setLocalItems] = useState(() => entry.items ?? [])
  useEffect(() => {
    setLocalItems(entry.items ?? [])
  }, [entryOrderSignature])

  // ── 체크 상태 ─────────────────────────────────────────
  const { checks, setChecks, handleToggle } = useGuideArchiveChecks({ tripId, entry, syncTick })

  // ── 파생 필터 ─────────────────────────────────────────
  const dndLocked = sectionEditModalOpen || directAddModalOpen
  const effectiveBaggageFilter = viewBasis === VIEW_BASIS_BAGGAGE ? baggageSection : 'all'
  const effectiveItemCategory = viewBasis === VIEW_BASIS_SUPPLIES ? suppliesCategory : 'all'

  // ── 훅 ────────────────────────────────────────────────
  useGuideArchiveReclassify({ tripId: isPreview ? null : tripId, entry: isPreview ? null : entry, localItems, setLocalItems, onArchiveMutated })
  const {
    dndSensors,
    activeDragItem,
    activeDragRect,
    handleGuideArchiveDragStart,
    handleGuideArchiveDragCancel,
    handleGuideArchiveDragEndWithOverlay,
  } = useGuideArchiveDnd({ localItems, setLocalItems, effectiveBaggageFilter, tripId, dndLocked })

  // ── 섹션 파생 데이터 ──────────────────────────────────
  const items = localItems

  const {
    visibleSectionsByBaggage,
    directAddSectionItems,
    suppliesViewSections,
    visibleChecklistItemCount,
    firstVisibleBagKeyForHint,
    firstSuppliesCategoryForHint,
  } = useGuideArchiveSections({ items, viewBasis, effectiveBaggageFilter, effectiveItemCategory })

  // ── 진행도 ────────────────────────────────────────────
  const total = items.length
  const checkedCount = useMemo(() => items.filter((it) => checks[String(it.id)]).length, [items, checks])
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  const title = buildGuideArchiveListTitle(entry)
  const dateLine = entry?.via === 'curation' ? '' : buildGuideArchiveDateLine(entry)

  // ── 모달/필터 효과 ─────────────────────────────────────
  const closeAllModals = useCallback(() => {
    setSectionEditModalOpen(false)
    setEditingSection(null)
    setSectionEditDraft(null)
    setDirectAddModalOpen(false)
    setDirectAddDraft({ title: '', memo: '', prepType: '', subCategory: 'essentials', baggageType: 'none' })
  }, [])

  useEffect(() => {
    if (items.length === 0) closeAllModals()
  }, [items.length, closeAllModals])

  useEffect(() => {
    if (suppliesCategory === 'ai_recommend') setSuppliesCategory('all')
  }, [suppliesCategory])

  const setViewBasisAndReset = useCallback((next) => {
    setViewBasis((current) => {
      if (current === next) return current
      if (next === VIEW_BASIS_SUPPLIES) setSuppliesCategory('all')
      else setBaggageSection('all')
      return next
    })
  }, [])

  // ── 모달 취소 핸들러 ─────────────────────────────────
  const cancelDirectAdd = useCallback(() => {
    setDirectAddModalOpen(false)
    setDirectAddDraft({ title: '', memo: '', prepType: '', subCategory: 'essentials', baggageType: 'none' })
  }, [])

  const cancelSectionEditor = useCallback(() => {
    setSectionEditModalOpen(false)
    setEditingSection(null)
    setSectionEditDraft(null)
  }, [])

  // ── Escape 키 ─────────────────────────────────────────
  useEscapeKey(saveConfirmOpen, () => setSaveConfirmOpen(false))
  useEscapeKey(sectionEditModalOpen, cancelSectionEditor)
  useEscapeKey(directAddModalOpen, cancelDirectAdd)

  // ── 핸들러 ────────────────────────────────────────────
  const openDirectAddModal = useCallback(() => {
    setDirectAddDraft({ title: '', memo: '', prepType: '', subCategory: 'essentials', baggageType: 'none' })
    setDirectAddModalOpen(true)
  }, [])

  const handleMoveUp = useCallback((itemId) => {
    setLocalItems((prev) => {
      const idx = prev.findIndex((it) => String(it.id) === String(itemId))
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }, [])

  const handleMoveDown = useCallback((itemId) => {
    setLocalItems((prev) => {
      const idx = prev.findIndex((it) => String(it.id) === String(itemId))
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }, [])

  const submitDirectAdd = useCallback(() => {
    const title = (directAddDraft.title ?? '').trim()
    if (!title) { window.alert('제목을 입력해 주세요.'); return }
    if (!directAddDraft.prepType) { window.alert('준비물 유형을 선택해주세요.'); return }
    const description = (directAddDraft.memo ?? '').trim()
    const id = `ga-direct-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const resolvedCategory = resolveDirectAddCategory(directAddDraft.prepType)
    const resolvedCategoryLabel = CATEGORIES.find((c) => c.value === resolvedCategory)?.label ?? resolvedCategory
    const subCategory = directAddDraft.prepType === 'item' ? (directAddDraft.subCategory || 'essentials') : undefined
    const baggageType = directAddDraft.baggageType || 'none'
    const newItem = {
      id, category: resolvedCategory, categoryLabel: resolvedCategoryLabel,
      title, description, prepType: directAddDraft.prepType, baggageType, subCategory,
      source: 'user_added',
    }
    const newItems = [...items, newItem]
    // 즉시 UI에 반영 — 서버 응답을 기다리지 않음
    setLocalItems(newItems)
    setChecks((prev) => ({ ...prev, [String(id)]: false }))
    setDirectAddModalOpen(false)
    setDirectAddDraft({ title: '', memo: '', prepType: '', subCategory: 'essentials', baggageType: 'none' })
    // 서버/로컬 저장 (비동기, refetch 트리거 없음 — race condition 방지)
    const nextChecks = { ...checks, [String(id)]: false }
    const progressN = calcProgress(newItems, nextChecks)
    if (!isPreview) {
      saveEntryChecklistChecks(tripId, entry.id, nextChecks)
      patchGuideArchiveEntry(tripId, entry.id, {
        items: newItems,
        checklistProgressPercent: progressN,
        checklistSavedAt: new Date().toISOString(),
      })
      saveItemForTrip(tripId, { id, category: GUIDE_USER_DIRECT_SECTION_LABEL, title, subtitle: description || title })
    }
    onItemsChange?.(newItems)
    trackEvent('edit_add', { trip_id: tripId, category: GUIDE_USER_DIRECT_CATEGORY })
  }, [directAddDraft, items, checks, setChecks, tripId, entry.id, isPreview, onItemsChange])

  const openSectionEditorForSingleItem = useCallback((item) => {
    const bagKey = resolveBaggageSection(item)
    const categoryValue = item.category ?? '_misc'
    const categoryLabel = item.categoryLabel || item.category || '준비물'
    setEditingSection({ bagKey, categoryValue })
    setSectionEditDraft({
      categoryLabel,
      rows: [{ id: item.id, title: item.title ?? '', description: item.description ?? '', detail: item.detail ?? '' }],
    })
    setSectionEditModalOpen(true)
  }, [])

  const persistItemsAndChecks = useCallback((newItems, nextChecks) => {
    if (!isPreview) {
      const nextIds = new Set(newItems.map((it) => String(it.id)))
      for (const it of items) {
        const id = String(it.id)
        if (nextIds.has(id)) continue
        removeSavedItem(tripId, id)
        const serverId = it.serverId
        if (serverId && String(serverId).trim()) {
          deselectChecklistItem(serverId).catch((err) => {
            console.warn(
              `[GuideArchiveChecklistView] deselectChecklistItem(${serverId}) 실패:`,
              err?.response?.data?.message || err?.message || err,
            )
          })
        }
      }
      const progressN = calcProgress(newItems, nextChecks)
      saveEntryChecklistChecks(tripId, entry.id, nextChecks)
      patchGuideArchiveEntry(tripId, entry.id, {
        items: newItems,
        checklistProgressPercent: progressN,
        checklistSavedAt: new Date().toISOString(),
      })
      onArchiveMutated?.()
    }
    setLocalItems(newItems)
    setChecks(nextChecks)
    onItemsChange?.(newItems)
  }, [isPreview, tripId, entry.id, items, setChecks, onArchiveMutated, onItemsChange])

  const confirmDeleteSingleItem = useCallback((item) => setDeleteItemConfirm(item), [])

  const doDeleteSingleItem = useCallback(() => {
    if (!deleteItemConfirm) return
    const id = String(deleteItemConfirm.id)
    const newItems = items.filter((it) => String(it.id) !== id)
    const nextChecks = {}
    for (const it of newItems) nextChecks[String(it.id)] = Boolean(checks[String(it.id)])
    persistItemsAndChecks(newItems, nextChecks)
    trackEvent('edit_del', { trip_id: tripId, count: 1 })
    setDeleteItemConfirm(null)
  }, [deleteItemConfirm, items, checks, persistItemsAndChecks, tripId])

  const saveSectionEdit = useCallback(() => {
    if (!editingSection || !sectionEditDraft) return
    const { bagKey, categoryValue } = editingSection
    const rowById = new Map(sectionEditDraft.rows.map((r) => [String(r.id), r]))
    const newItems = items.map((it) => {
      const id = String(it.id)
      const row = rowById.get(id)
      if (!row) return it
      if ((it.category ?? '_misc') !== categoryValue) return it
      if (bagKey != null && resolveBaggageSection(it) !== bagKey) return it
      return {
        ...it,
        title: (row.title ?? '').trim() || it.title,
        description: (row.description ?? '').trim(),
        detail: (row.detail ?? '').trim(),
      }
    })
    if (!isPreview) {
      const progressN = calcProgress(newItems, checks)
      saveEntryChecklistChecks(tripId, entry.id, checks)
      patchGuideArchiveEntry(tripId, entry.id, {
        items: newItems,
        checklistProgressPercent: progressN,
        checklistSavedAt: new Date().toISOString(),
      })
      for (const r of sectionEditDraft.rows) {
        const id = String(r.id)
        const sub =
          [(r.detail ?? '').trim(), (r.description ?? '').trim()].filter(Boolean).join(' — ') ||
          (r.title ?? '').trim()
        patchSavedItemContent(tripId, id, { title: (r.title ?? '').trim(), subtitle: sub })
      }
    }
    setLocalItems(newItems)
    onItemsChange?.(newItems)
    trackEvent('edit_text', { item_id: sectionEditDraft.rows[0]?.id, trip_id: tripId })
    setSectionEditModalOpen(false)
    setEditingSection(null)
    setSectionEditDraft(null)
  }, [editingSection, sectionEditDraft, items, tripId, entry.id, checks, isPreview, onItemsChange])

  const performSave = useCallback(async () => {
    if (isPreview) {
      setSaveConfirmOpen(false)
      onSaveIntent?.()
      return
    }
    setIsSaving(true)
    try {
      const persisted = {}
      for (const it of items) persisted[String(it.id)] = Boolean(checks[String(it.id)])
      saveEntryChecklistChecks(tripId, entry.id, persisted)
      for (const it of items) setSavedItemChecked(tripId, String(it.id), Boolean(checks[String(it.id)]))
      await patchGuideArchiveEntry(tripId, entry.id, {
        items,
        checksState: persisted,
        checklistProgressPercent: progress,
        checklistSavedAt: new Date().toISOString(),
      })
      window.dispatchEvent(new CustomEvent('guide-archive-checklist-saved', {
        detail: { tripId: String(tripId), entryId: String(entry.id), progress },
      }))
      setSaveConfirmOpen(false)
      const checklistStatus = progress === 100 ? 'completed' : progress > 0 ? 'preparing' : 'not_started'
      navigate('/guide-archives', { state: { activeTab: checklistStatus } })
    } catch (err) {
      console.error('[performSave] 저장 실패:', err)
    } finally {
      setIsSaving(false)
    }
  }, [tripId, entry.id, items, checks, progress, navigate, isPreview, onSaveIntent])

  const handleTempSave = useCallback(async () => {
    if (isPreview) {
      onItemsChange?.(items)
      setTempSaved(true)
      window.setTimeout(() => setTempSaved(false), 2000)
      return
    }
    setIsSaving(true)
    try {
      saveEntryChecklistChecks(tripId, entry.id, checks)
      await patchGuideArchiveEntry(tripId, entry.id, {
        items,
        checksState: checks,
        checklistProgressPercent: progress,
        checklistSavedAt: new Date().toISOString(),
      })
      setTempSaved(true)
      window.setTimeout(() => setTempSaved(false), 2000)
    } catch (err) {
      console.error('[handleTempSave] 저장 실패:', err)
    } finally {
      setIsSaving(false)
    }
  }, [tripId, entry.id, items, checks, progress, isPreview, onItemsChange])

  // ── 공통 리스트 props ─────────────────────────────────
  const checklistListProps = {
    sortableDisabled: dndLocked,
    checks,
    handleToggle,
    onEditItem: openSectionEditorForSingleItem,
    onDeleteItem: confirmDeleteSingleItem,
    onMoveUp: handleMoveUp,
    onMoveDown: handleMoveDown,
  }

  // ── 렌더 ──────────────────────────────────────────────
  if (total === 0) {
    return (
      <>
        <GuideArchiveSaveConfirmModal open={saveConfirmOpen} isSaving={isSaving} onConfirm={performSave} onClose={() => setSaveConfirmOpen(false)} />
        <div className="mx-auto max-w-2xl px-5 pb-36 pt-10 text-center md:px-4 md:pb-28">
          <p className="text-lg font-bold text-gray-900">담긴 준비물이 없습니다</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            맞춤 여행 준비 탐색에서 필요한 항목을 저장하면 여기에서 하나씩 체크할 수 있어요.
          </p>
          <Link
            to={`/trips/${tripId}/search`}
            className="mt-6 inline-flex rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98]"
          >
            준비물 검색하러 가기
          </Link>
        </div>
        <GuideArchiveBottomBar isSaving={isSaving} tempSaved={tempSaved} navBarVisible={navBarVisible} onTempSave={handleTempSave} onComplete={() => setSaveConfirmOpen(true)} />
      </>
    )
  }

  return (
    <>
      <GuideArchiveSaveConfirmModal open={saveConfirmOpen} isSaving={isSaving} onConfirm={performSave} onClose={() => setSaveConfirmOpen(false)} />
      <div className="mx-auto max-w-3xl px-5 pb-36 pt-5 md:px-4 md:pb-28 md:pt-6">
        <GuideArchiveChecklistHeader title={title} dateLine={dateLine} companions={companions} travelStyles={travelStyles} />

        <GuideArchiveProgressCard checkedCount={checkedCount} total={total} progress={progress} />

        <GuideChecklistCategoryFilter
          viewBasis={viewBasis}
          onViewBasisChange={setViewBasisAndReset}
          suppliesCategory={suppliesCategory}
          onSuppliesCategoryChange={setSuppliesCategory}
          baggageSection={baggageSection}
          onBaggageSectionChange={setBaggageSection}
        />

        <div className="mb-4 hidden w-full max-w-full flex-wrap items-center gap-x-3 gap-y-3 md:flex">
          <p className="min-w-0 flex-1 text-sm font-semibold text-gray-700 md:text-base">
            {viewBasis === VIEW_BASIS_SUPPLIES ? (
              <>
                <span className="text-slate-700">
                  {suppliesCategory === 'all'
                    ? '전체 유형'
                    : CATEGORIES.find((c) => c.value === suppliesCategory)?.label}
                </span>
                <span className="ml-1.5 tabular-nums text-gray-900">{visibleChecklistItemCount}</span>개
              </>
            ) : (
              <>
                <span className="text-teal-900">
                  {baggageSection === 'all' ? '전체 구간' : BAGGAGE_SECTION_LABEL[baggageSection]}
                </span>
                <span className="ml-1.5 tabular-nums text-gray-900">{visibleChecklistItemCount}</span>개
              </>
            )}
          </p>
        </div>

        <div className="mb-6 flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-3">
          {sectionEditModalOpen ? (
            <p className="w-full text-sm text-gray-500 sm:max-w-md">수정 창을 닫은 뒤 다른 섹션을 선택할 수 있어요.</p>
          ) : directAddModalOpen ? (
            <p className="w-full text-sm text-gray-500 sm:max-w-md">직접 추가 창을 닫으면 다시 이 화면을 사용할 수 있어요.</p>
          ) : (
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 gap-y-3">
              {!isPreview && (
                <Link
                  to={`/trips/${tripId}/search?archiveEntry=${encodeURIComponent(entry.id)}`}
                  className="inline-flex shrink-0 items-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98]"
                >
                  필수품 추가
                </Link>
              )}
              <button
                type="button"
                onClick={openDirectAddModal}
                className="shrink-0 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-900 shadow-sm transition-colors hover:bg-teal-100/90"
              >
                직접 추가
              </button>
            </div>
          )}
        </div>

        <DndContext
          sensors={dndSensors}
          collisionDetection={closestCorners}
          onDragStart={handleGuideArchiveDragStart}
          onDragCancel={handleGuideArchiveDragCancel}
          onDragEnd={handleGuideArchiveDragEndWithOverlay}
        >
          <div className="space-y-10">
            {viewBasis === VIEW_BASIS_SUPPLIES
              ? <SuppliesView sections={suppliesViewSections} firstHintCategory={firstSuppliesCategoryForHint} total={total} checklistListProps={checklistListProps} />
              : <BaggageView sections={visibleSectionsByBaggage} firstHintBagKey={firstVisibleBagKeyForHint} total={total} effectiveItemCategory={effectiveItemCategory} checklistListProps={checklistListProps} />
            }

            {effectiveItemCategory === 'all' && directAddSectionItems.length > 0 ? (
              <div className="mt-10 space-y-6">
                <SectionHeaderWithHint
                  title={GUIDE_USER_DIRECT_SECTION_LABEL}
                  showHint={(viewBasis === VIEW_BASIS_BAGGAGE ? visibleSectionsByBaggage.length === 0 : suppliesViewSections.length === 0) && total > 0}
                />
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
                  <GuideArchiveSectionDndList
                    droppableId={buildGuideArchiveDirectDroppableId()}
                    list={directAddSectionItems}
                    {...checklistListProps}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <DragOverlay adjustScale={false} dropAnimation={GUIDE_ARCHIVE_DROP_ANIMATION}>
            {activeDragItem && !dndLocked ? (
              <div
                className="box-border max-w-[calc(100vw-2.5rem)]"
                style={activeDragRect?.width ? { width: activeDragRect.width } : undefined}
              >
                <GuideArchiveChecklistDragPreview item={activeDragItem} checks={checks} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <GuideChecklistSectionEditModal
        open={sectionEditModalOpen}
        draft={sectionEditDraft}
        onDraftChange={setSectionEditDraft}
        onSave={saveSectionEdit}
        onClose={cancelSectionEditor}
      />

      <GuideChecklistDirectAddModal
        open={directAddModalOpen}
        draft={directAddDraft}
        onDraftChange={setDirectAddDraft}
        onSubmit={submitDirectAdd}
        onClose={cancelDirectAdd}
        sectionLabel={GUIDE_USER_DIRECT_SECTION_LABEL}
      />

      <GuideArchiveBottomBar
        isSaving={isSaving}
        tempSaved={tempSaved}
        navBarVisible={navBarVisible}
        onTempSave={handleTempSave}
        onComplete={() => setSaveConfirmOpen(true)}
      />

      <GuideArchiveDeleteItemModal
        item={deleteItemConfirm}
        onConfirm={doDeleteSingleItem}
        onClose={() => setDeleteItemConfirm(null)}
      />
    </>
  )
}
