import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { fetchMyGuideArchives } from '@/api/guideArchives'
import { formatTripNightsDaysLabel } from '@/utils/tripDateFormat'

function formatKoreanFullDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${y}년 ${m}월 ${d}일`
}

function formatArchiveDate(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit' })
      .format(new Date(iso))
      .replace(/\.+\s*$/, '')
  } catch {
    return ''
  }
}

function ChecklistCard({ archive }) {
  const progress = archive.snapshot?.checklistProgressPercent ?? archive.completionRate ?? 0
  const tripId = archive.trip?.id
  const to = tripId ? `/trips/${tripId}/guide-archive/${archive.id}` : '/guide-archives'

  const snap = archive.snapshot ?? {}
  const country = snap.country
  const nightsDays = formatTripNightsDaysLabel(snap.tripStartDate, snap.tripEndDate)
  const mainText =
    country && nightsDays ? `${country} ${nightsDays}` : archive.trip?.title ?? archive.name ?? ''
  const subText = formatKoreanFullDate(snap.tripStartDate)

  return (
    <Link
      to={to}
      className="flex w-44 shrink-0 flex-col gap-2 overflow-hidden rounded-2xl bg-white p-3.5 shadow-sm shadow-gray-200/60 transition-all active:scale-[0.97]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-[#04384a]">{mainText}</p>
        {subText && (
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[#3db4dd]">{subText}</p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-gray-500">
          <span>진행도</span>
          <span className="tabular-nums text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-[#3db4dd] transition-all"
            style={{ width: `${Math.min(100, Math.round(progress))}%` }}
          />
        </div>
      </div>

      {archive.archivedAt && (
        <p className="text-[10px] text-gray-400">작성일: {formatArchiveDate(archive.archivedAt)}</p>
      )}
    </Link>
  )
}

function ChecklistCardSkeleton() {
  return (
    <div className="flex w-44 shrink-0 flex-col gap-2 rounded-2xl bg-white p-3.5 shadow-sm shadow-gray-200/60">
      <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
      <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100" />
    </div>
  )
}

export default function MyChecklistsSection() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [archives, setArchives] = useState([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    setFetching(true)
    fetchMyGuideArchives()
      .then((data) => {
        const list = Array.isArray(data?.archives) ? data.archives : Array.isArray(data) ? data : []
        setArchives(
          [...list]
            .sort((a, b) => new Date(b.archivedAt ?? 0) - new Date(a.archivedAt ?? 0))
            .slice(0, 10),
        )
      })
      .catch(() => setArchives([]))
      .finally(() => setFetching(false))
  }, [isLoggedIn])

  if (authLoading || !isLoggedIn) return null

  const hasArchives = !fetching && archives.length > 0

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#04384a]">내 체크리스트</h2>
        {hasArchives && (
          <Link
            to="/guide-archives"
            className="text-xs font-semibold text-[#3db4dd] transition-colors hover:text-teal-600"
          >
            자세히
          </Link>
        )}
      </div>

      {fetching && (
        <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[0, 1, 2].map((i) => <ChecklistCardSkeleton key={i} />)}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      )}

      {!fetching && !hasArchives && (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-white px-5 py-6 shadow-sm shadow-gray-200/60">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
            <svg className="h-5 w-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </span>
          <div className="text-center">
            <p className="text-sm font-bold text-[#04384a]">저장된 체크리스트가 없어요</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              여행을 준비하고 체크리스트를 저장하면<br />여기서 바로 확인할 수 있어요
            </p>
          </div>
        </div>
      )}

      {hasArchives && (
        <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {archives.map((archive) => <ChecklistCard key={archive.id} archive={archive} />)}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      )}
    </section>
  )
}
