import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchGuideArchive } from '@/api/guideArchives'
import GuideArchiveChecklistView from '@/components/guide/GuideArchiveChecklistView'
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

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setErrorMessage('')
    ;(async () => {
      try {
        const found = await fetchGuideArchive(entryId)
        if (cancelled) return
        setEntry(found)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
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
      <div className="mx-auto flex w-full max-w-7xl items-center px-3 pt-4 md:px-6 md:pt-8 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/guide-archives')}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← 나의 체크리스트로
        </button>
      </div>
      <GuideArchiveChecklistView
        tripId={tripId}
        entry={entry}
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
