import { useEffect, useState } from 'react'
import { COUNTRY_ARRIVAL_OPTIONS } from '@/mocks/tripNewDestinationData'
import { listCountries, listCities } from '@/api/master'
import { buildCountryArrivalOptions } from '@/utils/destinationHelpers'

/** API(countries + cities)를 기반으로 나라 자동완성 옵션을 로드 */
export function useCountryOptions() {
  const [countryOptions, setCountryOptions] = useState(COUNTRY_ARRIVAL_OPTIONS)

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

  return countryOptions
}
