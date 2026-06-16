import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ga4Event } from '@/utils/ga4'
import {
  filterArrivalsByQuery,
  getArrivalsForCountry,
  sanitizeCountryInput,
  sanitizeArrivalInput,
} from '@/mocks/tripNewDestinationData'
import {
  STEP5_ICON_PATHS,
  STEP5_ICON_COMPOSITE,
} from '@/mocks/tripNewStep5Data'
import DestinationMobileRangeCalendar from '@/components/trip/DestinationMobileRangeCalendar'
import { useDesktopSearchSubmit } from '@/hooks/useDesktopSearchSubmit'
import { useSearchBarMasterData } from '@/hooks/useSearchBarMasterData'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLocalDateYYYYMMDD() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function countryRowWithoutArrivals(row) {
  if (!row) return row
  const { arrivals: _a, ...rest } = row
  return rest
}

function formatDateRangeKo(start, end) {
  if (!start && !end) return null
  const fmt = (ymd) => {
    const [, m, d] = ymd.split('-').map(Number)
    return `${m}월 ${d}일`
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `${fmt(start)} –`
  return null
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function CompanionSvgIcon({ name, className = 'w-5 h-5' }) {
  const composite = STEP5_ICON_COMPOSITE[name]
  if (composite) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        {composite.circles.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />)}
        <path d={composite.path} />
      </svg>
    )
  }
  const d = STEP5_ICON_PATHS[name]
  if (!d) return null
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d={d} />
    </svg>
  )
}

const STYLE_FILTER_IDLE = 'brightness(0) saturate(100%) invert(44%) sepia(82%) saturate(520%) hue-rotate(139deg) brightness(0.93) contrast(0.95)'
const STYLE_FILTER_SELECTED = 'brightness(0) saturate(100%) invert(22%) sepia(28%) saturate(1300%) hue-rotate(5deg) brightness(0.91) contrast(1.05)'

// ─── Divider ─────────────────────────────────────────────────────────────────

function PillDivider() {
  return <div className="w-px bg-gray-200 my-3 shrink-0 self-stretch" aria-hidden />
}

// ─── Field button ─────────────────────────────────────────────────────────────

