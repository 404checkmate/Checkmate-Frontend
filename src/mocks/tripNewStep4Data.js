/**
 * TripNewStep4Page 목데이터
 *
 * 항공편으로 입국 국가·공항이 정해진 뒤, 현지 체류 기간과 방문 동네/도시를 고르는 단계입니다.
 * Step4는 입국지와 무관하게 동일한 지역 입력 UI를 사용합니다.
 */

/* ─────────────────────────────────────────────
   스텝 설정
───────────────────────────────────────────── */
/** StepHeader: STEP 03 · 카운터 3 / 5 (전체 플로우 기준 진행도) */
export const STEP4_CONFIG = {
  totalSteps: 5,
  currentStep: 3,
}

/* ─────────────────────────────────────────────
   SVG path 상수
───────────────────────────────────────────── */
export const STEP4_ICON_PATHS = {
  mapPin:
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  plus:
    'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  close:
    'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  airplane:
    'M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z',
  sparkle:
    'M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z',
  globe:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  search:
    'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  calendar:
    'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z',
  grip:
    'M4 10h16v2H4v-2zm0-4h16v2H4V6zm0 8h16v2H4v-2z',
}

/* ─────────────────────────────────────────────
   이미지
───────────────────────────────────────────── */
export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop'

export const CITY_IMAGES = {
  호치민: 'https://images.unsplash.com/photo-1583417319070-a43c69133b09?q=80&w=600&auto=format&fit=crop',
  다낭: 'https://images.unsplash.com/photo-1559592419-3451401a54e8?q=80&w=600&auto=format&fit=crop',
  하노이: 'https://images.unsplash.com/photo-1599708153386-62bfadf65988?q=80&w=600&auto=format&fit=crop',
  나짱: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=600&auto=format&fit=crop',
  푸꾸옥: 'https://images.unsplash.com/photo-1596422846543-75e6c31db94e?q=80&w=600&auto=format&fit=crop',
  파리: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=400&auto=format&fit=crop',
  도쿄: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=400&auto=format&fit=crop',
  방콕: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=400&auto=format&fit=crop',
  싱가포르: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=400&auto=format&fit=crop',
  오사카: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=400&auto=format&fit=crop',
  로스앤젤레스: 'https://images.unsplash.com/photo-1580655653885-65763b2597d1?q=80&w=400&auto=format&fit=crop',
  뉴욕: 'https://images.unsplash.com/photo-1546436836-07a91091f160?q=80&w=400&auto=format&fit=crop',
  런던: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400&auto=format&fit=crop',
  시드니: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=400&auto=format&fit=crop',
  오키나와: 'https://images.unsplash.com/photo-1580552833534-2e4d32ba3cee?q=80&w=400&auto=format&fit=crop',
  삿포로: 'https://images.unsplash.com/photo-1547930-a8f00e01d6a3?q=80&w=400&auto=format&fit=crop',
  산야: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?q=80&w=400&auto=format&fit=crop',
}

export const DEFAULT_CITY_IMAGE =
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=400&auto=format&fit=crop'

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

/** yyyy-mm-dd 포함 며칠인지 (타임존 이슈 완화를 위해 정오 기준) */
export function countInclusiveTripDays(tripStart, tripEnd) {
  if (!tripStart || !tripEnd) return 0
  const a = new Date(`${tripStart}T12:00:00`)
  const b = new Date(`${tripEnd}T12:00:00`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0
  const diff = Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1
  return diff > 0 ? diff : 0
}

/** 카드 표시용: 2026.08.01 (금) */
export function formatTripDateLabel(isoDate) {
  if (!isoDate) return ''
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day} (${WEEKDAYS_KO[d.getDay()]})`
}

/**
 * 목데이터: 입국 공항(IATA)별 데모 여행 기간.
 * Step3에서 다른 공항으로 입국하면 다른 목 기간이 매칭됩니다.
 */
export function getMockTripWindowForArrival(arrival) {
  const iata = arrival?.iata || 'SGN'
  const byIata = {
    SGN: { tripStart: '2026-08-01', tripEnd: '2026-08-07' },
    DAD: { tripStart: '2026-08-10', tripEnd: '2026-08-14' },
    HAN: { tripStart: '2026-09-01', tripEnd: '2026-09-06' },
    CXR: { tripStart: '2026-07-15', tripEnd: '2026-07-20' },
    PQC: { tripStart: '2026-12-20', tripEnd: '2026-12-27' },
  }
  const w = byIata[iata] || { tripStart: '2026-08-01', tripEnd: '2026-08-07' }
  const totalDays = countInclusiveTripDays(w.tripStart, w.tripEnd)
  return { ...w, totalDays }
}

/**
 * Step4에 필요한 현지 여행 기간 (시작·종료·총 일수).
 *
 * ── 현재 ──
 * 목데이터만 사용하며, 네트워크 지연을 흉내 내기 위해 짧은 `setTimeout` 후 resolve 합니다.
 *
 * ── 백엔드 연동 시 ──
 * 아래 함수 본문을 실제 API 호출로 교체하세요. 응답은 아래 형태에 맞추면 Step4 로직을 그대로 쓸 수 있습니다.
 *
 * @example
 * // return {
 * //   tripStart: '2026-08-01',
 * //   tripEnd: '2026-08-07',
 * //   totalDays: 7,  // 생략 시 클라이언트에서 countInclusiveTripDays로 계산 가능
 * //   source: 'api',
 * // }
 *
 * Step4 마운트 시 한 번 호출되며, 응답이 바뀌면 항공 요약·다음 단계에 쓰는 여행 기간이 갱신됩니다.
 */
/**
 * @param {object} arrival Step3/목적지에서 넘긴 입국 정보
 * @param {{ tripStart?: string, tripEnd?: string, source?: string } | null} [opts]
 *        목적지 페이지 등에서 사용자가 고른 여행 기간이 있으면 목 기간 대신 사용
 */
export async function fetchTripDatesForStep4(arrival, opts = null) {
  await new Promise((resolve) => setTimeout(resolve, 450))
  if (opts?.tripStart && opts?.tripEnd) {
    const totalDays = countInclusiveTripDays(opts.tripStart, opts.tripEnd)
    return {
      tripStart: opts.tripStart,
      tripEnd: opts.tripEnd,
      totalDays: totalDays > 0 ? totalDays : 1,
      source: opts.source || 'destination-picker',
    }
  }
  const mock = getMockTripWindowForArrival(arrival)
  return {
    tripStart: mock.tripStart,
    tripEnd: mock.tripEnd,
    totalDays: mock.totalDays,
    /** UI에 목데이터 문구를 붙이지 않기 위한 구분값 (추후 API 연동 시 대체) */
    source: 'itinerary',
  }
}

/* ─────────────────────────────────────────────
   AI 팁 (제목: 꿀 Tip!)
───────────────────────────────────────────── */
export const AI_TIP = {
  description:
    '입국 공항만으로도 안내를 이어갈 수 있어요. <strong>방문할 지역</strong>을 추가로 적어 주시면 날씨·일정에 맞는 <strong>준비물</strong>을 더 정확히 드릴 수 있어요.',
}
