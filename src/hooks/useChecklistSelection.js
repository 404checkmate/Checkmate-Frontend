import { useState, useEffect, useRef, useMemo } from 'react'
import { trackEvent } from '@/utils/analyticsTracker'

export function useChecklistSelection({
  sourceItems,
  existingArchiveItemIds,
  tripId,
  selectedCategory,
  singleCategoryItems,
  mergeToArchive,
}) {
  const [selectedForSave, setSelectedForSave] = useState(() => new Set())
  const autoSelectDoneRef = useRef(false)

  useEffect(() => {
    if (autoSelectDoneRef.current) return
    if (sourceItems.length === 0) return
    autoSelectDoneRef.current = true
    setSelectedForSave(new Set(sourceItems.map((i) => String(i.id))))
  }, [sourceItems])

  const selectableItemsInView = useMemo(() => {
    const list = selectedCategory === 'all' ? sourceItems : singleCategoryItems
    return list.filter((i) => !existingArchiveItemIds.has(String(i.id)))
  }, [selectedCategory, singleCategoryItems, sourceItems, existingArchiveItemIds])

  const allSelectableInViewSelected = useMemo(() => {
    if (selectableItemsInView.length === 0) return false
    return selectableItemsInView.every((i) => selectedForSave.has(String(i.id)))
  }, [selectableItemsInView, selectedForSave])

  const selectionProgressPercent = useMemo(() => {
    if (sourceItems.length === 0) return 0
    return Math.min(100, Math.round((selectedForSave.size / sourceItems.length) * 100))
  }, [selectedForSave.size, sourceItems.length])

  const toggleItemSelect = (item) => {
    const id = String(item.id)
    if (existingArchiveItemIds.has(id)) return
    setSelectedForSave((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    trackEvent('search_item_toggle_select', {
      trip_id: tripId,
      item_id: item.id,
      item_category: item.category,
      selected_after: !selectedForSave.has(id),
    })
  }

  const handleSelectAllInView = () => {
    if (selectableItemsInView.length === 0) return
    if (allSelectableInViewSelected) {
      setSelectedForSave((prev) => {
        const next = new Set(prev)
        for (const item of selectableItemsInView) next.delete(String(item.id))
        return next
      })
      trackEvent('search_deselect_all_in_view', {
        trip_id: tripId,
        category: selectedCategory,
        removed_count: selectableItemsInView.length,
        merge_to_archive: mergeToArchive,
      })
      return
    }
    setSelectedForSave((prev) => {
      const next = new Set(prev)
      for (const item of selectableItemsInView) next.add(String(item.id))
      return next
    })
    trackEvent('search_select_all_in_view', {
      trip_id: tripId,
      category: selectedCategory,
      added_count: selectableItemsInView.filter((i) => !selectedForSave.has(String(i.id))).length,
      merge_to_archive: mergeToArchive,
    })
  }

  const handleToggleSelectAllInGroup = (group) => {
    const selectable = group.items.filter((i) => !existingArchiveItemIds.has(String(i.id)))
    if (selectable.length === 0) return
    const allOn = selectable.every((i) => selectedForSave.has(String(i.id)))
    setSelectedForSave((prev) => {
      const next = new Set(prev)
      if (allOn) {
        for (const item of selectable) next.delete(String(item.id))
      } else {
        for (const item of selectable) next.add(String(item.id))
      }
      return next
    })
    trackEvent(allOn ? 'search_deselect_all_in_group' : 'search_select_all_in_group', {
      trip_id: tripId,
      group_category: group.categoryValue,
      item_count: selectable.length,
      merge_to_archive: mergeToArchive,
    })
  }

  return {
    selectedForSave,
    setSelectedForSave,
    toggleItemSelect,
    handleSelectAllInView,
    handleToggleSelectAllInGroup,
    selectableItemsInView,
    allSelectableInViewSelected,
    selectionProgressPercent,
  }
}