function FieldButton({ label, value, placeholder, active, onClick, className = '', optional = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group flex flex-col justify-center rounded-full px-5 py-3.5 text-left transition-colors duration-150 outline-none',
        active ? 'bg-gray-100' : 'hover:bg-gray-50',
        className,
      ].join(' ')}
    >
      <span className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        {optional && (
          <span className="rounded-full bg-gray-100 px-1.5 py-px text-[9px] font-bold leading-tight text-gray-400">
            선택
          </span>
        )}
      </span>
      <span className={`block text-sm font-semibold leading-tight truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
        {value || placeholder}
      </span>
    </button>
  )
}

// ─── Dropdown container ──────────────────────────────────────────────────────

function DropdownPanel({ open, children, className = '', align = 'left' }) {
  return (
    <div
      className={[
        'absolute top-[calc(100%+12px)] z-[300] rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-gray-300/25',
        align === 'right' ? 'right-0' : 'left-0',
        className,
      ].join(' ')}
      style={{
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.96)',
        transformOrigin: align === 'right' ? 'top right' : 'top left',
        pointerEvents: open ? 'auto' : 'none',
        transition: open
          ? 'opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1)'
          : 'opacity 180ms cubic-bezier(0.4,0,1,1), transform 180ms cubic-bezier(0.4,0,1,1)',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

// ─── Country dropdown ────────────────────────────────────────────────────────

function CountryDropdown({
  open,
  countryQuery, onCountryQueryChange,
  pickerPhase, suggestions, arrivalSuggestions,
  draftCountry,
  onPickCountry, onPickArrival, onBackToCountry,
  onConfirm,
  popularCityDests, onPickPopularCity,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open, pickerPhase])

  return (
    <DropdownPanel open={open} className="w-80 p-4">
      {pickerPhase === 'country' ? (
        <>
          <p className="mb-2 text-xs font-bold text-gray-500 px-1">여행 국가를 검색하세요</p>
          <input
            ref={inputRef}
            type="text"
            value={countryQuery}
            onChange={(e) => onCountryQueryChange(sanitizeCountryInput(e.target.value))}
            placeholder="예: 일본, 태국, 미국…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
          />
          {!countryQuery.trim() && popularCityDests?.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">인기 여행지</p>
              <div className="flex flex-wrap gap-1.5">
                {popularCityDests.map((dest) => (
                  <button
                    key={dest.label}
                    type="button"
                    onClick={() => onPickPopularCity(dest)}
                    className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 transition hover:bg-teal-100 hover:border-teal-300"
                  >
                    {dest.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {suggestions.length > 0 && (
            <ul className="mt-2 max-h-44 overflow-y-auto space-y-0.5">
              {suggestions.map((c) => (
                <li key={c.countryCode}>
                  <button
                    type="button"
                    onClick={() => onPickCountry(c)}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {countryQuery.trim() && suggestions.length === 0 && (
            <p className="mt-3 text-center text-xs text-gray-400 py-2">검색 결과가 없어요</p>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <button type="button" onClick={onBackToCountry} className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
              국가 다시 선택
            </button>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-bold text-gray-700">{draftCountry?.name}</span>
          </div>
          <p className="mb-2 text-xs font-bold text-gray-500 px-1">공항(도시) 선택</p>
          <input
            ref={inputRef}
            type="text"
            onChange={() => {}}
            placeholder="도시 또는 공항명"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition"
          />
          <ul className="mt-2 max-h-44 overflow-y-auto space-y-0.5">
            {arrivalSuggestions.map((a) => (
              <li key={a.iata || a.city}>
                <button
                  type="button"
                  onClick={() => onPickArrival(a)}
                  className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-teal-50"
                >
                  <span className="text-sm font-semibold text-gray-800">{a.city}</span>
                  {a.iata && <span className="ml-2 text-xs text-gray-400">{a.iata}</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <button
        type="button"
        onClick={onConfirm}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"
      >
        확인
      </button>
    </DropdownPanel>
  )
}

// ─── Dates dropdown ──────────────────────────────────────────────────────────

function DatesDropdown({ open, startDate, endDate, today, onRangeChange, onConfirm }) {
  return (
    <DropdownPanel open={open} className="w-[620px] p-5">
      <p className="mb-3 text-xs font-bold text-gray-500">여행 날짜를 선택해 주세요</p>
      <DestinationMobileRangeCalendar
        startDate={startDate}
        endDate={endDate}
        todayYmd={today}
        minDateYmd={today}
        disabled={false}
        onChangeRange={onRangeChange}
      />
      <button
        type="button"
        onClick={onConfirm}
        className="mt-4 w-full rounded-xl bg-teal-600 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"
      >
        확인
      </button>
    </DropdownPanel>
  )
}

// ─── Extra destinations dropdown ─────────────────────────────────────────────

function ExtraDropdown({ open, suggestions, selectedCities, onToggle, onConfirm, additionalInput, onAdditionalInputChange }) {
  return (
    <DropdownPanel open={open} className="w-72 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-800">추가 여행지</p>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">
              선택사항
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-400">건너뛰어도 괜찮아요</p>
        </div>
      </div>
      <input
        type="text"
        value={additionalInput}
        onChange={(e) => onAdditionalInputChange(sanitizeArrivalInput(e.target.value))}
        placeholder="도시명으로 검색"
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition mb-2"
      />
      {suggestions.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-3">선택 가능한 추가 여행지가 없어요</p>
      )}
      <ul className="max-h-48 overflow-y-auto space-y-0.5">
        {suggestions.map((a) => {
          const checked = selectedCities.includes(a.city)
          return (
            <li key={a.iata || a.city}>
              <button
                type="button"
                onClick={() => onToggle(a.city)}
                className={[
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                  checked ? 'bg-teal-50 text-teal-800' : 'hover:bg-gray-50 text-gray-800',
                ].join(' ')}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${checked ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-sm font-semibold">{a.city}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"
      >
        확인
      </button>
    </DropdownPanel>
  )
}

// ─── Companion dropdown ──────────────────────────────────────────────────────

function CompanionDropdown({ open, companions, companionIds, onToggle, onConfirm }) {
  const aloneSelected = companionIds.includes('alone')
  return (
    <DropdownPanel open={open} align="right" className="w-80 p-4">
      <p className="mb-1 text-xs font-bold text-gray-500">누구와 함께하나요? (최대 2개)</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {companions.map((c) => {
          const on = companionIds.includes(c.id)
          const disabled = aloneSelected && c.id !== 'alone'
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.id)}
              disabled={disabled}
              className={[
                'flex flex-col items-start gap-1.5 rounded-2xl border-2 p-3 text-left transition-all',
                on
                  ? 'border-amber-400 bg-amber-100/90 text-gray-900'
                  : disabled
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-40'
                  : 'border-gray-100 bg-gray-50 text-gray-800 hover:bg-teal-50/50',
              ].join(' ')}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${on ? 'bg-white/70 text-teal-800' : 'bg-white text-teal-700'}`}>
                <CompanionSvgIcon name={c.icon} className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">{c.label}</span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"
      >
        확인
      </button>
    </DropdownPanel>
  )
}

