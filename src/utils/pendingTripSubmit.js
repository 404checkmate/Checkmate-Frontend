const KEY = 'travel_fe_pending_trip_submit_v1'

export function savePendingTripSubmit(data) {
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

export function loadPendingTripSubmit() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPendingTripSubmit() {
  sessionStorage.removeItem(KEY)
}
