import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyGuideArchives } from '@/api/guideArchives'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #E0F7FA 0%, #F8FAFC 55%, #F1F5F9 100%)',
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(new Date(iso))
      .replace(/\. /g, '.')
      .replace(/\.$/, '')
  } catch {
    return iso.slice(0, 10)
  }
}

function formatDateRange(start, end) {
  if (!start && !end) return ''
  if (!end) return formatDate(start)
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

function ArchiveCard({ archive }) {
  return (
    <Link
      to={`/trips/${archive.trip.id}/guide-archive/${archive.id}`}
      className="block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md active:scale-[0.99] md:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900">{archive.name}</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-teal-700">
            {archive.trip.title}
          </p>
        </div>
        {archive.isAiRecommended && (
          <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-600 ring-1 ring-teal-200">
            mate 추천
          </span>
        )}
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {(archive.trip.tripStart || archive.trip.tripEnd) && (
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <dd>{formatDateRange(archive.trip.tripStart, archive.trip.tripEnd)}</dd>
          </div>
        )}
        <div className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <dd>저장 {formatDate(archive.archivedAt)}</dd>
        </div>
      </dl>
    </Link>
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
    </div>
  )
}

export default function MyGuideArchivesPage() {
  const [archives, setArchives] = useState([])
  const [status, setStatus] = useState('loading')

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

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-16 md:pt-10">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">
          My Checklists
        </p>
        <h1 className="mb-6 text-2xl font-extrabold text-slate-900 md:text-3xl">
          내 체크리스트
        </h1>

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

        {status === 'idle' && archives.length > 0 && (
          <>
            <ul className="flex flex-col gap-3">
              {archives.map((archive) => (
                <li key={archive.id}>
                  <ArchiveCard archive={archive} />
                </li>
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
