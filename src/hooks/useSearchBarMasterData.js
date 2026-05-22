import { useState, useEffect } from 'react'
import { COUNTRY_ARRIVAL_OPTIONS } from '@/mocks/tripNewDestinationData'
import { COMPANIONS, TRAVEL_STYLES } from '@/mocks/tripNewStep5Data'
import { listCountries, listCities, listCompanionTypes, listTravelStyles } from '@/api/master'

function buildCountryArrivalOptions(countries, cities) {
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
      arrivals: countryCities.length > 0
        ? countryCities.map((c) => ({
            city: c.nameKo,
            iata: c.iataCode,
            aliases: mockEntry?.arrivals?.find((a) => a.iata === c.iataCode)?.aliases ?? [],
          }))
        : (mockEntry?.arrivals ?? []),
    }
  })
}

export function useSearchBarMasterData() {
  const [countryOptions, setCountryOptions] = useState(COUNTRY_ARRIVAL_OPTIONS)
  const [companions, setCompanions] = useState(COMPANIONS)
  const [travelStyles, setTravelStyles] = useState(TRAVEL_STYLES)

  useEffect(() => {
    let cancelled = false
    Promise.all([listCountries(), listCities({ onlyServed: true })])
      .then(([countries, cities]) => {
        if (cancelled) return
        setCountryOptions(buildCountryArrivalOptions(countries, cities))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([listCompanionTypes(), listTravelStyles()])
      .then(([apiCompanions, apiStyles]) => {
        if (cancelled) return
        setCompanions(apiCompanions.map((c) => {
          const mock = COMPANIONS.find((m) => m.id === c.code)
          return { id: c.code, label: c.labelKo, description: mock?.description ?? '', icon: mock?.icon ?? 'person' }
        }))
        setTravelStyles(apiStyles.map((s) => {
          const mock = TRAVEL_STYLES.find((m) => m.id === s.code)
          return { id: s.code, label: s.labelKo, iconSrc: mock?.iconSrc }
        }))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return { countryOptions, companions, travelStyles }
}
