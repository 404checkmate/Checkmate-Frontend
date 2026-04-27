import { ingestEvents } from '@/api/analytics'
import { getMe } from '@/api/auth'

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

let queue = []
let flushTimer = null

async function flush() {
  if (!queue.length) return
  const batch = queue.splice(0)
  const userId = await resolveUserId()
  if (!userId) return
  const sessionId = getSessionId()
  const events = batch.map((item) => ({
    userId,
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
    metadata: { ...meta, _ev: eventName },
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
