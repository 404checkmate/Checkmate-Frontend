import { useMemo } from 'react'
import {
  BAGGAGE_SECTION_ORDER,
  BAGGAGE_SECTION_LABEL,
  BAGGAGE_CHECKED,
  GUIDE_USER_DIRECT_CATEGORY,
  resolveBaggageSection,
} from '@/utils/guideArchiveBaggage'
import { CATEGORIES } from '@/mocks/searchData'
import { compareGuideArchiveAiFirst, resolveGuideArchiveCategoryForSection } from '@/utils/guideArchiveChecklistReorder'
import { filterGroupedByItemCategory } from '@/utils/guideArchiveSupplies'
import { VIEW_BASIS_SUPPLIES } from '@/components/guide/GuideChecklistCategoryFilter'

export function useGuideArchiveSections({ items, viewBasis, effectiveBaggageFilter, effectiveItemCategory }) {
  const sectionsByBaggage = useMemo(() => {
    return BAGGAGE_SECTION_ORDER.map((bagKey) => {
      const catMap = new Map()
      for (const it of items) {
        if (resolveBaggageSection(it) !== bagKey) continue
        let categoryValue = it.category ?? '_misc'
        if (categoryValue === GUIDE_USER_DIRECT_CATEGORY) continue
        categoryValue = resolveGuideArchiveCategoryForSection(it)
        const categoryLabel =
          categoryValue === 'supplies'
            ? CATEGORIES.find((c) => c.value === 'supplies')?.label ?? '준비물'
            : it.categoryLabel || it.category || '준비물'
        if (!catMap.has(categoryValue)) {
          catMap.set(categoryValue, { label: categoryLabel, list: [] })
        }
        catMap.get(categoryValue).list.push(it)
      }
      for (const { list } of catMap.values()) {
        list.sort(compareGuideArchiveAiFirst)
      }
      const grouped = Array.from(catMap.entries()).map(([categoryValue, { label, list }]) => ({
        categoryValue,
        categoryLabel: label,
        items: list,
      }))
      return { bagKey, bagTitle: BAGGAGE_SECTION_LABEL[bagKey], grouped }
    }).filter((s) => s.grouped.length > 0)
  }, [items])

  const visibleSectionsByBaggage = useMemo(() => {
    if (effectiveBaggageFilter === 'all') return sectionsByBaggage
    return sectionsByBaggage.filter((s) => s.bagKey === effectiveBaggageFilter)
  }, [sectionsByBaggage, effectiveBaggageFilter])

  const directAddSectionItems = useMemo(() => {
    const out = []
    for (const it of items) {
      if ((it.category ?? '_misc') !== GUIDE_USER_DIRECT_CATEGORY) continue
      const bag = resolveBaggageSection(it)
      if (effectiveBaggageFilter !== 'all' && bag !== effectiveBaggageFilter) continue
      out.push(it)
    }
    return out
  }, [items, effectiveBaggageFilter])

  const suppliesViewSections = useMemo(() => {
    if (viewBasis !== VIEW_BASIS_SUPPLIES) return []
    const tabOrder = CATEGORIES.filter((c) => c.value !== 'all' && c.value !== 'ai_recommend').map((c) => c.value)
    const catMap = new Map()
    for (const it of items) {
      const raw = it.category ?? '_misc'
      if (raw === GUIDE_USER_DIRECT_CATEGORY) continue
      const cv = resolveGuideArchiveCategoryForSection(it)
      if (effectiveItemCategory !== 'all' && cv !== effectiveItemCategory) continue
      if (!catMap.has(cv)) {
        const categoryLabel =
          cv === 'supplies'
            ? CATEGORIES.find((c) => c.value === 'supplies')?.label ?? '준비물'
            : it.categoryLabel || it.category || '준비물'
        catMap.set(cv, { categoryValue: cv, categoryLabel, carry: [], checked: [] })
      }
      const bucket = catMap.get(cv)
      if (resolveBaggageSection(it) === BAGGAGE_CHECKED) bucket.checked.push(it)
      else bucket.carry.push(it)
    }
    for (const g of catMap.values()) {
      g.carry.sort(compareGuideArchiveAiFirst)
      g.checked.sort(compareGuideArchiveAiFirst)
    }
    const ordered = []
    for (const cv of tabOrder) {
      const g = catMap.get(cv)
      if (!g || (g.carry.length === 0 && g.checked.length === 0)) continue
      ordered.push(g)
      catMap.delete(cv)
    }
    for (const g of catMap.values()) {
      if (g.carry.length || g.checked.length) ordered.push(g)
    }
    return ordered
  }, [viewBasis, items, effectiveItemCategory])

  const visibleChecklistItemCount = useMemo(() => {
    if (viewBasis === VIEW_BASIS_SUPPLIES) {
      let n = 0
      for (const s of suppliesViewSections) n += s.carry.length + s.checked.length
      if (effectiveItemCategory === 'all') n += directAddSectionItems.length
      return n
    }
    let n = 0
    for (const s of visibleSectionsByBaggage) {
      const gr = filterGroupedByItemCategory(s.grouped, effectiveItemCategory)
      for (const g of gr) n += g.items.length
    }
    if (effectiveItemCategory === 'all') n += directAddSectionItems.length
    return n
  }, [viewBasis, suppliesViewSections, visibleSectionsByBaggage, effectiveItemCategory, directAddSectionItems])

  const firstVisibleBagKeyForHint = useMemo(() => {
    for (const s of visibleSectionsByBaggage) {
      if (filterGroupedByItemCategory(s.grouped, effectiveItemCategory).length > 0) return s.bagKey
    }
    return null
  }, [visibleSectionsByBaggage, effectiveItemCategory])

  const firstSuppliesCategoryForHint = useMemo(() => {
    if (viewBasis !== VIEW_BASIS_SUPPLIES) return null
    for (const s of suppliesViewSections) {
      if (s.carry.length || s.checked.length) return s.categoryValue
    }
    return null
  }, [viewBasis, suppliesViewSections])

  return {
    visibleSectionsByBaggage,
    directAddSectionItems,
    suppliesViewSections,
    visibleChecklistItemCount,
    firstVisibleBagKeyForHint,
    firstSuppliesCategoryForHint,
  }
}
