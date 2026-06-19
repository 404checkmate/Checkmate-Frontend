import { apiClient } from '@/api/client'

/**
 * 제휴 링크 API.
 * - 공개: 활성 링크 목록(항목 제목 매칭용)
 * - 관리자: 템플릿별 링크 조회/upsert/삭제 (ADMIN_EMAILS 가드)
 */

/** 공개 — [{ templateId, title, provider, url, label }] */
export async function fetchPublicAffiliateLinks() {
  const res = await apiClient.get('/affiliate-links')
  return res.data
}

/** 관리자 — 전체 템플릿 + 현재 링크 */
export async function fetchAffiliateTemplates() {
  const res = await apiClient.get('/admin/affiliate-links/templates')
  return res.data
}

/** 관리자 — 링크 생성/수정 */
export async function upsertAffiliateLink(templateId, body) {
  const res = await apiClient.put(`/admin/affiliate-links/${templateId}`, body)
  return res.data
}

/** 관리자 — 링크 제거 */
export async function deleteAffiliateLink(templateId) {
  const res = await apiClient.delete(`/admin/affiliate-links/${templateId}`)
  return res.data
}
