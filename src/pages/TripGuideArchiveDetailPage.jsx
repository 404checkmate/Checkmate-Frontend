import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { fetchGuideArchive } from '@/api/guideArchives'
import { getTrip } from '@/api/trips'
import GuideArchiveChecklistView from '@/components/guide/GuideArchiveChecklistView'
import TripMembersSheet from '@/components/trip/TripMembersSheet'
import { useTripRealtimeSync } from '@/hooks/useTripRealtimeSync'
import { TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE } from '@/utils/tripMintPageBackground'

/**
 * 라우트: /trips/:id/guide-archive/:entryId
 * - 목록(TripGuideArchivePage) 또는 MyGuideArchivesPage 의 카드에서 진입.
 * - entryId 는 서버 GuideArchive.id (BigInt 문자열).
 * - GET /guide-archives/:archiveId 단건 엔드포인트로 직접 조회.
 */

function TripGuideArchiveDetailInner({ tripId, entryId }) {
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  /** 'loading' | 'ready' | 'not_found' | 'error' */
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  /** 상세에서 mutate(삭제·저장) 후 다시 읽기 위한 트리거 */
  const [archiveRevision, setArchiveRevision] = useState(0)
  const [tripCompanions, setTripCompanions] = useState([])
  const [tripStyles, setTripStyles] = useState([])
  const [membersOpen, setMembersOpen] = useState(false)
  const [remoteNotice, setRemoteNotice] = useState('')
  // syncTick: 모든 원격 변경에서 증가 → 서버 체크/멤버 상태를 가볍게 다시 읽는다 (스피너 없음).
  // archiveRevision 과 분리해, 단순 체크 핑이 무거운 아카이브 재조회를 유발하지 않게 한다.
  const [syncTick, setSyncTick] = useState(0)

  // 공동 편집 실시간 동기화 — 다른 멤버의 변경 핑 수신.
  // C(디바운스): 연속 핑을 500ms 윈도우로 합쳐 한 번만 반영 (연타 시 재조회 폭주 방지).
  // B(종류 분기): 'check' 핑은 syncTick(체크 병합)만, 'edit'/'archive' 는 아카이브 재조회까지.
  const remoteResyncTimerRef = useRef(null)
  const pendingRemoteRef = useRef({ needsArchive: false, by: null })
  useTripRealtimeSync({
    tripId,
    onRemoteChange: (meta) => {
      if (meta?.kind && meta.kind !== 'check') pendingRemoteRef.current.needsArchive = true
      if (meta?.by) pendingRemoteRef.current.by = meta.by
      if (remoteResyncTimerRef.current) return // 이번 윈도우 이미 예약됨 — 누적만 하고 끝
      remoteResyncTimerRef.current = window.setTimeout(() => {
        remoteResyncTimerRef.current = null
        const { needsArchive, by } = pendingRemoteRef.current
        pendingRemoteRef.current = { needsArchive: false, by: null }
        setSyncTick((n) => n + 1)
        if (needsArchive) setArchiveRevision((n) => n + 1)
        const who = by ? `${by}님이` : '함께 준비 중인 멤버가'
        setRemoteNotice(`${who} 체크리스트를 수정했어요`)
        window.clearTimeout(window.__cmRemoteNoticeTimer)
        window.__cmRemoteNoticeTimer = window.setTimeout(() => setRemoteNotice(''), 3000)
      }, 500)
    },
  })
  // 언마운트 시 디바운스 타이머 정리 (setState-after-unmount 방지)
  useEffect(() => () => {
    if (remoteResyncTimerRef.current) window.clearTimeout(remoteResyncTimerRef.current)
  }, [])

  useEffect(() => {
    if (!tripId) return
    let cancelled = false
    getTrip(tripId)
      .then((trip) => {
        if (cancelled) return
        if (trip?.companions?.length > 0) {
          setTripCompanions(trip.companions.map((c) => c.companionType?.labelKo).filter(Boolean))
        }
        if (trip?.travelStyles?.length > 0) {
          setTripStyles(trip.travelStyles.map((s) => s.travelStyle?.labelKo).filter(Boolean))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [tripId])

  // 이미 한 번 성공적으로 로드한 entryId 를 기억한다.
  // 같은 entryId 에서 archiveRevision 만 바뀌어 재실행되면 = 공동 편집 핑에 의한 백그라운드 재동기화
  // → 풀스크린 로딩 스피너로 전환하지 않고 entry 만 조용히 교체한다 (화면 깜빡임 = "새로고침" 체감 제거).
  const loadedEntryIdRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const isBackgroundResync = loadedEntryIdRef.current === entryId
    if (!isBackgroundResync) {
      setStatus('loading')
      setErrorMessage('')
    }
    ;(async () => {
      try {
        const found = await fetchGuideArchive(entryId)
        if (cancelled) return
        setEntry(found)
        setStatus('ready')
        loadedEntryIdRef.current = entryId
      } catch (err) {
        if (cancelled) return
        // 백그라운드 재동기화 실패는 현재 화면을 유지한다 — 다음 핑/재진입 때 다시 동기화된다.
        if (isBackgroundResync) return
        setEntry(null)
        if (err?.response?.status === 404) {
          setStatus('not_found')
        } else {
          setStatus('error')
          setErrorMessage(err?.response?.data?.message || err?.message || '알 수 없는 오류')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [entryId, archiveRevision])

  if (status === 'loading') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" aria-hidden />
        <p className="mt-4 text-sm font-semibold text-gray-700">체크리스트를 불러오는 중…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE}
      >
        <p className="text-gray-700 font-medium mb-2">체크리스트를 불러오지 못했어요.</p>
        <p className="text-sm text-gray-500 mb-6 text-center">{errorMessage || '잠시 후 다시 시도해 주세요.'}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setArchiveRevision((n) => n + 1)}
            className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold px-6 py-3"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => navigate('/guide-archives')}
            className="rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold px-6 py-3"
          >
            리스트 보관함으로
          </button>
        </div>
      </div>
    )
  }

  if (status === 'not_found' || !entry) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE}
      >
        <p className="text-gray-700 font-medium mb-2">저장된 리스트를 찾을 수 없습니다.</p>
        <p className="text-sm text-gray-500 mb-6 text-center">목록에서 삭제되었거나 다른 기기에서만 저장된 경우일 수 있습니다.</p>
        <button
          type="button"
          onClick={() => navigate('/guide-archives')}
          className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold px-6 py-3"
        >
          리스트 보관함으로
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 pt-4 md:px-6 md:pt-8 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/guide-archives')}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← 나의 체크리스트로
        </button>
        {/* 트립이 있는 엔트리에서만 공동 편집 제공 (큐레이션 저장 등 트립 미연결 제외) */}
        {tripId && /^\d+$/.test(String(tripId)) && (
          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            className="rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm transition hover:bg-teal-50"
          >
            👥 함께 준비하기
          </button>
        )}
      </div>
      <TripMembersSheet tripId={tripId} open={membersOpen} onClose={() => setMembersOpen(false)} />
      {/* 실시간 변경 토스트 */}
      {remoteNotice && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-[90] -translate-x-1/2 rounded-full bg-teal-900/90 px-4 py-2 text-xs font-bold text-white shadow-lg">
          🔄 {remoteNotice}
        </div>
      )}
      <GuideArchiveChecklistView
        tripId={tripId}
        entry={entry}
        syncTick={syncTick}
        companions={entry?.via === 'curation' ? [] : tripCompanions}
        travelStyles={entry?.via === 'curation' ? [] : tripStyles}
        onArchiveMutated={() => setArchiveRevision((n) => n + 1)}
      />
    </div>
  )
}

export default function TripGuideArchiveDetailPage() {
  const { id, entryId } = useParams()
  const location = useLocation()
  if (!entryId) return <Navigate to="/guide-archives" replace />
  return <TripGuideArchiveDetailInner key={`${id}-${entryId}-${location.key}`} tripId={id} entryId={entryId} />
}
