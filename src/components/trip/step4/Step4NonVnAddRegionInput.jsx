import { useEffect, useMemo, useRef, useState } from 'react'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'

/** 비베트남: 도시·지역 입력 + DB 자동완성 드롭다운 + 확인(엔터와 동일) */
export default function Step4NonVnAddRegionInput({
  value,
  onChange,
  onConfirm,
  cities = [],
  countryCode = '',
}) {
  const inputRef = useRef(null)
  const comboRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const submit = () => {
    const t = value.trim()
    if (t.length < 1) return
    onConfirm(t)
    setDropdownOpen(false)
    inputRef.current?.blur()
  }

  /** 같은 국가 최상단 + 이름/IATA 필터 + 최대 10개 */
  const suggestions = useMemo(() => {
    const q = value.trim()
    if (!q) return []
    const matched = cities.filter(
      (c) =>
        c.nameKo.includes(q) ||
        c.iataCode?.toUpperCase().includes(q.toUpperCase()),
    )
    const same = matched.filter((c) => c.country?.code === countryCode)
    const others = matched.filter((c) => c.country?.code !== countryCode)
    return [...same, ...others].slice(0, 10)
  }, [value, cities, countryCode])

  const sameCount = suggestions.filter((c) => c.country?.code === countryCode).length
  const isOpen = dropdownOpen && suggestions.length > 0

  useEffect(() => {
    function handlePointerDown(e) {
      if (!comboRef.current?.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={comboRef} className="relative flex w-full items-center gap-2 sm:gap-3">
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition-colors duration-200 focus-within:border-white/50 focus-within:bg-[#D9F2FF] sm:gap-3 sm:px-5 sm:py-4 ${
          isOpen ? 'rounded-t-2xl' : 'rounded-2xl'
        }`}
      >
        <Step4SvgIcon name="search" className="h-5 w-5 flex-shrink-0 text-[#5DA7C1]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setDropdownOpen(true)
          }}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            if (e.nativeEvent.isComposing) return
            e.preventDefault()
            submit()
          }}
          placeholder="방문할 도시를 입력해주세요"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-[#5DA7C1]"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        className="flex-shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
      >
        확인
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="도시 자동완성"
          className="absolute left-0 top-full z-30 max-h-64 w-[calc(100%-3.5rem)] overflow-y-auto rounded-b-2xl border border-t-0 border-sky-200 bg-white shadow-lg ring-2 ring-sky-200"
        >
          {sameCount > 0 && (
            <li className="sticky top-0 bg-sky-50/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700/80">
              여행 국가의 도시
            </li>
          )}
          {suggestions.slice(0, sameCount).map((city) => (
            <li key={`same-${city.nameKo}`} role="none">
              <button
                type="button"
                role="option"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onConfirm(city.nameKo)
                  setDropdownOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 transition hover:bg-sky-50"
              >
                <span className="font-semibold">{city.nameKo}</span>
                <span className="text-xs text-gray-400">{city.country?.nameKo}</span>
                {city.iataCode && (
                  <span className="ml-auto text-xs text-gray-400">{city.iataCode}</span>
                )}
              </button>
            </li>
          ))}

          {sameCount < suggestions.length && (
            <li className="bg-gray-50/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              다른 국가 도시
            </li>
          )}
          {suggestions.slice(sameCount).map((city) => (
            <li key={`other-${city.nameKo}`} role="none">
              <button
                type="button"
                role="option"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onConfirm(city.nameKo)
                  setDropdownOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 transition hover:bg-sky-50"
              >
                <span className="font-semibold">{city.nameKo}</span>
                <span className="text-xs text-gray-400">{city.country?.nameKo}</span>
                {city.iataCode && (
                  <span className="ml-auto text-xs text-gray-400">{city.iataCode}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
