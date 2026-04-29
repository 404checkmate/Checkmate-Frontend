import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { fetchTripGuideArchives } from '@/api/guideArchives'
import { removeGuideArchiveEntriesByIds } from '@/utils/guideArchiveStorage'
import { trackEvent } from '@/utils/analyticsTracker'
import { loadSavedItems } from '@/utils/savedTripItems'
import { buildGuideArchiveDateLine, buildGuideArchiveListTitle } from '@/utils/guideArchivePresentation'
import { loadEntryChecklistChecks } from '@/utils/guideArchiveEntryChecklistStorage'
import { useGuideArchiveFilterSheet } from '@/hooks/useGuideArchiveFilterSheet'
import GuideArchivePageHeader from '@/components/guide/GuideArchivePageHeader'
import GuideArchiveFilterBar, { FILTER_TABS } from '@/components/guide/GuideArchiveFilterBar'
import GuideArchiveFilterSheet from '@/components/guide/GuideArchiveFilterSheet'
import GuideArchiveEntryCard from '@/components/guide/GuideArchiveEntryCard'

function computeProgressPercent(entry, savedItems, tripId) {
  const items = entry.items || []
  if (items.length === 0) return 0
  const scoped = loadEntryChecklistChecks(tripId, entry.id)
  const savedById = new Map(savedItems.map((s) => [String(s.id), s]))
  const hasOwn = Object.prototype.hasOwnProperty.bind(scoped)
  let checked = 0
  for (const it of items) {
    const id = String(it.id)
    if (hasOwn(id)) {
      if (scoped[id]) checked += 1
    } else if (savedById.get(id)?.checked) {
      checked += 1
    }
  }
  return Math.round((checked / items.length) * 100)
}

function getProgressStatusLabel(progress) {
  if (progress <= 0) return '시작 전'
  if (progress >= 100) return '완료'
  return '준비 중'
}

