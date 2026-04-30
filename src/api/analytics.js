import { apiClient } from '@/api/client'

/**
 * 사용자 행동 이벤트 수집 — 로우 레벨 배치 전송.
 *
 *   POST /api/analytics/events     Body: Event | Event[]
 *
 * Event = {
 *   userId: string|number,
 *   tripId?: string|number|null,
 *   itemId?: string|number|null,
 *   sessionId: string,
 *   eventType: 'search' | 'detail_check' | 'save' | 'saved_list_open'
 *            | 'edit_text' | 'edit_add' | 'edit_del' | 'edit_reorder'
 *            | 'prepare_action' | 're_search' | 'missing_item_detection',
 *   metadata?: Record<string, unknown>,
 *   occurredAt?: string   // ISO
 * }
 *
 * 네트워크 오류로 분석 데이터 때문에 유저 플로우가 깨지지 않도록 try/catch 로 감싼다.
 * 배치 전송·sessionId 관리가 필요하면 `@/utils/analyticsTracker` 의 `trackEvent` 를 쓴다.
 */
export async function ingestEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return { ok: true }
  try {
    await apiClient.post('/analytics/events', events)
    return { ok: true }
  } catch (err) {
    if (err?.response?.status === 401) return { ok: false, error: 'unauthorized' }
    if (import.meta.env.DEV) {
      console.warn('[analytics] ingest failed', err?.message ?? err)
    }
    return { ok: false, error: String(err?.message ?? err) }
  }
}

/** Fire-and-forget 단건 전송. userId·sessionId 는 호출부에서 직접 채워야 한다. */
export function trackEventRaw(eventType, payload = {}) {
  ingestEvents([{ eventType, ...payload }]).catch(() => {})
}

/** Fire-and-forget 배치 전송. */
export function trackEventsRaw(events) {
  if (!events.length) return
  ingestEvents(events).catch(() => {})
}
