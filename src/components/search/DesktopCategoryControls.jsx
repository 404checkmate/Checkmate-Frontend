export default function DesktopCategoryControls({
  selectedCategory,
  tabCategories,
  visibleItemCount,
  selectableItemsInView,
  allSelectableInViewSelected,
  onSelectAll,
}) {
  return (
    <div className="mb-[14px] flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-2">
      <p className="min-w-0 flex-1 text-base font-extrabold text-gray-700 md:text-lg">
        <span className="text-slate-700">
          {selectedCategory === 'all'
            ? '전체 유형'
            : tabCategories.find((c) => c.value === selectedCategory)?.label}
        </span>
        <span className="ml-1.5 tabular-nums text-gray-900">{visibleItemCount}</span>개
      </p>
      <button
        type="button"
        onClick={onSelectAll}
        disabled={selectableItemsInView.length === 0}
        className="shrink-0 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-bold text-sky-800 shadow-sm transition-colors hover:bg-sky-50 disabled:pointer-events-none disabled:opacity-40"
      >
        {allSelectableInViewSelected ? '전체 해제' : '전체 선택'}
        <span className="ml-1 font-semibold text-sky-600 tabular-nums">({selectableItemsInView.length})</span>
      </button>
    </div>
  )
}
