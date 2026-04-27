import { CATEGORIES } from '@/mocks/searchData'
import { BAGGAGE_CARRY_ON, BAGGAGE_CHECKED, BAGGAGE_SECTION_LABEL } from '@/utils/guideArchiveBaggage'

export const VIEW_BASIS_SUPPLIES = 'supplies'
export const VIEW_BASIS_BAGGAGE = 'baggage'

const GUIDE_VIEW_BASIS_OPTIONS = [
  { value: VIEW_BASIS_SUPPLIES, label: '준비물 유형' },
  { value: VIEW_BASIS_BAGGAGE, label: '수하물 유형' },
]

const GUIDE_BAGGAGE_TYPE_TABS = [
  { value: 'all', label: '전체' },
  { value: BAGGAGE_CARRY_ON, label: BAGGAGE_SECTION_LABEL[BAGGAGE_CARRY_ON] },
  { value: BAGGAGE_CHECKED, label: BAGGAGE_SECTION_LABEL[BAGGAGE_CHECKED] },
]

const GUIDE_ARCHIVE_SUPPLIES_CATEGORY_TABS = CATEGORIES.filter((c) => c.value !== 'ai_recommend')

export default function GuideChecklistCategoryFilter({
  viewBasis,
  onViewBasisChange,
  suppliesCategory,
  onSuppliesCategoryChange,
  baggageSection,
  onBaggageSectionChange,
}) {
  return (
    <section
      className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-5"
      aria-label="카테고리 필터"
    >
      <h2 className="mb-3.5 text-lg font-extrabold tracking-tight text-gray-900">카테고리별 선택</h2>

      <p id="guide-checklist-view-basis-label" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        보기 기준
      </p>
      <div
        className="mb-5 inline-flex w-auto max-w-full rounded-2xl border-2 border-slate-200/90 bg-slate-100/80 p-1 shadow-inner"
        role="tablist"
        aria-label="보기 기준"
        aria-labelledby="guide-checklist-view-basis-label"
      >
        {GUIDE_VIEW_BASIS_OPTIONS.map((opt) => {
          const selected = viewBasis === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onViewBasisChange(opt.value)}
              className={`min-h-9 min-w-[92px] rounded-lg px-2 py-1.5 text-center text-xs font-bold transition-all ${
                selected
                  ? 'bg-white text-teal-900 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <p id="guide-checklist-subcategory-label" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {viewBasis === VIEW_BASIS_SUPPLIES ? '항목 유형' : '수하물 구간'}
      </p>

      {viewBasis === VIEW_BASIS_SUPPLIES ? (
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-labelledby="guide-checklist-subcategory-label"
        >
          {GUIDE_ARCHIVE_SUPPLIES_CATEGORY_TABS.map((cat) => {
            const selected = suppliesCategory === cat.value
            const tabClass = selected
              ? 'border-2 border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-900/15'
              : 'border-2 border-sky-100 bg-slate-50/80 text-slate-600 shadow-sm hover:border-sky-200 hover:bg-sky-50'
            return (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onSuppliesCategoryChange(cat.value)}
                className={`inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${tabClass}`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      ) : (
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-thin"
          role="tablist"
          aria-labelledby="guide-checklist-subcategory-label"
        >
          {GUIDE_BAGGAGE_TYPE_TABS.map((tab) => {
            const selected = baggageSection === tab.value
            const tabClass = selected
              ? 'border-2 border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-900/15'
              : 'border-2 border-teal-100 bg-teal-50/80 text-teal-900 shadow-sm hover:border-teal-300 hover:bg-teal-100/80'
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onBaggageSectionChange(tab.value)}
                className={`inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${tabClass}`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
