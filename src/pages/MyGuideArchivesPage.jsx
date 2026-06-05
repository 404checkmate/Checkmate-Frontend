import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fetchMyGuideArchives, deleteGuideArchive } from '@/api/guideArchives'
import { fetchReceivedTripInvites, respondTripInvite } from '@/api/tripMembers'
import ArchiveCard, { SkeletonCard } from '@/components/guide/ArchiveCard'
import ArchiveListControls from '@/components/guide/ArchiveListControls'
import DeleteConfirmModal from '@/components/guide/DeleteConfirmModal'
import { trackEvent } from '@/utils/analyticsTracker'

/** 받은 트립 초대 배너 — 수락하면 목록을 다시 불러온다 */
function ReceivedInvitesBanner({ invites, onResponded }) {
  const navigate = useNavigate()
  const [respondingKey, setRespondingKey] = useState(null)

  if (!invites || invites.length === 0) return null

  const respond = async (invite, action) => {
    if (respondingKey) return
    setRespondingKey(`${invite.tripId}-${action}`)
    try {
      const result = await respondTripInvite(invite.tripId, action)
      trackEvent(action === 'accept' ? 'trip_invite_accepted' : 'trip_invite_declined', {
        step: 'trip_join',
        via: 'direct',
        trip_id: invite.tripId,
      })
      if (action === 'accept' && result.archiveId) {
        navigate(`/trips/${result.tripId}/guide-archive/${result.archiveId}`)
        return
      }
      onResponded?.()
    } catch {
      onResponded?.()
    } finally {
      setRespondingKey(null)
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-2">
      {invites.map((invite) => (
        <div
          key={invite.tripId}
          className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-amber-950">
              💌 {invite.inviterNickname}님이 함께 준비하자고 초대했어요
            </p>
            <p className="mt-0.5 truncate text-xs text-amber-800/70">
              ✈️ {invite.tripTitle}
              {invite.tripStart ? ` · ${String(invite.tripStart).slice(0, 10)} 출발` : ''}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => respond(invite, 'accept')}
              disabled={Boolean(respondingKey)}
              className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              {respondingKey === `${invite.tripId}-accept` ? '수락 중…' : '수락'}
            </button>
            <button
              type="button"
              onClick={() => respond(invite, 'decline')}
              disabled={Boolean(respondingKey)}
              className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
            >
              거절
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F1F5F9 100%)',
}

export default function MyGuideArchivesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [archives, setArchives] = useState([])
  const [invites, setInvites] = useState([])
  const [status, setStatus] = useState('loading')
  const [filterTab, setFilterTab] = useState(location.state?.activeTab ?? 'not_started')
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const lastSavedId = sessionStorage.getItem('lastSavedArchiveId')

  const load = () => {
    setStatus('loading')
    fetchMyGuideArchives()
      .then((data) => {
        setArchives(Array.isArray(data) ? data : [])
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
    // 받은 트립 초대 — 실패해도 목록은 정상 노출
    fetchReceivedTripInvites()
      .then((rows) => setInvites(Array.isArray(rows) ? rows : []))
      .catch(() => setInvites([]))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    trackEvent('page_view', { page: 'guide_archives' })
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
    () =>
      sortedArchives.filter((a) => {
        const progress = a.snapshot?.checklistProgressPercent ?? a.completionRate ?? 0
        if (filterTab === 'not_started') return progress === 0
        if (filterTab === 'preparing') return progress > 0 && progress < 100
        if (filterTab === 'completed') return progress >= 100
        if (filterTab === 'shared') return Boolean(a.shared) // 공동 편집 중
        return false
      }),
    [sortedArchives, filterTab],
  )

  const allSelected = useMemo(
    () => filtered.length > 0 && filtered.every((a) => selectedIds.includes(String(a.id))),
    [filtered, selectedIds],
  )

  const toggleSelect = (archiveId) => {
    const id = String(archiveId)
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      const filteredIds = filtered.map((a) => String(a.id))
      return filteredIds.every((id) => prev.includes(id)) ? [] : filteredIds
    })
  }

  const exitDeleteMode = () => {
    setDeleteMode(false)
    setSelectedIds([])
  }

  const confirmDelete = async () => {
    setDeleteConfirmOpen(false)
    await Promise.all(selectedIds.map((id) => deleteGuideArchive(id)))
    exitDeleteMode()
    load()
  }

  return (
    <>
      <div className="min-h-screen" style={PAGE_BG}>
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-16 md:pt-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="홈으로"
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-white/60 active:bg-white/80 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">My Checklists</p>
          <h1 className="mb-4 text-2xl font-extrabold text-slate-900 md:text-3xl">내 체크리스트</h1>

          <ReceivedInvitesBanner invites={invites} onResponded={load} />

          <ArchiveListControls
            filterTab={filterTab}
            onTabChange={(tabId) => { setFilterTab(tabId); setSelectedIds([]) }}
            deleteMode={deleteMode}
            hasArchives={archives.length > 0}
            allSelected={allSelected}
            selectedCount={selectedIds.length}
            onEnterDeleteMode={() => { setDeleteMode(true); setSelectedIds([]) }}
            onSelectAll={handleSelectAll}
            onDeleteSelected={() => { if (selectedIds.length > 0) setDeleteConfirmOpen(true) }}
            onExitDeleteMode={exitDeleteMode}
          />

          {status === 'loading' && (
            <ul className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i}><SkeletonCard /></li>
              ))}
            </ul>
          )}

          {status === 'error' && (
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
              <p className="mb-4 text-sm font-semibold text-red-500">체크리스트를 불러오지 못했습니다.</p>
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

      <DeleteConfirmModal
        open={deleteConfirmOpen}
        count={selectedIds.length}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </>
  )
}
