import { apiClient } from '@/api/client'

/**
 * 인앱 알림 API (docs/collab-checklist-plan.md Phase 4)
 *
 *   GET  /api/notifications        → { unreadCount, items: [...] }
 *   POST /api/notifications/read   → { ids? } 생략 시 전체 읽음
 */

export async function fetchNotifications() {
  const res = await apiClient.get('/notifications')
  return res.data
}

export async function markNotificationsRead(ids) {
  const res = await apiClient.post('/notifications/read', ids?.length ? { ids } : {})
  return res.data
}
