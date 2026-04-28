import AiSparkleMaskIcon from './AiSparkleMaskIcon'

export default function TripSearchCategoryFilter({
  categoryCardHeading,
  tabCategories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <section
      className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-5"
      aria-label="카테고리 필터"
    >
      <h2 className="mb-3.5 text-lg font-extrabold tracking-tight text-gray-900">{categoryCardHeading}</h2>
      <p id="search-subcategory-label" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        항목 유형
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide"
        role="tablist"
        aria-labelledby="search-subcategory-label"
      >
        {tabCategories.map((cat) => {
          const isAi = cat.value === 'ai_recommend'
          const selected = selectedCategory === cat.value
          const tabClass = isAi
            ? selected
              ? 'border-2 border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-900/20'
              : 'border-2 border-violet-200 bg-violet-50/95 text-violet-900 shadow-sm hover:border-violet-300 hover:bg-violet-100/90'
            : selected
              ? 'border-2 border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-900/15'
              : 'border-2 border-sky-100 bg-slate-50/80 text-slate-600 shadow-sm hover:border-sky-200 hover:bg-sky-50'
          return (
            <button
              key={cat.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onCategoryChange(cat.value)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tabClass}`}
            >
              {isAi ? <AiSparkleMaskIcon selected={selected} className="h-3.5 w-3.5" /> : null}
              {cat.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
