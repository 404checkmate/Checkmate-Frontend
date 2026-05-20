import { buildGuideArchiveSectionDroppableId } from '@/utils/guideArchiveChecklistReorder'
import { filterGroupedByItemCategory } from '@/utils/guideArchiveSupplies'
import GuideArchiveSectionDndList from '@/components/guide/GuideArchiveSectionDndList'
import SectionHeaderWithHint from '@/components/guide/SectionHeaderWithHint'

export default function BaggageView({ sections, firstHintBagKey, total, effectiveItemCategory, checklistListProps }) {
  return sections.map(({ bagKey, bagTitle, grouped }) => {
    const displayGrouped = filterGroupedByItemCategory(grouped, effectiveItemCategory)
    if (displayGrouped.length === 0) return null
    return (
      <div key={bagKey} className="space-y-6">
        <SectionHeaderWithHint
          title={bagTitle}
          showHint={bagKey === firstHintBagKey && total > 0}
        />
        <div className="space-y-8">
          {displayGrouped.map(({ categoryValue, categoryLabel, items: list }) => (
            <section
              key={`${bagKey}-${categoryValue}`}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition md:p-5"
            >
              <div className="mb-3">
                <h3 className="flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {categoryLabel}
                </h3>
              </div>
              <GuideArchiveSectionDndList
                droppableId={buildGuideArchiveSectionDroppableId(bagKey, categoryValue, categoryLabel)}
                list={list}
                actionVariant="default"
                {...checklistListProps}
              />
            </section>
          ))}
        </div>
      </div>
    )
  })
}