function TripGuideArchiveInner({ tripId }) {
  const location = useLocation()
  const [entries, setEntries] = useState([])
  /** 'loading' | 'ready' | 'error' */
  const [loadStatus, setLoadStatus] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [savedItems, setSavedItems] = useState(() => loadSavedItems(tripId))
  const [filterTab, setFilterTab] = useState('draft')
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedEntryIds, setSelectedEntryIds] = useState([])
  const [checklistRevision, setChecklistRevision] = useState(0)
  const [reloadTick, setReloadTick] = useState(0)

  const filterSheet = useGuideArchiveFilterSheet()

  const activeFilterLabel = FILTER_TABS.find((t) => t.id === filterTab)?.label ?? '필터'

  const refreshFromStorage = useCallback(() => {
    setSavedItems(loadSavedItems(tripId))
    setReloadTick((n) => n + 1)
  }, [tripId])

  useEffect(() => {
    const onSaved = () => setChecklistRevision((n) => n + 1)
    window.addEventListener('guide-archive-checklist-saved', onSaved)
    return () => window.removeEventListener('guide-archive-checklist-saved', onSaved)
  }, [])

  useEffect(() => {
    trackEvent('guide_archive_list_opened', { trip_id: tripId })
  }, [tripId])

  useEffect(() => {
    let cancelled = false
    setLoadStatus('loading')
    setLoadError('')
    ;(async () => {
      try {
        const list = await fetchTripGuideArchives(tripId)
        if (cancelled) return
        setEntries(list)
        setLoadStatus('ready')
      } catch (err) {
        if (cancelled) return
        setEntries([])
        setLoadStatus('error')
        setLoadError(err?.response?.data?.message || err?.message || '알 수 없는 오류')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tripId, location.key, reloadTick])

  useEffect(() => {
    if (entries.length === 0) {
      setDeleteMode(false)
      setSelectedEntryIds([])
    }
  }, [entries.length])

  const entriesWithMeta = useMemo(() => {
    return entries.map((entry) => {
      const progress = computeProgressPercent(entry, savedItems, tripId)
      return { entry, progress, statusLabel: getProgressStatusLabel(progress) }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, savedItems, tripId, checklistRevision])

  const filtered = useMemo(() => {
    if (filterTab === 'draft') return entriesWithMeta.filter((x) => x.progress === 0)
    if (filterTab === 'writing') return entriesWithMeta.filter((x) => x.progress > 0 && x.progress < 100)
    if (filterTab === 'completed') return entriesWithMeta.filter((x) => x.progress >= 100)
    return entriesWithMeta
  }, [entriesWithMeta, filterTab])

  const allEntriesSelected = useMemo(() => {
    if (entries.length === 0) return false
    const ids = entries.map((e) => String(e.id))
    return ids.every((id) => selectedEntryIds.includes(id))
  }, [entries, selectedEntryIds])

  const toggleEntrySelect = (entryId) => {
    const id = String(entryId)
    setSelectedEntryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSelectAllEntries = () => {
    setSelectedEntryIds((prev) => {
      const allIds = entries.map((e) => String(e.id))
      const allOn = allIds.length > 0 && allIds.every((id) => prev.includes(id))
      return allOn ? [] : allIds
    })
  }

  const exitDeleteMode = () => {
    setDeleteMode(false)
    setSelectedEntryIds([])
  }

  const handleDeleteSelected = async () => {
    if (selectedEntryIds.length === 0) return
    if (!window.confirm(`선택한 ${selectedEntryIds.length}개 항목을 삭제할까요? 되돌릴 수 없습니다.`)) return
    trackEvent('guide_archive_entries_deleted', { trip_id: tripId, count: selectedEntryIds.length })
    await removeGuideArchiveEntriesByIds(tripId, selectedEntryIds)
    exitDeleteMode()
    refreshFromStorage()
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F1F5F9 100%)' }}
    >
      <GuideArchivePageHeader />

      <div className="relative mx-auto max-w-5xl px-4 md:px-8">
        <GuideArchiveFilterBar
          entries={entries}
          deleteMode={deleteMode}
          selectedEntryIds={selectedEntryIds}
          allEntriesSelected={allEntriesSelected}
          filterTab={filterTab}
          setFilterTab={setFilterTab}
          filterSheetIsOpen={filterSheet.isOpen}
          onOpenFilterSheet={filterSheet.openFilterSheet}
          onEnterDeleteMode={() => { setDeleteMode(true); setSelectedEntryIds([]) }}
          onExitDeleteMode={exitDeleteMode}
          onSelectAll={handleSelectAllEntries}
          onDeleteSelected={handleDeleteSelected}
          activeFilterLabel={activeFilterLabel}
        />
        <GuideArchiveFilterSheet
          filterSheetPhase={filterSheet.filterSheetPhase}
          filterEnterAnimActive={filterSheet.filterEnterAnimActive}
          sheetPullY={filterSheet.sheetPullY}
          sheetPullDragging={filterSheet.sheetPullDragging}
          filterSheetPullZoneRef={filterSheet.filterSheetPullZoneRef}
          filterTab={filterTab}
          setFilterTab={setFilterTab}
          closeFilterSheet={filterSheet.closeFilterSheet}
          onPullStart={filterSheet.onPullStart}
          onPullEnd={filterSheet.onPullEnd}
          onPanelAnimEnd={filterSheet.onPanelAnimEnd}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-6 pb-24 md:px-8 md:pb-16">
        {loadStatus === 'loading' ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white/80 px-6 py-16 text-center md:rounded-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" aria-hidden />
            <p className="mt-4 text-sm font-semibold text-gray-700">체크리스트를 불러오는 중…</p>
          </div>
        ) : loadStatus === 'error' ? (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm md:rounded-2xl">
            <p className="mb-4 text-sm font-semibold text-red-500">체크리스트를 불러오지 못했습니다.</p>
            {loadError ? (
              <p className="mb-4 text-xs text-gray-500">{loadError}</p>
            ) : null}
            <button
              type="button"
              onClick={() => setReloadTick((n) => n + 1)}
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-teal-800"
            >
              다시 시도
            </button>
          </div>
        ) : !entries.length ? (
          <div className="rounded-3xl border border-dashed border-teal-200/60 bg-white/60 px-6 py-16 text-center md:rounded-2xl md:border-slate-200">
            <p className="mb-4 text-sm text-slate-600">아직 저장된 체크리스트가 없습니다.</p>
            <Link
              to="/trips/new/destination"
              className="inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-800"
            >
              여행 정보 입력하러 가기
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white/80 py-16 text-center text-sm text-slate-500 md:rounded-2xl">
            해당하는 체크리스트가 없습니다.
          </div>
        ) : (
          <ul className="flex flex-col gap-4 md:gap-3">
            {filtered.map(({ entry, progress, statusLabel }, index) => (
              <GuideArchiveEntryCard
                key={entry.id}
                entry={entry}
                tripId={tripId}
                progress={progress}
                statusLabel={statusLabel}
                index={index}
                deleteMode={deleteMode}
                isSelected={selectedEntryIds.includes(String(entry.id))}
                onToggleSelect={toggleEntrySelect}
                title={buildGuideArchiveListTitle(entry)}
                dateLine={buildGuideArchiveDateLine(entry)}
              />
            ))}
          </ul>
        )}

        {entries.length > 0 ? (
          <div className="mt-8 flex justify-center border-t border-slate-200/80 pt-8 md:mt-10 md:pt-10">
            <Link
              to="/trips/new/destination"
              className="inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-800"
            >
              여행 정보 입력하러 가기
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function TripGuideArchivePage() {
  const { id } = useParams()
  const location = useLocation()
  return <TripGuideArchiveInner key={`${id}-${location.key}`} tripId={id} />
}
