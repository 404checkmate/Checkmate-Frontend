/**
 * 탐색(TripSearchPage)에서 저장한 필수품을 localStorage에 보관하고
 * 가이드 보관함 체크리스트와 동기화할 때 사용합니다.
 */
import { upsertChecklistItems } from '@/api/checklists'

const STORAGE_PREFIX = 'travel_fe_trip_saved_items_v1_'
const PLACEHOLDER_TRIP_ID = '1'

/**
 * @param {string|number} tripId
 * @returns {Array<{ id: string|number, category: string, title: string, subtitle?: string, checked?: boolean, savedAt?: string }>}
 */
export function loadSavedItems(tripId) {
  if (tripId == null) return []
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + String(tripId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * @returns {typeof loadSavedItems extends (...args: infer R) => infer T ? T : never}
 */
export function saveItemForTrip(tripId, item) {
  const list = loadSavedItems(tripId)
  if (list.some((x) => String(x.id) === String(item.id))) return list

  const entry = {
    id: item.id,
    category: item.category,
    title: item.title,
    subtitle: item.subtitle ?? item.description ?? '',
    checked: false,
    savedAt: new Date().toISOString(),
  }
  const next = [...list, entry]
  try {
    localStorage.setItem(STORAGE_PREFIX + String(tripId), JSON.stringify(next))
  } catch (e) {
    console.warn('[savedTripItems] save failed', e)
  }
  return next
}

export function removeSavedItem(tripId, itemId) {
  const list = loadSavedItems(tripId).filter((x) => String(x.id) !== String(itemId))
  try {
    localStorage.setItem(STORAGE_PREFIX + String(tripId), JSON.stringify(list))
  } catch (e) {
    console.warn('[savedTripItems] remove failed', e)
  }
  return list
}

/** 탐색에서 저장된 항목의 체크 여부 갱신 — 보관함 상세·통합 체크리스트와 동기화 */
export function setSavedItemChecked(tripId, itemId, checked) {
  const list = loadSavedItems(tripId)
  const idx = list.findIndex((x) => String(x.id) === String(itemId))
  if (idx < 0) return list
  const next = [...list]
  next[idx] = { ...next[idx], checked }
  try {
    localStorage.setItem(STORAGE_PREFIX + String(tripId), JSON.stringify(next))
  } catch (e) {
    console.warn('[savedTripItems] setSavedItemChecked failed', e)
  }
  return next
}

/** 이미 저장된 행의 제목·부제만 갱신 (보관함 섹션 편집 등) */
export function patchSavedItemContent(tripId, itemId, { title, subtitle }) {
  const list = loadSavedItems(tripId)
  const idx = list.findIndex((x) => String(x.id) === String(itemId))
  if (idx < 0) return list
  const next = [...list]
  next[idx] = {
    ...next[idx],
    ...(title != null ? { title } : {}),
    ...(subtitle != null ? { subtitle } : {}),
  }
  try {
    localStorage.setItem(STORAGE_PREFIX + String(tripId), JSON.stringify(next))
  } catch (e) {
    console.warn('[savedTripItems] patchSavedItemContent failed', e)
  }
  return next
}

/**
 * 기본 체크리스트 항목 + 탐색에서만 추가된 저장 항목을 한 목록으로 합칩니다.
 * (동일 id가 초기 목록에 없으면 뒤에 붙입니다.)
 */
export function mergeWithInitialChecklist(tripId, initialItems) {
  const saved = loadSavedItems(tripId)
  const initialIds = new Set(initialItems.map((i) => String(i.id)))
  const merged = initialItems.map((i) => ({ ...i }))

  saved.forEach((s) => {
    if (initialIds.has(String(s.id))) return
    merged.push({
      id: s.id,
      category: s.category,
      title: s.title,
      subtitle: s.subtitle || '',
      checked: s.checked ?? false,
    })
  })
  return merged
}

export function countSavedItems(tripId) {
  return loadSavedItems(tripId).length
}

/**
 * 여러 항목을 한 번에 localStorage에 저장하고, 실제 DB trip이면 서버에도 upsert.
 * localStorage가 진실값(source of truth)이며 서버 호출은 fire-and-forget.
 * @param {string|number} tripId
 * @param {Array} items - adaptGeneratedChecklist 결과 항목 (subCategory, prepType, baggageType, source 포함)
 */
export function saveItemsForTrip(tripId, items) {
  if (!items || items.length === 0) return

  items.forEach((item) => {
    saveItemForTrip(tripId, {
      id: item.id,
      category: item.category,
      title: item.title,
      subtitle: item.detail || item.description || '',
    })
  })

  if (String(tripId) === PLACEHOLDER_TRIP_ID) return

  const upsertPayload = items
    .filter((i) => i.subCategory && i.prepType && i.baggageType && i.source && i.title)
    .map((i, idx) => ({
      title: i.title,
      description: i.description || undefined,
      categoryCode: i.subCategory,
      prepType: i.prepType,
      baggageType: i.baggageType,
      source: i.source === 'template' || i.source === 'llm' ? i.source : 'user_added',
      orderIndex: idx,
    }))

  if (upsertPayload.length === 0) return

  upsertChecklistItems(tripId, upsertPayload).catch((err) => {
    if (import.meta.env.DEV) console.warn('[savedTripItems] upsert failed', err?.message ?? err)
  })
}

/** 저장 목록 전체를 덮어씁니다. (예시 시드 등 특수 용도) */
export function replaceSavedItemsList(tripId, list) {
  if (tripId == null) return
  try {
    localStorage.setItem(STORAGE_PREFIX + String(tripId), JSON.stringify(list))
  } catch (e) {
    console.warn('[savedTripItems] replaceSavedItemsList failed', e)
  }
}
