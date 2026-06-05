import { Link } from 'react-router-dom'
import GuideArchiveProgressBar from '@/components/guide/GuideArchiveProgressBar'
import defaultProfileImg from '@/assets/default-profile.png'

/** 공동 편집 표시 — 아바타 스택 + "OO님과 함께" 한 줄 */
function SharedRow({ shared }) {
  if (!shared) return null
  const { isOwner, memberCount, ownerNickname, others } = shared
  const first = others?.[0]?.nickname
  const label = isOwner
    ? `${first ?? '친구'}${memberCount > 2 ? ` 외 ${memberCount - 2}명` : ''}님과 함께 준비 중`
    : `${ownerNickname}님의 여행 · 함께 준비 중`
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex -space-x-2">
        {(others ?? []).slice(0, 3).map((p, i) => (
          <img
            key={`${p.nickname}-${i}`}
            src={p.profileImageUrl || defaultProfileImg}
            alt={p.nickname}
            referrerPolicy="no-referrer"
            className="h-5 w-5 rounded-full border-2 border-white object-cover"
            onError={(e) => { e.currentTarget.src = defaultProfileImg }}
          />
        ))}
      </div>
      <span className="truncate text-[11px] font-bold text-teal-700">👥 {label}</span>
    </div>
  )
}

function formatDate(isoOrDate) {
  if (!isoOrDate) return ''
  const s = String(isoOrDate).slice(0, 10)
  try {
    return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
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

export function SkeletonCard() {
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

export default function ArchiveCard({ archive, deleteMode, isSelected, onToggleSelect, isHighlighted }) {
  const progress = archive.snapshot?.checklistProgressPercent ?? archive.completionRate ?? 0
  const isCuration = archive.snapshot?.via === 'curation'
  const dateLine = isCuration ? '' : formatDateRange(archive.trip?.tripStart, archive.trip?.tripEnd)

  const cardContent = (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition md:p-5 ${
        isHighlighted
          ? 'border-teal-400 ring-2 ring-teal-400 ring-offset-1'
          : deleteMode && isSelected
            ? 'border-teal-200 ring-2 ring-teal-500 ring-offset-2'
            : archive.shared
              ? 'border-teal-200/80' // 공동 편집 — 옅은 틸 보더로 구분
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
          <p className="mt-0.5 truncate text-sm font-semibold text-teal-700">{archive.trip?.title}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {archive.isAiRecommended && (
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-600 ring-1 ring-teal-200">
              mate 추천
            </span>
          )}
        </div>
      </div>

      <SharedRow shared={archive.shared} />

      {dateLine && (
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