// ─── Style dropdown ──────────────────────────────────────────────────────────

function StyleDropdown({ open, travelStyles, styleIds, onToggle, onConfirm }) {
  return (
    <DropdownPanel open={open} align="right" className="w-80 p-4">
      <p className="mb-1 text-xs font-bold text-gray-500">어떤 여행을 원하나요? (복수 선택)</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {travelStyles.map((s) => {
          const on = styleIds.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggle(s.id)}
              className={[
                'flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-2.5 transition-all',
                on
                  ? 'border-amber-400 bg-amber-100/90 text-gray-900'
                  : 'border-gray-100 bg-gray-50 text-gray-800 hover:bg-teal-50/50',
              ].join(' ')}
            >
              <img
                src={s.iconSrc}
                alt=""
                aria-hidden
                className="h-7 w-7 shrink-0 object-contain transition-[filter] duration-200"
                style={{ filter: on ? STYLE_FILTER_SELECTED : STYLE_FILTER_IDLE }}
              />
              <span className="text-[10px] font-bold leading-tight text-center">{s.label}</span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700"
      >
        확인
      </button>
    </DropdownPanel>
  )
}

const POPULAR_CITY_DESTINATIONS = [
  { label: '도쿄', countryCode: 'JP', iata: 'NRT' },
  { label: '오사카', countryCode: 'JP', iata: 'KIX' },
  { label: '방콕', countryCode: 'TH', iata: 'BKK' },
  { label: '다낭', countryCode: 'VN', iata: 'DAD' },
  { label: '호치민', countryCode: 'VN', iata: 'SGN' },
  { label: '마닐라', countryCode: 'PH', iata: 'MNL' },
  { label: '싱가포르', countryCode: 'SG', iata: 'SIN' },
  { label: '홍콩', countryCode: 'HK', iata: 'HKG' },
  { label: '타이베이', countryCode: 'TW', iata: 'TPE' },
  { label: '발리', countryCode: 'ID', iata: 'DPS' },
]

// ─── Main component ──────────────────────────────────────────────────────────

export default function DesktopHomeSearchBar() {
  const containerRef = useRef(null)
  const location = useLocation()
  const [activeSection, setActiveSection] = useState(null)

  // Country
  const [countryQuery, setCountryQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [pickerPhase, setPickerPhase] = useState('country')
  const [draftCountry, setDraftCountry] = useState(null)

  // Dates
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const today = getLocalDateYYYYMMDD()

  // Extra destinations
  const [additionalDests, setAdditionalDests] = useState([])
  const [additionalInput, setAdditionalInput] = useState('')

  // Companion / style selection
  const [companionIds, setCompanionIds] = useState([])
  const [styleIds, setStyleIds] = useState([])

  // Master data (countries, companions, travel styles) from API
  const { countryOptions, companions, travelStyles } = useSearchBarMasterData()

  // Submit logic
  const { handleSearch: _handleSearch, submitting, submitError, canSubmit } = useDesktopSearchSubmit({
    selectedCountry, startDate, endDate, additionalDests,
    companionIds, companions, styleIds, travelStyles,
  })
  const handleSearch = () => { setActiveSection(null); ga4Event('search_button_click', { source: 'desktop' }); return _handleSearch() }

  useEffect(() => {
    function handlePointerDown(e) {
      if (!containerRef.current?.contains(e.target)) setActiveSection(null)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  // CurationArticlePage에서 preselectedCountry로 진입 시 국가 자동 선택
  useEffect(() => {
    const country = location.state?.preselectedCountry
    if (!country || !countryOptions.length) return

    const nameMap = {
      vietnam: '베트남', japan: '일본',
      thailand: '태국', usa: '미국',
      indonesia: '인도네시아',
    }
    const name = nameMap[country]
    if (!name) return

    const found = countryOptions.find((c) =>
      c.name?.includes(name) || c.label?.includes(name) || c.nameKo?.includes(name)
    )
    if (found) {
      confirmCountry(found)
    } else {
      setCountryQuery(name)
      setActiveSection('country')
    }
  }, [countryOptions, location.state]) // eslint-disable-line react-hooks/exhaustive-deps

  // 여행 스타일 테스트 결과에서 추천 여행지로 진입 시 국가 자동 선택 + 날짜 드롭다운 오픈
  useEffect(() => {
    const dest = location.state?.prefilledDestination
    if (!dest || !countryOptions.length) return

    const found = countryOptions.find((c) => c.countryCode === dest.countryCode)
    if (!found) return

    const arrivals = getArrivalsForCountry(found)
    const arrival = arrivals.find((a) => a.iata === dest.iata) ?? arrivals[0]

    confirmCountry({
      ...countryRowWithoutArrivals(found),
      city: arrival?.city ?? found.city,
      iata: arrival?.iata ?? found.iata,
    })
  }, [countryOptions, location.state?.prefilledDestination]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset downstream fields when country is cleared
  useEffect(() => {
    if (!selectedCountry) {
      setStartDate('')
      setEndDate('')
      setAdditionalDests([])
      setAdditionalInput('')
      setCompanionIds([])
      setStyleIds([])
    }
  }, [selectedCountry])

  const popularCityDests = useMemo(
    () => POPULAR_CITY_DESTINATIONS.filter(({ countryCode }) => countryOptions.some((c) => c.countryCode === countryCode)),
    [countryOptions],
  )

  const handlePickPopularCity = ({ label, countryCode, iata }) => {
    const country = countryOptions.find((c) => c.countryCode === countryCode)
    if (!country) return
    const merged = { ...countryRowWithoutArrivals(country), city: label, iata }
    confirmCountry(merged)
  }

  const suggestions = useMemo(() => {
    const q = countryQuery.trim()
    if (!q) return []
    return countryOptions.filter((c) => {
      if (c.name.includes(q)) return true
      if (c.aliases?.some((a) => a.includes(q))) return true
      return false
    }).slice(0, 14)
  }, [countryQuery, countryOptions])

  const arrivalSuggestions = useMemo(() => {
    if (pickerPhase !== 'arrival' || !draftCountry) return []
    return getArrivalsForCountry(draftCountry)
  }, [pickerPhase, draftCountry])

  const additionalArrivalSuggestions = useMemo(() => {
    if (!selectedCountry) return []
    const fullEntry = countryOptions.find((c) => c.countryCode === selectedCountry.countryCode) ?? selectedCountry
    const all = getArrivalsForCountry(fullEntry)
    const query = sanitizeArrivalInput(additionalInput)
    const filtered = query ? filterArrivalsByQuery(all, query) : all
    return filtered.filter((a) => a.city !== selectedCountry.city)
  }, [selectedCountry, additionalInput, countryOptions])

  const confirmCountry = (c) => {
    setSelectedCountry(c)
    setCountryQuery('')
    setPickerPhase('country')
    setDraftCountry(null)
    // 국가가 바뀌면 이후 섹션 데이터 초기화
    setStartDate('')
    setEndDate('')
    setAdditionalDests([])
    setAdditionalInput('')
    setCompanionIds([])
    setStyleIds([])
    setActiveSection('dates')
  }

  const handlePickCountry = (c) => {
    const arrivals = getArrivalsForCountry(c)
    if (arrivals.length <= 1) {
      const merged = arrivals.length === 1
        ? { ...countryRowWithoutArrivals(c), city: arrivals[0].city, iata: arrivals[0].iata }
        : c
      confirmCountry(merged)
      return
    }
    setDraftCountry(c)
    setPickerPhase('arrival')
    setCountryQuery(c.name)
  }

  const handlePickArrival = (a) => {
    if (!draftCountry) return
    const merged = { ...countryRowWithoutArrivals(draftCountry), city: a.city, iata: a.iata }
    confirmCountry(merged)
  }

  const handleBackToCountry = () => {
    setPickerPhase('country')
    setDraftCountry(null)
    setCountryQuery('')
  }

  const toggleSection = (name) => {
    setActiveSection((prev) => {
      if (prev !== name) ga4Event('search_section_click', { section: name })
      return prev === name ? null : name
    })
  }

  const toggleCompanion = (id) => {
    setCompanionIds((prev) => {
      if (prev.includes('alone') && id !== 'alone') return prev
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (id === 'alone') return ['alone']
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const toggleStyle = (id) => {
    setStyleIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const toggleExtraDest = (city) => {
    setAdditionalDests((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }

  const confirmExtraDests = () => {
    setAdditionalInput('')
    setActiveSection(null)
  }

  // Display values
  const countryValue = selectedCountry
    ? `${selectedCountry.country}${selectedCountry.city ? ` · ${selectedCountry.city}` : ''}`
    : null
  const dateValue = formatDateRangeKo(startDate, endDate)
  const extraValue = additionalDests.length > 0 ? additionalDests.join(', ') : null
  const companionValue = companionIds.length > 0
    ? companions.filter((c) => companionIds.includes(c.id)).map((c) => c.label).join(', ')
    : null
  const styleValue = styleIds.length > 0
    ? travelStyles.filter((s) => styleIds.includes(s.id)).map((s) => s.label).join(', ')
    : null

  return (
    <div className="w-full" ref={containerRef}>
      {/* Pill bar */}
      <div className="relative flex items-stretch rounded-full border border-gray-200 bg-white shadow-xl shadow-gray-200/50">

        {/* 1. 여행 국가 */}
        <div className="relative shrink min-w-[140px]">
          <FieldButton
            label="여행 국가"
            value={countryValue}
            placeholder="국가 선택"
            active={activeSection === 'country'}
            onClick={() => toggleSection('country')}
            className="w-full pl-6 pr-4"
          />
          <CountryDropdown
            open={activeSection === 'country'}
            countryQuery={countryQuery}
            onCountryQueryChange={setCountryQuery}
            pickerPhase={pickerPhase}
            suggestions={suggestions}
            arrivalSuggestions={arrivalSuggestions}
            draftCountry={draftCountry}
            onPickCountry={handlePickCountry}
            onPickArrival={handlePickArrival}
            onBackToCountry={handleBackToCountry}
            onConfirm={() => setActiveSection(null)}
            popularCityDests={popularCityDests}
            onPickPopularCity={handlePickPopularCity}
          />
        </div>

        <PillDivider />

        {/* 2. 날짜 */}
        <div className="relative shrink min-w-[160px]">
          <FieldButton
            label="날짜"
            value={dateValue}
            placeholder="날짜 선택"
            active={activeSection === 'dates'}
            onClick={() => toggleSection('dates')}
            className="w-full px-5"
          />
          <DatesDropdown
            open={activeSection === 'dates'}
            startDate={startDate}
            endDate={endDate}
            today={today}
            onRangeChange={({ start, end }) => { setStartDate(start); setEndDate(end) }}
            onConfirm={() => setActiveSection('extra')}
          />
        </div>

        <PillDivider />

        {/* 3. 추가 여행지 */}
        <div className="relative flex-1 min-w-[120px]">
          <FieldButton
            label="추가 여행지"
            value={extraValue}
            placeholder="선택 안함"
            active={activeSection === 'extra'}
            onClick={() => selectedCountry ? toggleSection('extra') : undefined}
            className={`w-full px-5 ${!selectedCountry ? 'opacity-50 cursor-default' : ''}`}
          />
          <ExtraDropdown
            open={activeSection === 'extra'}
            suggestions={additionalArrivalSuggestions}
            selectedCities={additionalDests}
            onToggle={toggleExtraDest}
            onConfirm={() => { setAdditionalInput(''); setActiveSection('companion') }}
            additionalInput={additionalInput}
            onAdditionalInputChange={setAdditionalInput}
          />
        </div>

        <PillDivider />

        {/* 4. 동행인 선택 */}
        <div className="relative shrink min-w-[150px] w-[190px]">
          <FieldButton
            label="동행인 선택"
            value={companionValue}
            placeholder="동행인 선택"
            active={activeSection === 'companion'}
            onClick={() => toggleSection('companion')}
            className="w-full px-5"
          />
          <CompanionDropdown
            open={activeSection === 'companion'}
            companions={companions}
            companionIds={companionIds}
            onToggle={toggleCompanion}
            onConfirm={() => setActiveSection('style')}
          />
        </div>

        <PillDivider />

        {/* 5. 여행 스타일 */}
        <div className="relative shrink min-w-[150px] w-[190px]">
          <FieldButton
            label="여행 스타일"
            value={styleValue}
            placeholder="스타일 선택"
            active={activeSection === 'style'}
            onClick={() => toggleSection('style')}
            className="w-full pl-5 pr-4"
          />
          <StyleDropdown
            open={activeSection === 'style'}
            travelStyles={travelStyles}
            styleIds={styleIds}
            onToggle={toggleStyle}
            onConfirm={() => setActiveSection(null)}
          />
        </div>

        {/* Search button */}
        <div className="shrink-0 flex items-center p-1.5 pl-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSubmit}
            className={[
              'flex items-center gap-2.5 rounded-full px-6 py-3.5 font-bold text-sm text-white transition-all duration-200',
              canSubmit
                ? 'bg-gradient-to-r from-teal-500 to-[#3db4dd] shadow-md shadow-teal-400/30 hover:shadow-lg hover:shadow-teal-400/40 hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {submitting ? '준비 중…' : '검색'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {submitError && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          {submitError}
        </p>
      )}

    </div>
  )
}
