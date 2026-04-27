import { Link } from 'react-router-dom'
import GuideArchiveProgressBar from './GuideArchiveProgressBar'

function CalendarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 7V5m8 2V5m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function GuideArchiveEntryCard({
  entry,
  tripId,
  progress,
  statusLabel,
  index,
  deleteMode,
  isSelected,
  onToggleSelect,
  title,
  dateLine,
}) {
  const mobileTint = index % 2 === 0 ? 'bg-sky-100/90' : 'bg-emerald-50/95'
  const badgeClass =
    progress >= 100
      ? 'bg-teal-700 text-white'
      : progress <= 0
        ? 'bg-slate-200 text-slate-800 ring-1 ring-slate-300/80'
        : 'bg-sky-100 text-sky-800 ring-1 ring-sky-200/80'

  const shellClass = `block w-full overflow-hidden md:rounded-xl md:border md:border-slate-100 md:bg-white md:p-0 md:shadow-sm ${mobileTint} rounded-3xl md:bg-white ${
    deleteMode && isSelected ? 'ring-2 ring-teal-500 ring-offset-2' : ''
  } ${deleteMode ? 'cursor-pointer' : 'transition-shadow md:hover:border-sky-200 md:hover:shadow-md'}`

  const cardInner = (
    <>
      {/* 모바일 카드 */}
      <div className="p-5 text-[#0a3d3d] md:hidden">
        <p className="text-lg font-bold leading-snug">{title}</p>
        <div className="mt-3 flex items-start gap-2 text-sm font-medium text-teal-900/75">
          <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
          <span>{dateLine}</span>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm font-semibold">
          <span>{statusLabel}</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="mt-2">
          <GuideArchiveProgressBar value={progress} />
        </div>
      </div>

      {/* 웹 카드 */}
      <div className="hidden gap-6 px-6 py-5 md:flex md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-lg font-extrabold text-slate-900">{title}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">{dateLine}</p>
        </div>

        <div className="w-full max-w-md flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>준비 진행도</span>
            <span className="tabular-nums text-slate-800">{progress}%</span>
          </div>
          <GuideArchiveProgressBar value={progress} />
        </div>

        {!deleteMode ? (
          <div className="flex shrink-0 text-slate-400 transition-colors group-hover:text-sky-600">
            <ChevronRightIcon />
          </div>
        ) : (
          <div className="w-5 shrink-0" aria-hidden />
        )}
      </div>
    </>
  )

  const cardBlock = deleteMode ? (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${title} ${isSelected ? '선택됨' : '선택 안 됨'}. 클릭하면 선택이 바뀝니다.`}
      onClick={() => onToggleSelect(entry.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggleSelect(entry.id)
        }
      }}
      className={shellClass}
    >
      {cardInner}
    </div>
  ) : (
    <Link to={`/trips/${tripId}/guide-archive/${entry.id}`} className={`group ${shellClass}`}>
      {cardInner}
    </Link>
  )

  return (
    <li key={entry.id}>
      {deleteMode ? (
        <div className="flex gap-3">
          <div className="flex shrink-0 items-center pt-1 md:items-center md:pt-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(entry.id)}
              className="h-5 w-5 rounded border-gray-300 accent-teal-600"
              aria-label={`${title} 선택`}
            />
          </div>
          <div className="min-w-0 flex-1">{cardBlock}</div>
        </div>
      ) : (
        cardBlock
      )}
    </li>
  )
}
