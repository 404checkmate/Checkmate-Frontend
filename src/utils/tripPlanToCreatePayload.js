/**
 * 로컬스토리지의 여행 플랜(+ Step5 동행/스타일 선택) 을
 * 백엔드 `CreateTripDto` 형태로 변환한다.
 *
 *   - destination.countryCode → countryCode (대문자)
 *   - destination.iata         → cities[0].cityIata
 *   - tripStartDate / tripEndDate → tripStart / tripEnd (ISO date)
 *   - 동행 id (withPet 포함) → companionCode + hasPet 플래그
 *   - 여행 스타일 id            → travelStyles[*].styleCode (백엔드에 없는 코드는 드롭)
 *
 * Phase 3 MVP 에서는 Step3 에서 입력한 항공권을 플랜에 보관하지 않으므로
 * `bookingStatus='not_booked' / flights=[]` 로 시작한다. 추후 항공편 영속화를 더한다.
 */

const DEFAULT_BOOKING_STATUS = 'not_booked'

// 백엔드 `seed.ts` 와 동기화되어야 하는 companion 코드 화이트리스트.
// Step5 UI 의 `withPet` 만 서버 `pets` 로 리네이밍한다.
// API 응답 기반 렌더링 시 id 가 DB code 인 `pets` 로 세팅되므로 양쪽 모두 등록.
const COMPANION_ALIAS = {
  alone: 'alone',
  couple: 'couple',
  withKids: 'withKids',
  friends: 'friends',
  parents: 'parents',
  withPet: 'pets',
  pets: 'pets',
}

// 서버가 아는 travel style 코드.
// Step5 mock 과 seed 를 맞춘 후에도 화이트리스트 로 한 번 더 걸러서 400 방지.
const SUPPORTED_TRAVEL_STYLE_CODES = new Set([
  'foodie',
  'landmark',
  'healing',
  'shopping',
  'nature',
  'activity',
  'culture',
  'photo',
  'nightlife',
])

/**
 * @typedef {Object} Step5Selections
 * @property {string[]} companionIds  - Step5 동행 UI id 배열 (1~2개)
 * @property {boolean} hasPet        - companionId === 'withPet' 과 별개로, 펫 동반 명시용
 * @property {string[]} travelStyleIds - Step5 여행 스타일 id 배열
 */

/**
 * @typedef {Object} TripCreatePayload
 * @property {string} countryCode
 * @property {string} title
 * @property {string} tripStart  - YYYY-MM-DD
 * @property {string} tripEnd    - YYYY-MM-DD
 * @property {'booked'|'not_booked'} bookingStatus
 * @property {Array<{cityIata?:string, orderIndex:number, isAutoSynced?:boolean}>} cities
 * @property {Array<any>} flights
 * @property {Array<{companionCode:string, hasPet?:boolean}>} companions
 * @property {Array<{styleCode:string}>} travelStyles
 */

/**
 * 표시용 기본 제목 — "{국가} {도시} 여행"
 */
function buildTitle(plan) {
  const country = plan?.destination?.country?.trim()
  const city = plan?.destination?.city?.trim()
  if (country && city) return `${country} ${city} 여행`
  if (country) return `${country} 여행`
  if (city) return `${city} 여행`
  return '나의 여행'
}

/**
 * companionIds 배열 (+pet 여부) → 서버용 TripCompanionInput 배열.
 * withPet/pets 를 누른 경우 hasPet=true 로 통일.
 */
function toCompanions(companionIds, hasPet) {
  if (!Array.isArray(companionIds) || companionIds.length === 0) return []
  return companionIds
    .map((id) => {
      const code = COMPANION_ALIAS[id] ?? null
      if (!code) return null
      return { companionCode: code, hasPet: Boolean(hasPet || id === 'withPet' || id === 'pets') }
    })
    .filter(Boolean)
}

/**
 * travelStyleIds → 서버 TravelStyleInput 배열.
 * 서버 seed 에 없는 코드는 조용히 드롭한다 (400 유발 방지).
 */
function toTravelStyles(styleIds) {
  if (!Array.isArray(styleIds)) return []
  return styleIds
    .filter((id) => SUPPORTED_TRAVEL_STYLE_CODES.has(id))
    .map((id) => ({ styleCode: id }))
}

/**
 * 메인 변환기.
 *
 * @param {ActiveTripPlan} plan                 localStorage `travel_fe_active_trip_plan_v1`
 * @param {Step5Selections} step5               TripNewStep5Page 의 선택 상태
 * @returns {TripCreatePayload | null}          입력이 모자라면 null — 이때는 Trip 생성 skip.
 */
export function buildCreateTripPayload(plan, step5) {
  if (!plan?.destination?.countryCode) return null
  if (!plan.tripStartDate || !plan.tripEndDate) return null
  if (!step5?.companionIds?.length || !Array.isArray(step5?.travelStyleIds) || step5.travelStyleIds.length === 0) {
    return null
  }

  const countryCode = String(plan.destination.countryCode).toUpperCase().slice(0, 2)
  const iata = plan.destination.iata ? String(plan.destination.iata).toUpperCase().slice(0, 3) : null
  const customCityName = !iata ? (plan.destination.city?.trim() || null) : null

  // 백엔드 CreateTripDto 는 cities 최소 1개를 요구 — iata 또는 customCityName 중 하나 필요.
  if (!iata && !customCityName) return null

  const cities = iata
    ? [{ cityIata: iata, orderIndex: 0, isAutoSynced: false }]
    : [{ customCityName, orderIndex: 0, isAutoSynced: false }]

  return {
    countryCode,
    title: buildTitle(plan),
    tripStart: plan.tripStartDate,
    tripEnd: plan.tripEndDate,
    bookingStatus: DEFAULT_BOOKING_STATUS,
    status: 'planning',
    cities,
    flights: [],
    companions: toCompanions(step5.companionIds, step5.hasPet),
    travelStyles: toTravelStyles(step5.travelStyleIds),
  }
}
