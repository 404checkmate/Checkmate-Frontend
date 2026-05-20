const STATUS_TABS = [
  { id: 'not_started', label: '시작 전' },
  { id: 'preparing',   label: '준비 중' },
  { id: 'completed',   label: '완료' },
]

export default function ArchiveListControls({
  filterTab,
  onTabChange,
  deleteMode,
  hasArchives,
  allSelected,
  selectedCount,
  onEnterDeleteMode,
  onSelectAll,
  onDeleteSelected,
  onExitDeleteMode,
}) {
  return (
    <div className="mb-6 flex w-full items-center gap-2">
      <div
        className="inline-flex gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
        role="tablist"
        aria-label="체크리스트 필터"
      >
        {STATUS_TABS.map((tab) => {
          const active = filterTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors md:px-6 md:py-2.5 ${
                active ? 'bg-sky-100 text-sky-950 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {hasArchives && !deleteMode && (
        <button
          type="button"
          onClick={onEnterDeleteMode}
          className="ml-auto shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition-colors hover:bg-red-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
        >
          삭제
        </button>
      )}

      {hasArchives && deleteMode && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            {allSelected ? '전체 해제' : '전체선택'}
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className="rounded-lg border border-red-300 bg-red-50 px-2 py-2 text-[11px] font-bold text-red-800 shadow-sm transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            선택한 목록 삭제
          </button>
          <button
            type="button"
            onClick={onExitDeleteMode}
            className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
          >
            취소
          </button>
        </div>
      )}
    </div>
  )
}
