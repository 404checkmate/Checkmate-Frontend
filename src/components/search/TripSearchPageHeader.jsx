import AiSparkleMaskIcon from './AiSparkleMaskIcon'

export default function TripSearchPageHeader({
  mergeToArchive,
  pageMainTitle,
  headerDateLine,
  headerDescription,
  archiveTargetMissing,
  loadState,
  apiSummary,
  aiRecommendCount,
  totalItemCount,
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
      <p className="mt-4 text-sm leading-relaxed text-gray-600">{headerDescription}</p>

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

      {loadState.status === 'ready' && apiSummary ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 md:text-sm">
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-semibold text-violet-800">
            <AiSparkleMaskIcon selected={false} className="h-3.5 w-3.5" />
            AI 맞춤 추천 <span className="tabular-nums">{aiRecommendCount}</span>개
          </span>
          <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 font-semibold text-cyan-800">
            카테고리 필수품 <span className="ml-1 tabular-nums">{Math.max(0, totalItemCount - aiRecommendCount)}</span>개
          </span>
          {apiSummary.model ? (
            <span className="text-[11px] text-slate-400 md:text-xs">모델 {apiSummary.model}</span>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}
