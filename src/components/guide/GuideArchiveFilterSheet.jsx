import { FILTER_TABS } from './GuideArchiveFilterBar'

export default function GuideArchiveFilterSheet({
  filterSheetPhase,
  filterEnterAnimActive,
  sheetPullY,
  sheetPullDragging,
  filterSheetPullZoneRef,
  filterTab,
  setFilterTab,
  closeFilterSheet,
  onPullStart,
  onPullEnd,
  onPanelAnimEnd,
}) {
  if (filterSheetPhase === 'closed') return null

  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-[100] bg-teal-950/35 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          filterSheetPhase === 'closing' ? 'opacity-0' : 'opacity-100'
        }`}
        aria-label="필터 닫기"
        onClick={closeFilterSheet}
      />
      <div
        id="guide-archive-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-archive-filter-sheet-title"
        className="fixed inset-x-0 bottom-0 z-[110] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        style={
          filterSheetPhase === 'open'
            ? {
                transform: sheetPullY > 0 ? `translateY(${sheetPullY}px)` : undefined,
                transition: sheetPullDragging ? 'none' : 'transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)',
              }
            : undefined
        }
      >
        <div
          className={`mx-auto max-w-lg overflow-hidden rounded-t-[1.75rem] border border-b-0 border-teal-200/70 bg-gradient-to-t from-teal-50/50 via-white to-white shadow-[0_-20px_48px_-12px_rgba(13,148,136,0.28)] ${
            filterSheetPhase === 'open' && filterEnterAnimActive ? 'guide-archive-filter-sheet-up' : ''
          }${filterSheetPhase === 'closing' ? ' guide-archive-filter-sheet-down' : ''}`}
          onAnimationEnd={onPanelAnimEnd}
        >
          <div
            ref={filterSheetPullZoneRef}
            className="touch-none select-none"
            onTouchStart={onPullStart}
            onTouchEnd={onPullEnd}
            onTouchCancel={onPullEnd}
          >
            <div className="flex justify-center pt-2" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-slate-300/80" />
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-teal-100/90 px-4 py-3">
              <h2
                id="guide-archive-filter-sheet-title"
                className="text-base font-extrabold tracking-tight text-[#0a3d3d]"
              >
                체크리스트 필터
              </h2>
              <button
                type="button"
                onClick={closeFilterSheet}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-white text-lg font-bold leading-none text-teal-800 shadow-sm transition-colors hover:bg-teal-50 active:scale-95"
                aria-label="닫기"
              >
                ×
              </button>
            </div>
          </div>
          <ul className="flex flex-col gap-1.5 p-3 pb-5" aria-label="진행 상태별 보기">
            {FILTER_TABS.map((tab) => {
              const active = filterTab === tab.id
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    aria-selected={active}
                    onClick={() => {
                      setFilterTab(tab.id)
                      closeFilterSheet()
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition-all active:scale-[0.99] ${
                      active
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-900/15'
                        : 'border border-transparent bg-white/90 text-slate-800 hover:border-teal-100 hover:bg-teal-50/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {active ? (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white/95">
                        적용 중
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}
