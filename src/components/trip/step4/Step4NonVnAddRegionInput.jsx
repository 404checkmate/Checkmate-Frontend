import { useEffect, useMemo, useRef, useState } from 'react'
import Step4SvgIcon from '@/components/trip/step4/Step4SvgIcon'

/** 비베트남: 도시·지역 입력 + 하위취항지 드롭다운 + 확인(엔터와 동일) */
export default function Step4NonVnAddRegionInput({
  value,
  onChange,
  onConfirm,
  arrivals = [],
}) {
  const inputRef = useRef(null)
  const comboRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  const submit = () => {
    const t = value.trim()
    if (t.length < 1) return
    onConfirm(t)
    setIsFocused(false)
    inputRef.current?.blur()
  }

  const suggestions = useMemo(() => {
    const q = value.trim()
    if (!q) return arrivals.slice(0, 10)
    return arrivals
      .filter(
        (a) =>
          a.city.includes(q) ||
          a.iata?.toUpperCase().includes(q.toUpperCase()) ||
          a.aliases?.some((alias) => alias.includes(q)),
      )
      .slice(0, 10)
  }, [value, arrivals])

  const isOpen = isFocused && suggestions.length > 0

  useEffect(() => {
    function handlePointerDown(e) {
      if (!comboRef.current?.contains(e.target)) setIsFocused(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div className="flex w-full items-center gap-2 sm:gap-3">
      <div ref={comboRef} className="relative min-w-0 flex-1">
        <div
          className={`flex items-center gap-2 border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition-colors duration-200 focus-within:border-white/50 focus-within:bg-[#D9F2FF] sm:gap-3 sm:px-5 sm:py-4 ${
            isOpen ? 'rounded-t-2xl' : 'rounded-2xl'
          }`}
        >
          <Step4SvgIcon name="search" className="h-5 w-5 flex-shrink-0 text-[#5DA7C1]" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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

        {isOpen && (
          <ul
            role="listbox"
            aria-label="하위취항지 목록"
            className="absolute left-0 top-full z-30 w-full max-h-64 overflow-y-auto rounded-b-2xl border border-t-0 border-sky-200 bg-white shadow-lg ring-2 ring-sky-200"
          >
            {suggestions.map((a) => (
              <li key={`${a.iata}-${a.city}`} role="none">
                <button
                  type="button"
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onConfirm(a.city)
                    setIsFocused(false)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 transition hover:bg-sky-50"
                >
                  <span className="font-semibold">{a.city}</span>
                  {a.iata && (
                    <span className="ml-auto text-xs text-gray-400">{a.iata}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        className="flex-shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
      >
        확인
      </button>
    </div>
  )
}
