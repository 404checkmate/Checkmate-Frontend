/**
 * 개인/공동 짐 협업 메타의 localStorage 캐시 (stale-while-revalidate).
 *
 * 멤버 목록(listTripMembers)과 항목 메타(getChecklistByTrip의 scope/personalSummary/assignee)는
 * 매번 네트워크 왕복 후에야 도착해 협업 UI가 늦게 떠 보이는 문제가 있다.
 * 마지막으로 본 값을 캐시해 두고 재방문 시 즉시 렌더한 뒤, 서버 응답이 오면 갱신한다.
 * 서버가 항상 진실 소스 — 캐시는 첫 페인트용일 뿐이다.
 */

const MEMBERS_PREFIX = 'travel_fe_trip_members_v1_'
const ITEM_META_PREFIX = 'travel_fe_ga_entry_itemmeta_v1_'

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('[collabMetaStorage] save failed', e)
  }
}

/** @returns {Array<{userId, nickname, profileImageUrl, role}>} 마지막으로 본 멤버 목록 */
export function loadTripMembersCache(tripId) {
  if (tripId == null) return []
  const v = loadJson(MEMBERS_PREFIX + String(tripId), [])
  return Array.isArray(v) ? v : []
}

export function saveTripMembersCache(tripId, members) {
  if (tripId == null) return
  saveJson(MEMBERS_PREFIX + String(tripId), Array.isArray(members) ? members : [])
}

/** @returns {Record<string, {scope, personalSummary, assignee}>} localId → 항목 협업 메타 */
export function loadEntryItemMetaCache(tripId, entryId) {
  if (tripId == null || entryId == null) return {}
  const v = loadJson(ITEM_META_PREFIX + String(tripId) + '_' + String(entryId), {})
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
}

export function saveEntryItemMetaCache(tripId, entryId, meta) {
  if (tripId == null || entryId == null) return
  saveJson(ITEM_META_PREFIX + String(tripId) + '_' + String(entryId), meta ?? {})
}
