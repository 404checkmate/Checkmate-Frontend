import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const POPULAR_DESTINATION_TAGS = [
  { label: '도쿄',    name: '일본',       country: '일본',       countryCode: 'JP', iata: 'NRT', city: '도쿄(나리타)' },
  { label: '오사카',  name: '일본',       country: '일본',       countryCode: 'JP', iata: 'KIX', city: '오사카(간사이)' },
  { label: '방콕',   name: '태국',       country: '태국',       countryCode: 'TH', iata: 'BKK', city: '방콕(수완나품)' },
  { label: '다낭',   name: '베트남',     country: '베트남',     countryCode: 'VN', iata: 'DAD', city: '다낭' },
  { label: '싱가포르', name: '싱가포르',  country: '싱가포르',   countryCode: 'SG', iata: 'SIN', city: '싱가포르' },
  { label: '발리',   name: '인도네시아', country: '인도네시아', countryCode: 'ID', iata: 'DPS', city: '발리(응우라라이)' },
]

export default function MobileDestinationSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/trips/new/destination')
  }

  return (
    <section className="lg:hidden overflow-hidden rounded-2xl bg-white shadow-sm shadow-gray-200/60">
      <div className="px-5 pb-4 pt-4 lg:px-6 lg:py-5">
        <h2 className="mb-3 text-sm font-bold text-[#04384a] lg:text-base">목적지 검색</h2>
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-left transition-colors focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 hover:border-teal-300 lg:py-3.5"
          >
            <svg
              className="h-4 w-4 shrink-0 text-[#3db4dd]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="나라, 도시 이름을 입력해 주세요"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {POPULAR_DESTINATION_TAGS.map((tag) => (
            <button
              key={`${tag.countryCode}-${tag.label}`}
              type="button"
              onClick={() =>
                navigate('/trips/new/destination', {
                  state: {
                    preselectedCountry: {
                      name: tag.name,
                      country: tag.country,
                      countryCode: tag.countryCode,
                      iata: tag.iata,
                      city: tag.city,
                    },
                  },
                })
              }
              className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700 transition-colors active:bg-teal-200 hover:bg-teal-100 lg:text-xs"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
