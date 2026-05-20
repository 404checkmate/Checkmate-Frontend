export default function SectionHeaderWithHint({ title, showHint }) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-teal-100/90 pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <h2 className="flex min-w-0 items-center gap-2 text-base font-extrabold tracking-tight text-[#0a3d3d]">
        {title}
      </h2>
      {showHint ? (
        <>
          {/* 모바일: 드래그 + 스와이프 두 힌트를 칩 형태로 */}
          <div className="flex flex-wrap gap-2 sm:hidden" role="note" aria-label="사용 방법">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
              왼쪽 아이콘 길게 눌러 순서 변경
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              왼쪽으로 슬라이드하여 직접 수정·삭제해보세요!
            </span>
          </div>
          {/* 데스크톱: 단일 텍스트 힌트 */}
          <p className="hidden sm:block max-w-md shrink-0 text-right text-[13px] font-medium leading-relaxed text-slate-500" role="note">
            준비 항목을 드래그하여 순서를 변경할 수 있어요!
          </p>
        </>
      ) : null}
    </div>
  )
}
