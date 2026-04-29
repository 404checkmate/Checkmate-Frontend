/**
 * 가이드 보관함 — 서버 단일 소스 wrapper.
 *
 * 이 파일은 과거 localStorage(`travel_fe_guide_archive_v1_<tripId>`) 기반이었으나,
 * 다중 기기 동기화 / MyGuideArchivesPage 와의 ID 공간 통일을 위해 전면적으로 서버 API
 * (`/api/trips/:tripId/guide-archives`, `/api/guide-archives/:id`) 단일 소스로 전환됨.
 *
 * 변경 사항:
 *   - 모든 함수가 비동기(Promise) 가 됨.
 *   - 함수 시그니처는 기존 호출부 호환을 위해 유지 (tripId, entryId, partial …).
 *   - localStorage 읽기/쓰기 코드는 전부 제거.
 *
 * 별도 파일인 `guideArchiveEntryChecklistStorage.js` (per-entry 체크 진행률) 는
 * 이번 마이그레이션 범위 밖이므로 그대로 유지.
 */
import {
  listGuideArchives as apiListGuideArchives,
  createGuideArchive as apiCreateGuideArchive,
  updateGuideArchive as apiUpdateGuideArchive,
  deleteGuideArchive as apiDeleteGuideArchive,
  fetchTripGuideArchives as apiFetchTripGuideArchives,
  toEntryShape,
} from '@/api/guideArchives'

/**
 * @typedef {Object} GuideArchiveEntry
 * @property {string} id           - server BigInt id (stringified)
 * @property {string} serverId     - id 와 동일. 레거시 호환을 위해 둘 다 노출.
 * @property {string} archivedAt   - ISO
 * @property {string} pageTitle
 * @property {string} destination
 * @property {string} country
 * @property {string} tripWindowLabel
 * @property {string} weatherSummary
 * @property {Array<{ id: string, category: string, title: string, ... }>} items
 * ... (snapshot 의 나머지 필드들 — 자유 형식)
 */

/**
 * 한 trip 의 보관함 entry 목록을 서버에서 가져온다.
 * @param {string|number} tripId
 * @returns {Promise<GuideArchiveEntry[]>}
 */
export async function loadGuideArchive(tripId) {
  if (tripId == null) return []
  return apiFetchTripGuideArchives(tripId)
}

/**
 * 한 entry 단건 조회. server id 기반.
 * @param {string|number} tripId
 * @param {string|number} entryId
 * @returns {Promise<GuideArchiveEntry|null>}
 */
export async function getGuideArchiveEntry(tripId, entryId) {
  if (tripId == null || entryId == null) return null
  const list = await apiFetchTripGuideArchives(tripId)
  return list.find((e) => String(e.id) === String(entryId)) ?? null
}

/**
 * 새 entry 를 서버에 생성하고 entry 형태로 반환.
 * `snapshot` 은 객체 통째로 서버에 저장되며, 이후 read 시 그대로 풀려 entry 의 베이스가 된다.
 * @param {string|number} tripId
 * @param {Object} snapshot
 * @returns {Promise<GuideArchiveEntry>}
 */
export async function appendGuideArchiveEntry(tripId, snapshot) {
  if (tripId == null) throw new Error('tripId required')
  const name = snapshot?.pageTitle ?? snapshot?.name ?? '보관함 항목'
  const archive = await apiCreateGuideArchive(tripId, { name, snapshot })
  return toEntryShape(archive)
}

/**
 * entry 의 일부 필드를 갱신. server snapshot 은 객체 전체가 교체되므로
 * 내부적으로 GET 으로 현재 snapshot 을 가져와 partial 을 머지한 뒤 PATCH.
 * 호출부는 기존처럼 `(tripId, entryId, partial)` 로 호출하면 됨 — fire-and-forget 가능.
 *
 * @param {string|number} _tripId  - 시그니처 호환용. 실제로는 사용하지 않음.
 * @param {string|number} entryId
 * @param {Object} partial
 * @returns {Promise<GuideArchiveEntry|null>}
 */
export async function patchGuideArchiveEntry(_tripId, entryId, partial) {
  if (entryId == null || !partial || typeof partial !== 'object') return null
  // 현재 snapshot 을 받아와 partial 을 머지 (server 는 snapshot 을 통째로 교체).
  const list = _tripId != null ? await apiFetchTripGuideArchives(_tripId) : []
  const current = list.find((e) => String(e.id) === String(entryId)) ?? null
  const baseSnap = current
    ? Object.fromEntries(
        Object.entries(current).filter(([k]) => !['id', 'serverId', 'archivedAt', 'updatedAt'].includes(k)),
      )
    : {}
  const nextSnap = { ...baseSnap, ...partial }
  try {
    const updated = await apiUpdateGuideArchive(entryId, { snapshot: nextSnap })
    return toEntryShape(updated)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[guideArchiveStorage] patchGuideArchiveEntry 실패', err?.message ?? err)
    }
    return null
  }
}

/**
 * 여러 entry 를 일괄 삭제.
 * @param {string|number} _tripId
 * @param {Array<string|number>} entryIds
 */
export async function removeGuideArchiveEntriesByIds(_tripId, entryIds) {
  if (!Array.isArray(entryIds) || entryIds.length === 0) return
  await Promise.all(
    entryIds.map((id) =>
      apiDeleteGuideArchive(id).catch((err) => {
        if (import.meta.env.DEV) {
          console.warn('[guideArchiveStorage] delete 실패', err?.message ?? err)
        }
      }),
    ),
  )
}

/**
 * 과거 호환용 — 단순히 server fetch 와 동일.
 * (호출부에서 sync 후 set 하는 패턴을 유지하기 위해 시그니처만 보존)
 * @param {string|number} tripId
 * @returns {Promise<GuideArchiveEntry[]>}
 */
export async function syncGuideArchivesFromServer(tripId) {
  return loadGuideArchive(tripId)
}

/** 사용처가 사라졌으나 import 호환을 위해 no-op 으로 유지. */
export function saveGuideArchiveList() {
  /* no-op (server 단일 소스로 전환됨) */
}

// 직접 export (디버그/테스트 편의용).
export { apiListGuideArchives, apiCreateGuideArchive, apiUpdateGuideArchive, apiDeleteGuideArchive }
