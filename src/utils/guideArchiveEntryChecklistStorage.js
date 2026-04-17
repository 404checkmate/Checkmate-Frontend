/**
 * 가이드 보관함의 각 저장 목록(entry)마다 준비물 체크 상태를 분리해 둡니다.
 * (동일 tripId에 여러 여행지 스냅샷이 있어도 서로 진행률이 섞이지 않음)
 *
 * 백엔드 연동 시: PUT /trips/:tripId/guide-archive/:entryId/items/:itemId/check 와 1:1 매핑 가능
 */

const PREFIX = 'travel_fe_ga_entry_checks_v1_'

function storageKey(tripId, entryId) {
  return PREFIX + String(tripId) + '_' + String(entryId)
}

/**
 * @param {string|number} tripId
 * @param {string|number} entryId
 * @returns {Record<string, boolean>} itemId -> checked
 */
export function loadEntryChecklistChecks(tripId, entryId) {
  if (tripId == null || entryId == null) return {}
  try {
    const raw = localStorage.getItem(storageKey(tripId, entryId))
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * @param {string|number} tripId
 * @param {string|number} entryId
 * @param {Record<string, boolean>} checks
 */
export function saveEntryChecklistChecks(tripId, entryId, checks) {
  if (tripId == null || entryId == null) return
  try {
    localStorage.setItem(storageKey(tripId, entryId), JSON.stringify(checks))
  } catch (e) {
    console.warn('[guideArchiveEntryChecklistStorage] save failed', e)
  }
}

/**
 * @param {string|number} tripId
 * @param {string|number} entryId
 * @param {string|number} itemId
 * @param {boolean} checked
 */
export function setEntryChecklistItemChecked(tripId, entryId, itemId, checked) {
  const prev = loadEntryChecklistChecks(tripId, entryId)
  const id = String(itemId)
  const next = { ...prev, [id]: checked }
  saveEntryChecklistChecks(tripId, entryId, next)
  return next
}

/**
 * 상세 페이지 최초 진입 시, entry 전용 저장이 비어 있으면
 * 탐색에서 저장해 둔 trip 단위 체크 상태를 한 번 복사합니다(마이그레이션).
 *
 * @param {string|number} tripId
 * @param {string|number} entryId
 * @param {Array<{ id: string|number, checked?: boolean }>} savedItemsFromTrip loadSavedItems(tripId)
 * @param {Array<{ id: string|number }>} archiveItems entry.items
 */
export function seedEntryChecksFromSavedIfEmpty(tripId, entryId, savedItemsFromTrip, archiveItems) {
  const existing = loadEntryChecklistChecks(tripId, entryId)
  if (Object.keys(existing).length > 0) return existing

  const savedMap = new Map(savedItemsFromTrip.map((s) => [String(s.id), s]))
  const next = { ...existing }
  let any = false
  for (const it of archiveItems || []) {
    const id = String(it.id)
    const s = savedMap.get(id)
    if (s && typeof s.checked === 'boolean') {
      next[id] = s.checked
      any = true
    }
  }
  if (any) saveEntryChecklistChecks(tripId, entryId, next)
  return next
}
