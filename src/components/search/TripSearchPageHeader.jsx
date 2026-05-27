export default function TripSearchPageHeader({
  pageMainTitle,
  headerDateLine,
  companions = [],
  travelStyles = [],
  archiveTargetMissing,
  loadState,
  via,
}) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-gray-900 md:text-3xl">
        {pageMainTitle}
      </h1>
      <p className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-700 md:text-lg">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal-600 md:h-2.5 md:w-2.5"
          aria-hidden
        />
        {headerDateLine}
      </p>

      {via === 'curation' ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1.5 text-sm font-bold text-amber-900 shadow-sm">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            큐레이션
          </span>
        </div>
      ) : (companions.length > 0 || travelStyles.length > 0) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {companions.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full bg-teal-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-sm"
            >
              {label}
            </span>
          ))}
          {travelStyles.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full bg-slate-700 px-3.5 py-1.5 text-sm font-bold text-white shadow-sm"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {archiveTargetMissing ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          연결된 체크리스트를 찾을 수 없어 일반 검색으로 표시합니다. 보관함에서 다시 들어와 주세요.
        </p>
      ) : null}

      {loadState.status === 'fallback' ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          맞춤 추천 데이터를 불러오지 못했습니다. 임시로 예시 데이터를 표시합니다. (서버 연결·로그인 상태를 확인해 주세요)
        </p>
      ) : null}

    </header>
  )
}
