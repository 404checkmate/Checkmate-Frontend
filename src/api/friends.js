import { apiClient } from '@/api/client'

/**
 * 친구 API — 초대 링크 방식 (docs/collab-checklist-plan.md Phase 1)
 *
 *   POST   /api/friends/invites               내 초대 링크 생성 → { token, expiresAt, maxUses }
 *   GET    /api/friends/invites/:token        초대 미리보기 (비로그인 허용)
 *   POST   /api/friends/invites/:token/accept 초대 수락 → { ok, alreadyFriends, friend }
 *   GET    /api/friends                       친구 목록 [{ userId, nickname, profileImageUrl, since }]
 *   DELETE /api/friends/:friendUserId         친구 삭제
 */

export async function createFriendInvite() {
  const res = await apiClient.post('/friends/invites')
  return res.data
}

export async function previewFriendInvite(token) {
  const res = await apiClient.get(`/friends/invites/${encodeURIComponent(token)}`)
  return res.data
}

export async function acceptFriendInvite(token) {
  const res = await apiClient.post(`/friends/invites/${encodeURIComponent(token)}/accept`)
  return res.data
}

export async function listFriends() {
  const res = await apiClient.get('/friends')
  return res.data
}

export async function removeFriend(friendUserId) {
  const res = await apiClient.delete(`/friends/${friendUserId}`)
  return res.data
}

/** 공유용 초대 링크 URL */
export function buildFriendInviteUrl(token) {
  return `${window.location.origin}/friends/invite/${token}`
}
