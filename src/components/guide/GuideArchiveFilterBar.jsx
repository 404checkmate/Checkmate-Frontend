const FILTER_TABS = [
  { id: 'draft', label: '시작 전' },
  { id: 'writing', label: '준비 중' },
  { id: 'completed', label: '완료' },
]

export { FILTER_TABS }

function FilterIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}

export default function GuideArchiveFilterBar({
  entries,
  deleteMode,
  selectedEntryIds,
  allEntriesSelected,
  filterTab,
  setFilterTab,
  filterSheetIsOpen,
  onOpenFilterSheet,
  onEnterDeleteMode,
  onExitDeleteMode,
  onSelectAll,
  onDeleteSelected,
  activeFilterLabel,
}) {
  return (
    <div
      className={`relative mt-3 flex w-full items-center gap-2 max-md:flex-nowrap md:flex-wrap md:mt-2 ${
        filterSheetIsOpen ? 'z-0 max-md:pointer-events-none' : 'z-10'
      }`}
    >
      <button
        type="button"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-100/90 bg-white/95 text-teal-800 shadow-sm ring-1 ring-teal-50/80 transition-colors hover:bg-teal-50/60 active:bg-teal-100/50 md:hidden"
        onClick={onOpenFilterSheet}
        aria-expanded={filterSheetIsOpen}
        aria-haspopup="dialog"
        aria-controls="guide-archive-filter-sheet"
        aria-label={`체크리스트 필터 (${activeFilterLabel})`}
      >
        <FilterIcon className="h-6 w-6" />
      </button>

      <div
        className="hidden flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-sm md:inline-flex md:border-slate-200 md:bg-slate-50/80"
        role="tablist"
        aria-label="체크리스트 필터"
      >
        {FILTER_TABS.map((tab) => {
          const active = filterTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilterTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors md:px-6 md:py-2.5 ${
                active
                  ? 'bg-slate-200/90 text-slate-900 shadow-sm md:bg-sky-100 md:text-sky-950'
                  : 'text-slate-500 hover:text-slate-800 md:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {entries.length > 0 && !deleteMode ? (
        <button
          type="button"
          onClick={onEnterDeleteMode}
          className="ml-auto shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition-colors hover:bg-red-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
        >
          삭제
        </button>
      ) : null}

      {entries.length > 0 && deleteMode ? (
        <div className="ml-auto flex min-w-0 max-w-full shrink-0 items-center justify-end gap-1.5 max-md:flex-1 max-md:flex-nowrap max-md:overflow-x-auto max-md:scrollbar-hide md:flex-wrap md:gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 max-md:whitespace-nowrap md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            {allEntriesSelected ? '전체 해제' : '전체선택'}
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedEntryIds.length === 0}
            className="shrink-0 rounded-lg border border-red-300 bg-red-50 px-2 py-2 text-[11px] font-bold text-red-800 shadow-sm transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 max-md:whitespace-nowrap md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            선택한 목록 삭제
          </button>
          <button
            type="button"
            onClick={onExitDeleteMode}
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 max-md:whitespace-nowrap md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            취소
          </button>
        </div>
      ) : null}
    </div>
  )
}
