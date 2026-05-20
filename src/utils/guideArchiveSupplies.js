export const GUIDE_SUPPLIES_SUBSECTION_ORDER = [
  'essentials', 'clothing', 'health', 'toiletries', 'beauty', 'electronics', 'travel_goods',
]

export const GUIDE_SUPPLIES_SUBSECTION_LABEL = {
  essentials: '필수 준비물',
  clothing: '입을 옷',
  health: '상비약',
  toiletries: '세면도구',
  beauty: '미용용품',
  electronics: '전자제품',
  travel_goods: '여행용품',
}

const GUIDE_SUPPLIES_ID_PREFIX_TO_SUBSECTION = {
  doc: 'essentials',
  clo: 'clothing',
  hl: 'health',
  pk: 'toiletries',
  bty: 'beauty',
  ele: 'electronics',
  act: 'travel_goods',
}

export function filterGroupedByItemCategory(grouped, filterItemCategory) {
  if (filterItemCategory === 'all') return grouped
  return grouped.filter((g) => g.categoryValue === filterItemCategory)
}

export function resolveGuideSuppliesSubsection(item) {
  const refinedSub = String(item?.refinedSubCategory ?? '').trim()
  const sub = String(item?.subCategory ?? '').trim()
  const picked = refinedSub || sub
  if (picked === 'clothing') return 'clothing'
  if (picked === 'health') return 'health'
  if (picked === 'toiletries') return 'toiletries'
  if (picked === 'beauty') return 'beauty'
  if (picked === 'electronics') return 'electronics'
  if (picked === 'travel_goods' || picked === 'packing' || picked === 'activity') return 'travel_goods'
  if (picked === 'essentials' || picked === 'documents') return 'essentials'

  const rawId = String(item?.id ?? '')
  const seg = rawId.split('-')[1]
  if (seg && GUIDE_SUPPLIES_ID_PREFIX_TO_SUBSECTION[seg]) {
    return GUIDE_SUPPLIES_ID_PREFIX_TO_SUBSECTION[seg]
  }
  return 'essentials'
}

export function buildGuideSuppliesSubsections(carry, checked) {
  return GUIDE_SUPPLIES_SUBSECTION_ORDER.map((key) => {
    const carryItems = carry.filter((item) => resolveGuideSuppliesSubsection(item) === key)
    const checkedItems = checked.filter((item) => resolveGuideSuppliesSubsection(item) === key)
    return {
      key,
      label: GUIDE_SUPPLIES_SUBSECTION_LABEL[key],
      items: [...carryItems, ...checkedItems],
    }
  }).filter((section) => section.items.length > 0)
}

export function resolveDirectAddCategory(prepType) {
  if (prepType === 'pre_booking') return 'pre_booking'
  if (prepType === 'pre_departure_check') return 'pre_departure_check'
  return 'supplies'
}

export const GUIDE_ARCHIVE_DROP_ANIMATION = {
  duration: 280,
  easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
}
