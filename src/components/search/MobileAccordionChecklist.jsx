import { useState } from 'react'
import SearchResultItem from './SearchResultItem'
import { buildSuppliesSubsections } from '@/utils/tripSearchUtils'
import { isInExistingArchive } from '@/hooks/useArchiveEntry'

function ChevronIcon({ open, small = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''} ${small ? 'h-4 w-4' : 'h-5 w-5'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SubsectionAccordion({ section, selectedForSave, existingArchiveItemIds, onToggleItem, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left bg-slate-50/80"
      >
        <span className="flex-1 min-w-0 text-xs font-bold uppercase tracking-wide text-slate-500">
          {section.label}
        </span>
        <span className="shrink-0 text-xs font-semibold text-slate-400 tabular-nums">
          {section.items.length}
        </span>
        <ChevronIcon open={open} small />
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 250ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="flex flex-col gap-3 px-3 pb-3 pt-2">
            {section.items.map((item) => (
              <SearchResultItem
                key={item.id}
                item={item}
                aiRecommended={Boolean(item.isAiRecommended)}
                selected={selectedForSave.has(String(item.id))}
                inArchiveAlready={isInExistingArchive(item, existingArchiveItemIds)}
                onToggle={() => onToggleItem(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AccordionSection({
  group,
  selectedForSave,
  existingArchiveItemIds,
  onToggleSelectAllInGroup,
  onToggleItem,
  defaultOpen,
}) {
  const [open, setOpen] = useState(defaultOpen)

  const selectableInGroup = group.items.filter((i) => !isInExistingArchive(i, existingArchiveItemIds))
  const allInGroupSelected =
    selectableInGroup.length > 0 &&
    selectableInGroup.every((i) => selectedForSave.has(String(i.id)))
  const selectedCount = group.items.filter((i) => selectedForSave.has(String(i.id))).length
  const suppliesSubsections =
    group.categoryValue === 'supplies' ? buildSuppliesSubsections(group.items) : []

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex w-full items-center gap-2 px-4 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 min-w-0 items-center gap-3 text-left"
        >
          <span className="flex-1 min-w-0 font-extrabold text-[#0a3d3d] text-base tracking-tight">
            {group.categoryLabel}
          </span>
          <span className="shrink-0 text-xs font-semibold text-slate-400 tabular-nums">
            {selectedCount}/{group.items.length}
          </span>
          <ChevronIcon open={open} />
        </button>
        <button
          type="button"
          onClick={() => onToggleSelectAllInGroup(group)}
          disabled={selectableInGroup.length === 0}
          className="shrink-0 rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-xs font-bold text-sky-800 shadow-sm transition-colors hover:bg-sky-50 disabled:pointer-events-none disabled:opacity-40"
        >
          {allInGroupSelected ? '전체 해제' : '전체 선택'}
          <span className="ml-1 font-semibold text-sky-600 tabular-nums">
            ({selectableInGroup.length})
          </span>
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 280ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="border-t border-teal-100/90 px-4 pb-4 pt-3">

            {group.categoryValue === 'supplies' ? (
              <div className="flex flex-col gap-2">
                {suppliesSubsections.map((section) => (
                  <SubsectionAccordion
                    key={section.key}
                    section={section}
                    selectedForSave={selectedForSave}
                    existingArchiveItemIds={existingArchiveItemIds}
                    onToggleItem={onToggleItem}
                    defaultOpen={section.key === 'essentials'}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    aiRecommended={Boolean(item.isAiRecommended)}
                    selected={selectedForSave.has(String(item.id))}
                    inArchiveAlready={isInExistingArchive(item, existingArchiveItemIds)}
                    onToggle={() => onToggleItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MobileAccordionChecklist({
  loadState,
  groupedItemsByCategory,
  selectedCategory = 'all',
  selectedForSave,
  existingArchiveItemIds,
  onToggleSelectAllInGroup,
  onToggleItem,
}) {
  const isSingleCategory = selectedCategory !== 'all'
  const visibleGroups = isSingleCategory
    ? groupedItemsByCategory.filter((g) => g.categoryValue === selectedCategory)
    : groupedItemsByCategory

  if (loadState.status === 'loading') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-16 animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm"
            aria-hidden
          />
        ))}
      </div>
    )
  }

  if (visibleGroups.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
        표시할 항목이 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {visibleGroups.map((group) => (
        <AccordionSection
          key={`${group.categoryValue}-${selectedCategory}`}
          group={group}
          selectedForSave={selectedForSave}
          existingArchiveItemIds={existingArchiveItemIds}
          onToggleSelectAllInGroup={onToggleSelectAllInGroup}
          onToggleItem={onToggleItem}
          defaultOpen={isSingleCategory}
        />
      ))}
    </div>
  )
}
