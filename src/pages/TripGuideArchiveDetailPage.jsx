import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { getGuideArchiveEntry } from '@/utils/guideArchiveStorage'
import GuideArchiveChecklistView from '@/components/guide/GuideArchiveChecklistView'
import { TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE } from '@/utils/tripMintPageBackground'

/**
 * 라우트: /trips/:id/guide-archive/:entryId
 * - 목록(TripGuideArchivePage)에서 저장된 여행 스냅샷을 누르면 진입
 * - 검색에서 담은 필수품(entry.items)을 이 화면에서 하나씩 체크하며 준비 (상태는 entry 단위로 분리 저장)
 */

function TripGuideArchiveDetailInner({ tripId, entryId }) {
  const navigate = useNavigate()
  /** 상세에서 준비물 삭제(patch) 후 목록을 스토리지에서 다시 읽기 위해 */
  const [archiveRevision, setArchiveRevision] = useState(0)
  const entry = useMemo(
    () => getGuideArchiveEntry(tripId, entryId),
    [tripId, entryId, archiveRevision],
  )
  const entryForView = useMemo(() => {
    if (!entry) return entry
    return entry
  }, [entry])

  if (!entryForView) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE}
      >
        <p className="text-gray-700 font-medium mb-2">저장된 리스트를 찾을 수 없습니다.</p>
        <p className="text-sm text-gray-500 mb-6 text-center">목록에서 삭제되었거나 다른 기기에서만 저장된 경우일 수 있습니다.</p>
        <button
          type="button"
          onClick={() => navigate(`/trips/${tripId}/guide-archive`)}
          className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold px-6 py-3"
        >
          리스트 보관함으로
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={TRIP_GUIDE_ARCHIVE_PAGE_BACKGROUND_STYLE}>
      {/* Header.jsx 와 동일: max-w-7xl + px-3 md:px-6 lg:px-8 → 로고·뒤로가기 왼선 일치 */}
      <div className="mx-auto flex w-full max-w-7xl items-center px-3 pt-4 md:px-6 md:pt-8 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(`/trips/${tripId}/guide-archive`)}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← 나의 체크리스트로
        </button>
      </div>
      <GuideArchiveChecklistView
        tripId={tripId}
        entry={entryForView}
        onArchiveMutated={() => setArchiveRevision((n) => n + 1)}
      />
    </div>
  )
}

export default function TripGuideArchiveDetailPage() {
  const { id, entryId } = useParams()
  const location = useLocation()
  return <TripGuideArchiveDetailInner key={`${id}-${entryId}-${location.key}`} tripId={id} entryId={entryId} />
}
