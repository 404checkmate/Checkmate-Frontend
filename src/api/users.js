import { apiClient } from '@/api/client'

/**
 * 내 프로필 수정 (온보딩 "성별·생년월일" 저장 등).
 *
 *   PATCH /api/users/me
 *   Body: { nickname?, gender?, birthDate?: 'YYYY-MM-DD', profileImageUrl? }
 */
export async function updateMyProfile(patch) {
  const res = await apiClient.patch('/users/me', patch)
  return res.data?.user ?? null
}

/**
 * 약관/개인정보 동의 수락.
 *
 *   POST /api/users/me/consent
 *   Body: { marketingOptIn?: boolean }
 */
export async function acceptLegalConsent({ marketingOptIn = false } = {}) {
  const res = await apiClient.post('/users/me/consent', { marketingOptIn })
  return res.data
}

/**
 * 회원탈퇴 — 개인정보 익명화 + 트립 삭제 + 친구/멤버 관계 정리.
 * 성공 후 프론트에서 signOut() 필수.
 *
 *   DELETE /api/users/me
 */
export async function deleteMyAccount() {
  const res = await apiClient.delete('/users/me')
  return res.data
}
