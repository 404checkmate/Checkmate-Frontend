import SearchResultItem from './SearchResultItem'
import { buildSuppliesSubsections } from '@/utils/tripSearchUtils'

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="h-20 animate-pulse rounded-2xl border-2 border-gray-100 bg-white/80 shadow-sm"
          aria-hidden
        />
      ))}
      <p className="mt-2 text-center text-sm text-gray-500">
        AI 맞춤 추천과 카테고리별 필수품을 준비 중입니다…
      </p>
    </div>
  )
}

function CategoryGroupCard({ group, selectedForSave, existingArchiveItemIds, onToggleSelectAllInGroup, onToggleItem }) {
  const selectableInGroup = group.items.filter((i) => !existingArchiveItemIds.has(String(i.id)))
  const allInGroupSelected =
    selectableInGroup.length > 0 &&
    selectableInGroup.every((i) => selectedForSave.has(String(i.id)))
  const suppliesSubsections =
    group.categoryValue === 'supplies' ? buildSuppliesSubsections(group.items) : []

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-teal-100/90 pb-2">
        <h3 className="flex min-w-0 items-center gap-2 text-base font-extrabold tracking-tight text-[#0a3d3d]">
          {group.categoryLabel}
        </h3>
        <button
          type="button"
          onClick={() => onToggleSelectAllInGroup(group)}
          disabled={selectableInGroup.length === 0}
          className="shrink-0 rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-xs font-bold text-sky-800 shadow-sm transition-colors hover:bg-sky-50 disabled:pointer-events-none disabled:opacity-40 sm:px-3 sm:text-sm"
        >
          {allInGroupSelected ? '전체 해제' : '전체 선택'}
          <span className="ml-1 font-semibold text-sky-600 tabular-nums">({selectableInGroup.length})</span>
        </button>
      </div>
      {group.categoryValue === 'supplies' ? (
        <div className="space-y-5">
          {suppliesSubsections.map((section) => (
            <div key={section.key}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{section.label}</p>
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    aiRecommended={Boolean(item.isAiRecommended)}
                    selected={selectedForSave.has(String(item.id))}
                    inArchiveAlready={existingArchiveItemIds.has(String(item.id))}
                    onToggle={() => onToggleItem(item)}
                  />
                ))}
              </div>
            </div>
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
              inArchiveAlready={existingArchiveItemIds.has(String(item.id))}
              onToggle={() => onToggleItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TripSearchItemsList({
  loadState,
  selectedCategory,
  groupedItemsByCategory,
  singleCategoryItems,
  selectedForSave,
  existingArchiveItemIds,
  onToggleSelectAllInGroup,
  onToggleItem,
  tabCategories,
}) {
  if (loadState.status === 'loading') {
    return <LoadingSkeleton />
  }

  if (selectedCategory === 'all') {
    return (
      <div className="space-y-10">
        {groupedItemsByCategory.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
            표시할 항목이 없습니다.
          </div>
        ) : null}
        {groupedItemsByCategory.map((group) => (
          <CategoryGroupCard
            key={group.categoryValue}
            group={group}
            selectedForSave={selectedForSave}
            existingArchiveItemIds={existingArchiveItemIds}
            onToggleSelectAllInGroup={onToggleSelectAllInGroup}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>
    )
  }

  if (singleCategoryItems.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">해당 카테고리에 항목이 없습니다.</div>
    )
  }

  const categoryLabel = tabCategories.find((c) => c.value === selectedCategory)?.label ?? '준비물'

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 border-b border-teal-100/90 pb-2">
        <h3 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-[#0a3d3d]">
          {categoryLabel}
        </h3>
      </div>
      {selectedCategory === 'supplies' ? (
        <div className="space-y-5">
          {buildSuppliesSubsections(singleCategoryItems).map((section) => (
            <div key={section.key}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{section.label}</p>
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    aiRecommended={Boolean(item.isAiRecommended)}
                    selected={selectedForSave.has(String(item.id))}
                    inArchiveAlready={existingArchiveItemIds.has(String(item.id))}
                    onToggle={() => onToggleItem(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {singleCategoryItems.map((item) => (
            <SearchResultItem
              key={item.id}
              item={item}
              aiRecommended={Boolean(item.isAiRecommended)}
              selected={selectedForSave.has(String(item.id))}
              inArchiveAlready={existingArchiveItemIds.has(String(item.id))}
              onToggle={() => onToggleItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
