import {
  BAGGAGE_CARRY_ON,
  BAGGAGE_CHECKED,
  BAGGAGE_SECTION_LABEL,
} from '@/utils/guideArchiveBaggage'
import { buildGuideArchiveSectionDroppableId } from '@/utils/guideArchiveChecklistReorder'
import { buildGuideSuppliesSubsections } from '@/utils/guideArchiveSupplies'
import GuideArchiveSectionDndList from '@/components/guide/GuideArchiveSectionDndList'
import SectionHeaderWithHint from '@/components/guide/SectionHeaderWithHint'

export default function SuppliesView({ sections, firstHintCategory, total, checklistListProps }) {
  return sections.map(({ categoryValue, categoryLabel, carry, checked }) => {
    const showBagSublabels = carry.length > 0 && checked.length > 0
    return (
      <div key={categoryValue} className="space-y-6">
        <SectionHeaderWithHint
          title={categoryLabel}
          showHint={categoryValue === firstHintCategory && total > 0}
        />
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition md:p-5">
          {categoryValue === 'supplies' ? (
            <div className="space-y-5">
              {buildGuideSuppliesSubsections(carry, checked).map((subSection) => (
                <div key={subSection.key}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{subSection.label}</p>
                  <GuideArchiveSectionDndList
                    droppableId={buildGuideArchiveSectionDroppableId(BAGGAGE_CARRY_ON, categoryValue, categoryLabel)}
                    list={subSection.items}
                    actionVariant="default"
                    {...checklistListProps}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {carry.length > 0 ? (
                <div>
                  {showBagSublabels ? (
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{BAGGAGE_SECTION_LABEL[BAGGAGE_CARRY_ON]}</p>
                  ) : null}
                  <GuideArchiveSectionDndList
                    droppableId={buildGuideArchiveSectionDroppableId(BAGGAGE_CARRY_ON, categoryValue, categoryLabel)}
                    list={carry}
                    actionVariant="default"
                    {...checklistListProps}
                  />
                </div>
              ) : null}
              {checked.length > 0 ? (
                <div className={carry.length > 0 ? 'border-t border-slate-100 pt-6' : ''}>
                  {showBagSublabels ? (
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{BAGGAGE_SECTION_LABEL[BAGGAGE_CHECKED]}</p>
                  ) : null}
                  <GuideArchiveSectionDndList
                    droppableId={buildGuideArchiveSectionDroppableId(BAGGAGE_CHECKED, categoryValue, categoryLabel)}
                    list={checked}
                    actionVariant="default"
                    {...checklistListProps}
                  />
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    )
  })
}
