import { apiClient } from '@/api/client'

/**
 * Guide Archive (여행별 "저장한 가이드") API.
 *
 * 라우트:
 *   GET    /api/trips/:tripId/guide-archives
 *   POST   /api/trips/:tripId/guide-archives        Body: { name, snapshot }
 *   PATCH  /api/guide-archives/:archiveId            Body: { name?, snapshot? }
 *   DELETE /api/guide-archives/:archiveId
 */
export async function listGuideArchives(tripId) {
  const res = await apiClient.get(`/trips/${tripId}/guide-archives`)
  return res.data?.archives ?? []
}

export async function createGuideArchive(tripId, { name, snapshot }) {
  const res = await apiClient.post(`/trips/${tripId}/guide-archives`, {
    name,
    snapshot,
  })
  return res.data
}

export async function updateGuideArchive(archiveId, patch) {
  const res = await apiClient.patch(`/guide-archives/${archiveId}`, patch)
  return res.data
}

export async function deleteGuideArchive(archiveId) {
  const res = await apiClient.delete(`/guide-archives/${archiveId}`)
  return res.data
}

export async function fetchMyGuideArchives() {
  const res = await apiClient.get('/guide-archives/mine')
  return res.data
}

/**
 * 한 trip 의 보관함을 entry 형태로 조회.
 *
 * 응답 매핑:
 *   archive.snapshot 필드들을 entry 의 베이스로 펼치고, 위에
 *   `id`/`serverId`/`archivedAt`/`isAiRecommended`/`name` 을 server 값으로 덮어쓴다.
 *
 * → entry.id 가 server BigInt id 로 통일되므로 MyGuideArchivesPage 의 링크 (`archive.id`)
 *   와 detail 페이지의 lookup 키가 자연스럽게 일치.
 */
export async function fetchTripGuideArchives(tripId) {
  if (tripId == null) return []
  const archives = await listGuideArchives(tripId)
  return archives.map(toEntryShape)
}

export function toEntryShape(archive) {
  const snap =
    archive?.snapshot && typeof archive.snapshot === 'object' && !Array.isArray(archive.snapshot)
      ? archive.snapshot
      : {}
  return {
    ...snap,
    id: archive.id,
    serverId: archive.id,
    archivedAt: archive.archivedAt,
    updatedAt: archive.updatedAt,
    isAiRecommended: Boolean(archive.isAiRecommended),
    name: archive.name,
  }
}
