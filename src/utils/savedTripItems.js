/**
 * 탐색(TripSearchPage)에서 저장한 필수품을 localStorage에 보관하고
 * 가이드 보관함 체크리스트와 동기화할 때 사용합니다.
 */

const STORAGE_PREFIX = 'travel_fe_trip_saved_items_v1_'

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

/** 저장 목록 전체를 덮어씁니다. (예시 시드 등 특수 용도) */
export function replaceSavedItemsList(tripId, list) {
  if (tripId == null) return
  try {
    localStorage.setItem(STORAGE_PREFIX + String(tripId), JSON.stringify(list))
  } catch (e) {
    console.warn('[savedTripItems] replaceSavedItemsList failed', e)
  }
}
