export const SEARCH_CATEGORY_ORDER = ['supplies', 'prebooking', 'predeparture']
export const SEARCH_CATEGORY_LABEL = {
  supplies: '준비물',
  prebooking: '사전 예약/신청',
  predeparture: '출국 전 확인사항',
}

const SUPPLIES_SUBSECTION_ORDER = [
  'essentials',
  'clothing',
  'health',
  'toiletries',
  'beauty',
  'electronics',
  'travel_goods',
]
const SUPPLIES_SUBSECTION_LABEL = {
  essentials: '필수 준비물',
  clothing: '입을 옷',
  health: '상비약',
  toiletries: '세면도구',
  beauty: '미용용품',
  electronics: '전자제품',
  travel_goods: '여행용품',
}
const SUPPLIES_ID_PREFIX_TO_SUBSECTION = {
  doc: 'essentials',
  clo: 'clothing',
  hl: 'health',
  pk: 'toiletries',
  bty: 'beauty',
  ele: 'electronics',
  act: 'travel_goods',
}

export function sortItemsForDisplay(a, b) {
  const aAi = Boolean(a?.isAiRecommended)
  const bAi = Boolean(b?.isAiRecommended)
  if (aAi !== bAi) return aAi ? -1 : 1
  return String(a?.title ?? '').localeCompare(String(b?.title ?? ''), 'ko')
}

function resolveSuppliesSubsection(item) {
  const sub = String(item?.subCategory ?? '').trim()
  if (sub === 'clothing') return 'clothing'
  if (sub === 'health') return 'health'
  if (sub === 'toiletries') return 'toiletries'
  if (sub === 'beauty') return 'beauty'
  if (sub === 'electronics') return 'electronics'
  if (sub === 'travel_goods' || sub === 'packing' || sub === 'activity') return 'travel_goods'
  if (sub === 'essentials' || sub === 'documents') return 'essentials'
  const rawId = String(item?.id ?? '')
  const seg = rawId.split('-')[1]
  if (seg && SUPPLIES_ID_PREFIX_TO_SUBSECTION[seg]) return SUPPLIES_ID_PREFIX_TO_SUBSECTION[seg]
  return 'essentials'
}

export function buildSuppliesSubsections(items) {
  return SUPPLIES_SUBSECTION_ORDER.map((key) => {
    const list = items.filter((item) => resolveSuppliesSubsection(item) === key).sort(sortItemsForDisplay)
    return { key, label: SUPPLIES_SUBSECTION_LABEL[key], items: list }
  }).filter((section) => section.items.length > 0)
}

export function buildSubcategoryGroups(itemsPool) {
  return SEARCH_CATEGORY_ORDER
    .map((value) => {
      const items = itemsPool
        .filter((i) => i.category === value)
        .sort(sortItemsForDisplay)
      return { categoryValue: value, categoryLabel: SEARCH_CATEGORY_LABEL[value] ?? '준비물', items }
    })
    .filter((g) => g && g.items.length > 0)
}

export function normalizeItemCategory(item) {
  const isAiRecommended =
    item.category === 'ai_recommend' || item.prepType === 'ai_recommend' || item.source === 'llm'
  if (!isAiRecommended) return { ...item, isAiRecommended: false }
  if (item.category !== 'ai_recommend') return { ...item, isAiRecommended: true }
  const prepType = String(item.prepType ?? '').trim()
  const subCategory = String(item.subCategory ?? '').trim()
  let category = 'supplies'
  if (prepType === 'pre_booking' || subCategory === 'booking') category = 'prebooking'
  else if (prepType === 'pre_departure_check' || subCategory === 'pre_departure') category = 'predeparture'
  return {
    ...item,
    category,
    categoryLabel: SEARCH_CATEGORY_LABEL[category],
    isAiRecommended: true,
  }
}

export function mapMockItemToArchiveItem(i) {
  return {
    id: i.id,
    serverId: i.serverId ?? null,
    baggageType: i.baggageType,
    category: i.category,
    categoryLabel: i.categoryLabel,
    subCategory: i.subCategory ?? '',
    subCategoryLabel: i.subCategoryLabel ?? '',
    prepType: i.prepType ?? '',
    source: i.source ?? '',
    title: i.title,
    description: i.description,
    detail: i.detail,
  }
}

function diffDaysInclusive(startStr, endStr) {
  const s = new Date(startStr)
  const e = new Date(endStr)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, days)
}

export function buildContextInputFromPlan(plan) {
  if (!plan?.destination || !plan.tripStartDate || !plan.tripEndDate) return null
  const dest = plan.destination
  const destinationLabel = [dest.country, dest.city].filter(Boolean).join(' (') + (dest.city ? ')' : '')
  const companions = []
  if (plan.companion) companions.push(plan.companion)
  if (plan.hasPet) companions.push('반려동물')
  return {
    destination: destinationLabel || dest.country || dest.city || '국내외 여행지',
    durationDays: diffDaysInclusive(plan.tripStartDate, plan.tripEndDate),
    tripStart: plan.tripStartDate,
    companions,
    purposes: Array.isArray(plan.travelStyles) ? plan.travelStyles : [],
  }
}
