/**
 * `/trips/new/destination`에서 확정한 여행지·기간을 로컬에 보관합니다.
 * 백엔드 도입 후에는 동일 스키마로 POST /trips/:tripId/plan 또는 draft 동기화에 대응하면 됩니다.
 */

const STORAGE_KEY = 'travel_fe_active_trip_plan_v1'

/**
 * @typedef {Object} TripDestinationDraft
 * @property {string} iata
 * @property {string} city
 * @property {string} country
 * @property {string} countryCode
 */

/**
 * @typedef {Object} ActiveTripPlan
 * @property {TripDestinationDraft} destination
 * @property {string} tripStartDate - YYYY-MM-DD
 * @property {string} tripEndDate - YYYY-MM-DD
 * @property {string} [updatedAt] - ISO
 */

/**
 * @param {Omit<ActiveTripPlan, 'updatedAt'> & { updatedAt?: string }} plan
 */
export function saveActiveTripPlan(plan) {
  if (typeof window === 'undefined' || !plan?.destination) return
  try {
    const payload = {
      ...plan,
      updatedAt: plan.updatedAt ?? new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota */
  }
}

/** @returns {ActiveTripPlan | null} */
export function loadActiveTripPlan() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.destination || !parsed.tripStartDate || !parsed.tripEndDate) return null
    return parsed
  } catch {
    return null
  }
}

export function clearActiveTripPlan() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
