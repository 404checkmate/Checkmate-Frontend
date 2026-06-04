import { ingestEvents } from '@/api/analytics'
import { getMe } from '@/api/auth'
import env from '@/config/env'

const SESSION_ID_KEY = 'cm_analytics_sid'
const USER_ID_CACHE_KEY = 'cm_analytics_uid'
const FLUSH_INTERVAL_MS = 5000
const FLUSH_BATCH_SIZE = 5

/**
 * Frontend event name → backend UserEventType enum value.
 * Events without a mapping (login_started, login_completed, trip_creation_completed)
 * are logged to console only and never sent to the backend.
 */
const EVENT_TYPE_MAP = {
  // 기존 매핑
  search_start: 'search',
  search_items_loaded: 'search',
  search_item_toggle_select: 'detail_check',
  search_select_all_in_view: 'detail_check',
  search_deselect_all_in_view: 'detail_check',
  search_select_all_in_group: 'detail_check',
  search_deselect_all_in_group: 'detail_check',
  research_trigger: 're_search',
  save_complete: 'save',
  save_confirm_navigate_guide_archive: 'save',
  save_confirm_navigate_guide_archive_merge: 'save',
  guide_archive_list_opened: 'saved_list_open',
  guide_archive_entries_deleted: 'edit_del',
  // console-only → DB 저장 전환
  login_started: 'login',
  login_completed: 'login',
  trip_creation_completed: 'trip_created',
  // 신규 이벤트
  page_view: 'page_view',
  cta_click: 'cta_click',
  step_complete: 'step_complete',
  item_checked: 'prepare_action',
  session_start: 'session_start',
  // Edit 세부 타입
  edit_text: 'edit_text',
  edit_add: 'edit_add',
  edit_del: 'edit_del',
  edit_reorder: 'edit_reorder',
  // Backflow (confirm loop → store loop)
  backflow_trigger: 're_search',
  // Store Loop 진입 신호
  travel_fixed: 'trip_created',
  // 게스트 프리뷰 (비로그인 저장 플로우) — 프리뷰 진입→완료→로그인 전환 퍼널 측정
  guest_preview_opened: 'page_view',
  guest_preview_complete_clicked: 'cta_click',
  guest_preview_login_redirect: 'cta_click',
  guest_preview_leave_guard_shown: 'page_view',
  guest_preview_leave_anyway: 'cta_click',
}

let resolvedUserId = null
let userIdPromise = null

async function resolveUserId() {
  if (resolvedUserId) return resolvedUserId
  try {
    const cached = sessionStorage.getItem(USER_ID_CACHE_KEY)
    if (cached) {
      resolvedUserId = cached
      return cached
    }
  } catch {}
  if (!userIdPromise) {
    userIdPromise = (async () => {
      try {
        const user = await getMe()
        const id = user?.profile?.id
        if (id) {
          const sid = String(id)
          try { sessionStorage.setItem(USER_ID_CACHE_KEY, sid) } catch {}
          resolvedUserId = sid
          return sid
        }
      } catch {}
      return null
    })().finally(() => { userIdPromise = null })
  }
  return userIdPromise
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem(SESSION_ID_KEY, id)
    }
    return id
  } catch {
    return `s-${Date.now()}`
  }
}

function isNumericId(val) {
  return val != null && /^\d+$/.test(String(val))
}

const ANALYTICS_ENDPOINT = `${env.API_BASE_URL}/analytics/events`

let queue = []
let flushTimer = null

async function flush() {
  if (!queue.length) return
  const batch = queue.splice(0)
  const userId = await resolveUserId()
  const sessionId = getSessionId()
  const events = batch.map((item) => ({
    ...(userId != null && { userId }),
    sessionId,
    eventType: item.eventType,
    ...(item.tripId != null && { tripId: item.tripId }),
    ...(item.itemId != null && { itemId: item.itemId }),
    metadata: item.metadata,
    occurredAt: item.occurredAt,
  }))
  ingestEvents(events).catch(() => {})
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flush()
  }, FLUSH_INTERVAL_MS)
}

/**
 * 페이지 종료 직전 동기 flush.
 * async Axios는 unload 시 취소될 수 있으므로 sendBeacon(우선) → fetch keepalive(폴백) 사용.
 * resolvedUserId는 이미 캐시된 값만 사용 (unload 중 await 불가).
 */
function flushWithBeacon() {
  if (!queue.length) return
  const batch = queue.splice(0)
  const sessionId = getSessionId()
  const events = batch.map((item) => ({
    ...(resolvedUserId != null && { userId: resolvedUserId }),
    sessionId,
    eventType: item.eventType,
    ...(item.tripId != null && { tripId: item.tripId }),
    ...(item.itemId != null && { itemId: item.itemId }),
    metadata: item.metadata,
    occurredAt: item.occurredAt,
  }))
  const body = JSON.stringify(events)
  const sent =
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function' &&
    navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([body], { type: 'application/json' }))
  if (!sent) {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  }
}

// 탭 숨김·페이지 이탈 시 큐 강제 전송
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
      flushWithBeacon()
    }
  })
  // iOS Safari는 visibilitychange 전에 pagehide가 발생
  window.addEventListener('pagehide', () => {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
    flushWithBeacon()
  })
}

export function trackEvent(eventName, properties = {}) {
  if (import.meta.env.DEV) {
    console.debug('[Event]', eventName, properties)
  }
  const eventType = EVENT_TYPE_MAP[eventName]
  if (!eventType) return
  const { trip_id, item_id, ...meta } = properties
  queue.push({
    eventType,
    tripId: isNumericId(trip_id) ? String(trip_id) : null,
    itemId: isNumericId(item_id) ? String(item_id) : null,
    // _dev: 로컬 dev 빌드 이벤트 표시 — 비로그인 세션은 팀원 이메일로 제외할 수 없으므로 쿼리에서 이 플래그로 거른다
    metadata: { ...meta, _ev: eventName, ...(import.meta.env.DEV ? { _dev: true } : {}) },
    occurredAt: new Date().toISOString(),
  })
  if (queue.length >= FLUSH_BATCH_SIZE) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
    flush()
  } else {
    scheduleFlush()
  }
}

/** Call on logout to clear cached user identity. */
export function clearAnalyticsUser() {
  resolvedUserId = null
  try { sessionStorage.removeItem(USER_ID_CACHE_KEY) } catch {}
}
