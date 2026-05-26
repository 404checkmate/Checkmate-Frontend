import { COUNTRY_ARRIVAL_OPTIONS } from '@/mocks/tripNewDestinationData'

/** `<input type="date" min>` 용 — 브라우저 로컬 달력과 맞추기 위해 UTC가 아닌 로컬 날짜 사용 */
export function getLocalDateYYYYMMDD() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** API 응답(countries + cities)을 COUNTRY_ARRIVAL_OPTIONS 형태로 변환 */
export function buildCountryArrivalOptions(countries, cities) {
  const citiesByCountryId = {}
  for (const city of cities) {
    const key = String(city.countryId)
    if (!citiesByCountryId[key]) citiesByCountryId[key] = []
    citiesByCountryId[key].push(city)
  }
  return countries.map((country) => {
    const mockEntry = COUNTRY_ARRIVAL_OPTIONS.find((m) => m.countryCode === country.code)
    const countryCities = (citiesByCountryId[String(country.id)] ?? []).filter((c) => c.iataCode)
    const primaryCity = countryCities[0]
    return {
      name: country.nameKo,
      aliases: mockEntry?.aliases ?? [],
      iata: primaryCity?.iataCode ?? mockEntry?.iata ?? '',
      city: primaryCity?.nameKo ?? mockEntry?.city ?? '',
      country: country.nameKo,
      countryCode: country.code,
      arrivals: (() => {
          if (countryCities.length === 0) return mockEntry?.arrivals ?? []
          const apiArrivals = countryCities.map((c) => ({
            city: c.nameKo,
            iata: c.iataCode,
            aliases: mockEntry?.arrivals?.find((a) => a.city === c.nameKo)?.aliases ?? [],
          }))
          const apiCityNames = new Set(apiArrivals.map((a) => a.city))
          const apiIataCodes = new Set(apiArrivals.map((a) => a.iata).filter(Boolean))
          const mockExtras = (mockEntry?.arrivals ?? []).filter(
            (a) => !apiCityNames.has(a.city) && !(a.iata && apiIataCodes.has(a.iata))
          )
          return [...apiArrivals, ...mockExtras]
        })(),
    }
  })
}

/** 엔터·정확 일치용: 목록에서 국가명 또는 별칭과 일치하는 항목 */
export function findExactCountryMatch(trimmedQuery, list) {
  const q = trimmedQuery
  if (!q) return null
  const lower = q.toLowerCase()
  return (
    list.find((c) => c.name === q) ||
    list.find((c) => c.aliases?.some((a) => a.toLowerCase() === lower)) ||
    null
  )
}

export function countryRowWithoutArrivals(row) {
  if (!row) return row
  const { arrivals: _a, ...rest } = row
  return rest
}

export function formatDateKo(ymd) {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-').map(Number)
  return `${y}년 ${m}월 ${d}일`
}
