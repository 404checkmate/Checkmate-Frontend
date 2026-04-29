import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyGuideArchives, deleteGuideArchive } from '@/api/guideArchives'
import GuideArchiveProgressBar from '@/components/guide/GuideArchiveProgressBar'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F1F5F9 100%)',
}

const STATUS_TABS = [
  { id: 'not_started', label: '시작 전' },
  { id: 'preparing', label: '준비 중' },
  { id: 'completed', label: '완료' },
]

const STATUS_LABEL = {
  not_started: '시작 전',
  preparing: '준비 중',
  completed: '완료',
}

function formatDate(isoOrDate) {
  if (!isoOrDate) return ''
  const s = String(isoOrDate).slice(0, 10)
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(new Date(s))
      .replace(/\. /g, '.')
      .replace(/\.$/, '')
  } catch {
    return s
  }
}

function formatDateRange(start, end) {
  if (!start && !end) return ''
  if (!end) return formatDate(start)
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

function ArchiveCard({ archive, deleteMode, isSelected, onToggleSelect, isHighlighted }) {
  const statusLabel = STATUS_LABEL[archive.checklistStatus] ?? archive.checklistStatus
  const progress = archive.completionRate ?? 0
  const dateLine = formatDateRange(archive.trip?.tripStart, archive.trip?.tripEnd)

  const cardContent = (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition md:p-5 ${
        isHighlighted
          ? 'border-teal-400 ring-2 ring-teal-400 ring-offset-1'
          : deleteMode && isSelected
            ? 'border-teal-200 ring-2 ring-teal-500 ring-offset-2'
            : 'border-slate-100'
      } ${!deleteMode ? 'hover:shadow-md active:scale-[0.99]' : ''}`}
    >
      {isHighlighted && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 ring-1 ring-teal-200">
          방금 저장됨
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900">{archive.name}</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-teal-700">
            {archive.trip?.title}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {archive.isAiRecommended && (
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-600 ring-1 ring-teal-200">
              mate 추천
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              progress >= 100
                ? 'bg-teal-700 text-white'
                : progress <= 0
                  ? 'bg-slate-200 text-slate-800 ring-1 ring-slate-300/80'
                  : 'bg-sky-100 text-sky-800 ring-1 ring-sky-200/80'
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {dateLine && (
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <dd>{dateLine}</dd>
          </div>
        </dl>
      )}

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>준비 진행도</span>
          <span className="tabular-nums text-slate-800">{Math.round(progress)}%</span>
        </div>
        <GuideArchiveProgressBar value={progress} />
      </div>
    </div>
  )

  if (deleteMode) {
    return (
      <li>
        <div className="flex gap-3">
          <div className="flex shrink-0 items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(archive.id)}
              className="h-5 w-5 rounded border-gray-300 accent-teal-600"
              aria-label={`${archive.name} 선택`}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onToggleSelect(archive.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggleSelect(archive.id)
              }
            }}
            className="min-w-0 flex-1 cursor-pointer"
          >
            {cardContent}
          </div>
        </div>
      </li>
    )
  }

  return (
    <li>
      <Link to={`/trips/${archive.trip?.id}/guide-archive/${archive.id}`}>
        {cardContent}
      </Link>
    </li>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded bg-slate-200" />
          <div className="h-3 w-2/5 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-3 flex gap-4">
        <div className="h-3 w-28 rounded bg-slate-100" />
        <div className="h-3 w-20 rounded bg-slate-100" />
      </div>
      <div className="mt-3 h-2 w-full rounded bg-slate-100" />
    </div>
  )
}

export default function MyGuideArchivesPage() {
  const [archives, setArchives] = useState([])
  const [status, setStatus] = useState('loading')
  const [filterTab, setFilterTab] = useState('not_started')
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const lastSavedId = sessionStorage.getItem('lastSavedArchiveId')

  const load = () => {
    setStatus('loading')
    fetchMyGuideArchives()
      .then((data) => {
        setArchives(Array.isArray(data) ? data : [])
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (archives.length === 0) {
      setDeleteMode(false)
      setSelectedIds([])
    }
  }, [archives.length])

  const sortedArchives = useMemo(() => {
    if (!lastSavedId) return archives
    const highlighted = archives.find((a) => String(a.id) === String(lastSavedId))
    if (!highlighted) return archives
    return [highlighted, ...archives.filter((a) => String(a.id) !== String(lastSavedId))]
  }, [archives, lastSavedId])

  const filtered = useMemo(
    () => sortedArchives.filter((a) => a.checklistStatus === filterTab),
    [sortedArchives, filterTab],
  )

  const allSelected = useMemo(
    () => archives.length > 0 && archives.every((a) => selectedIds.includes(String(a.id))),
    [archives, selectedIds],
  )

  const toggleSelect = (archiveId) => {
    const id = String(archiveId)
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      const allIds = archives.map((a) => String(a.id))
      return allIds.every((id) => prev.includes(id)) ? [] : allIds
    })
  }

  const exitDeleteMode = () => {
    setDeleteMode(false)
    setSelectedIds([])
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`선택한 ${selectedIds.length}개 항목을 삭제할까요? 되돌릴 수 없습니다.`)) return
    await Promise.all(selectedIds.map((id) => deleteGuideArchive(id)))
    exitDeleteMode()
    load()
  }

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-16 md:pt-10">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">
          My Checklists
        </p>
        <h1 className="mb-4 text-2xl font-extrabold text-slate-900 md:text-3xl">
          내 체크리스트
        </h1>

        {/* 탭 + 삭제 컨트롤 */}
        <div className="mb-6 flex w-full items-center gap-2">
          <div
            className="inline-flex gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
            role="tablist"
            aria-label="체크리스트 필터"
          >
            {STATUS_TABS.map((tab) => {
              const active = filterTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilterTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors md:px-6 md:py-2.5 ${
                    active
                      ? 'bg-sky-100 text-sky-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {archives.length > 0 && !deleteMode && (
            <button
              type="button"
              onClick={() => {
                setDeleteMode(true)
                setSelectedIds([])
              }}
              className="ml-auto shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition-colors hover:bg-red-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
            >
              삭제
            </button>
          )}

          {archives.length > 0 && deleteMode && (
            <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
              >
                {allSelected ? '전체 해제' : '전체선택'}
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className="rounded-lg border border-red-300 bg-red-50 px-2 py-2 text-[11px] font-bold text-red-800 shadow-sm transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
              >
                선택한 목록 삭제
              </button>
              <button
                type="button"
                onClick={exitDeleteMode}
                className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
              >
                취소
              </button>
            </div>
          )}
        </div>

        {status === 'loading' && (
          <ul className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <SkeletonCard />
              </li>
            ))}
          </ul>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
            <p className="mb-4 text-sm font-semibold text-red-500">
              체크리스트를 불러오지 못했습니다.
            </p>
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-teal-800"
            >
              다시 시도
            </button>
          </div>
        )}

        {status === 'idle' && archives.length === 0 && (
          <div className="rounded-3xl border border-dashed border-teal-200/60 bg-white/60 px-6 py-16 text-center md:rounded-2xl md:border-slate-200">
            <p className="mb-4 text-sm text-slate-600">아직 저장된 체크리스트가 없습니다.</p>
            <Link
              to="/trips/new/destination"
              className="inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-800"
            >
              여행 정보 입력하러 가기
            </Link>
          </div>
        )}

        {status === 'idle' && archives.length > 0 && filtered.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white/80 py-16 text-center text-sm text-slate-500 md:rounded-2xl">
            해당하는 체크리스트가 없습니다.
          </div>
        )}

        {status === 'idle' && archives.length > 0 && filtered.length > 0 && (
          <>
            <ul className="flex flex-col gap-3">
              {filtered.map((archive) => (
                <ArchiveCard
                  key={archive.id}
                  archive={archive}
                  deleteMode={deleteMode}
                  isSelected={selectedIds.includes(String(archive.id))}
                  onToggleSelect={toggleSelect}
                  isHighlighted={lastSavedId != null && String(archive.id) === String(lastSavedId)}
                />
              ))}
            </ul>
            <div className="mt-8 flex justify-center border-t border-slate-200/80 pt-8 md:mt-10 md:pt-10">
              <Link
                to="/trips/new/destination"
                className="inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-800"
              >
                새 여행 준비하기
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
