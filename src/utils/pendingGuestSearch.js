const KEY = 'checkmate_pending_guest_search_v1'

export function savePendingGuestSearch(data) {
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

export function loadPendingGuestSearch() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPendingGuestSearch() {
  sessionStorage.removeItem(KEY)
}
