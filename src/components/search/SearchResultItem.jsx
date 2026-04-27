import AiSparkleMaskIcon from './AiSparkleMaskIcon'

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2 5 8.7 9.5 3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function SearchResultItem({
  item,
  selected,
  onToggle,
  inArchiveAlready = false,
  aiRecommended = false,
  className = '',
}) {
  const subtitleText = item.description || item.detail || ''

  if (inArchiveAlready) {
    const archivedShellClass = aiRecommended
      ? 'w-full rounded-2xl border-2 border-violet-200 bg-violet-50/60 p-4 text-left shadow-sm'
      : 'w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-left shadow-sm'
    const archivedCheckClass = aiRecommended
      ? 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-violet-300 bg-violet-100'
      : 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-amber-300 bg-amber-100'
    const archivedCheckIconClass = aiRecommended ? 'h-3 w-3 text-violet-800' : 'h-3 w-3 text-amber-800'
    return (
      <div
        className={`${archivedShellClass} ${className}`.trim()}
        role="group"
        aria-label="이미 이 체크리스트에 담긴 항목"
      >
        <div className="flex gap-3">
          <span className={archivedCheckClass} aria-hidden>
            <CheckIcon className={archivedCheckIconClass} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-extrabold leading-snug text-gray-900">{item.title}</span>
              {aiRecommended ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-800">
                  <AiSparkleMaskIcon selected={false} className="h-3 w-3" />
                  MATE 추천
                </span>
              ) : null}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  aiRecommended ? 'bg-violet-200/90 text-violet-950' : 'bg-amber-200/90 text-amber-950'
                }`}
              >
                담김
              </span>
            </p>
            {subtitleText ? (
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{subtitleText}</p>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const btnShell = selected
    ? aiRecommended
      ? 'w-full cursor-pointer rounded-2xl border-2 border-violet-400 bg-violet-100/95 p-4 text-left shadow-sm ring-1 ring-violet-300/70 transition-all duration-200'
      : 'w-full cursor-pointer rounded-2xl border-2 border-amber-400 bg-amber-200/95 p-4 text-left shadow-sm ring-1 ring-amber-300/70 transition-all duration-200'
    : aiRecommended
      ? 'w-full cursor-pointer rounded-2xl border-2 border-violet-100 bg-violet-50/50 p-4 text-left shadow-sm transition-all duration-200 hover:bg-violet-50'
      : 'w-full cursor-pointer rounded-2xl border-2 border-gray-100 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:bg-gray-50'

  const checkShell = selected
    ? aiRecommended ? 'border-violet-600 bg-violet-600' : 'border-amber-600 bg-amber-600'
    : 'border-gray-300 bg-white'

  return (
    <button type="button" onClick={onToggle} aria-pressed={selected} className={`${btnShell} ${className}`.trim()}>
      <div className="flex gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${checkShell}`}
          aria-hidden
        >
          {selected ? <CheckIcon className="h-3 w-3 text-white" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold leading-snug text-gray-900">
            <span>{item.title}</span>
            {aiRecommended ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-800">
                <AiSparkleMaskIcon selected={false} className="h-3 w-3" />
                MATE 추천
              </span>
            ) : null}
          </p>
          {subtitleText ? (
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{subtitleText}</p>
          ) : null}
        </div>
      </div>
    </button>
  )
}
