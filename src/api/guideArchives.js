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
