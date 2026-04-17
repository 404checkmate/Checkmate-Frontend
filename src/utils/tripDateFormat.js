/**
 * 여행 일자(YYYY-MM-DD) 표기 — 목적지·가이드 보관함·API DTO와 공유
 * 백엔드 연동 시 동일 필드(tripStartDate, tripEndDate)를 그대로 주고받을 수 있게 맞춤
 */

function parseYmd(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 예: 4월 10일 - 4월 13일 (같은 해) / 연도 넘어가면 연도 포함 */
export function formatKoreanDateRangeLine(startStr, endStr) {
  if (!startStr || !endStr) return ''
  const [y1, m1, d1] = startStr.split('-').map(Number)
  const [y2, m2, d2] = endStr.split('-').map(Number)
  if (y1 === y2) return `${m1}월 ${d1}일 - ${m2}월 ${d2}일`
  return `${y1}년 ${m1}월 ${d1}일 - ${y2}년 ${m2}월 ${d2}일`
}

/** 한국식 n박 m일 */
export function formatTripNightsDaysLabel(startStr, endStr) {
  const a = parseYmd(startStr)
  const b = parseYmd(endStr)
  if (!a || !b || b < a) return null
  const nights = Math.round((b - a) / 86400000)
  const days = nights + 1
  return `${nights}박 ${days}일`
}

/** 가이드 보관함·체크리스트 상단에 쓰는 한 줄 기간 요약 */
export function buildTripWindowLabelFromRange(startStr, endStr) {
  const range = formatKoreanDateRangeLine(startStr, endStr)
  const nights = formatTripNightsDaysLabel(startStr, endStr)
  if (!range || !nights) return ''
  return `${range} (${nights})`
}
