import { apiClient } from '@/api/client'

/**
 * 트립 멤버/초대 API — 체크리스트 공동 편집 (docs/collab-checklist-plan.md Phase 2)
 *
 *   POST   /api/trips/:tripId/invites          초대 링크 생성 → { token, expiresAt, maxUses }
 *   GET    /api/trips/invites/:token           미리보기 (비로그인 허용)
 *   POST   /api/trips/invites/:token/accept    수락 → { ok, alreadyMember, tripId, tripTitle, archiveId }
 *   GET    /api/trips/:tripId/members          멤버 목록 [{ userId, nickname, profileImageUrl, role, joinedAt }]
 *   DELETE /api/trips/:tripId/members/:userId  내보내기(소유자) / 나가기(본인)
 */

export async function createTripInvite(tripId) {
  const res = await apiClient.post(`/trips/${tripId}/invites`)
  return res.data
}

export async function previewTripInvite(token) {
  const res = await apiClient.get(`/trips/invites/${encodeURIComponent(token)}`)
  return res.data
}

export async function acceptTripInvite(token) {
  const res = await apiClient.post(`/trips/invites/${encodeURIComponent(token)}/accept`)
  return res.data
}

export async function listTripMembers(tripId) {
  const res = await apiClient.get(`/trips/${tripId}/members`)
  return res.data
}

/** 친구 바로 추가 — 수락된 친구만 가능 */
export async function addTripMember(tripId, userId) {
  const res = await apiClient.post(`/trips/${tripId}/members`, { userId: String(userId) })
  return res.data
}

export async function removeTripMember(tripId, userId) {
  const res = await apiClient.delete(`/trips/${tripId}/members/${userId}`)
  return res.data
}

/** 공유용 트립 초대 링크 URL */
export function buildTripInviteUrl(token) {
  return `${window.location.origin}/trips/invite/${token}`
}

/** 내가 받은 트립 초대(수락 대기) 목록 */
export async function fetchReceivedTripInvites() {
  const res = await apiClient.get('/trips/member-invites/received')
  return res.data
}

/** 받은 초대 응답 — action: 'accept' | 'decline' */
export async function respondTripInvite(tripId, action) {
  const res = await apiClient.patch(`/trips/${tripId}/members/me`, { action })
  return res.data
}
