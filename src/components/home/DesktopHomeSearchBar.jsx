import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  COUNTRY_ARRIVAL_OPTIONS,
  filterArrivalsByQuery,
  getArrivalsForCountry,
  sanitizeCountryInput,
  sanitizeArrivalInput,
} from '@/mocks/tripNewDestinationData'
import {
  COMPANIONS,
  TRAVEL_STYLES,
  STEP5_ICON_PATHS,
  STEP5_ICON_COMPOSITE,
} from '@/mocks/tripNewStep5Data'
import { listCountries, listCities, listCompanionTypes, listTravelStyles } from '@/api/master'
import DestinationMobileRangeCalendar from '@/components/trip/DestinationMobileRangeCalendar'
import { saveActiveTripPlan, loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { saveActiveTripId, clearActiveTripId } from '@/utils/activeTripIdStorage'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { createTrip } from '@/api/trips'
import { resolveAccessToken } from '@/api/client'
import { trackEvent } from '@/utils/analyticsTracker'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLocalDateYYYYMMDD() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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

function DropdownPanel({ open, children, className = '' }) {
  return (
    <div
      className={[
        'absolute top-[calc(100%+12px)] left-0 z-[300] rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-gray-300/25',
        className,
      ].join(' ')}
      style={{
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.96)',
        transformOrigin: 'top left',
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
  return (
    <DropdownPanel open={open} className="w-80 p-4">
      <p className="mb-1 text-xs font-bold text-gray-500">누구와 함께하나요? (최대 2개)</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {companions.map((c) => {
          const on = companionIds.includes(c.id)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggle(c.id)}
              className={[
                'flex flex-col items-start gap-1.5 rounded-2xl border-2 p-3 text-left transition-all',
                on
                  ? 'border-amber-400 bg-amber-100/90 text-gray-900'
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
    <DropdownPanel open={open} className="w-80 p-4">
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

// ─── Main component ──────────────────────────────────────────────────────────

export default function DesktopHomeSearchBar() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [activeSection, setActiveSection] = useState(null)

  // Country
  const [countryQuery, setCountryQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [pickerPhase, setPickerPhase] = useState('country')
  const [draftCountry, setDraftCountry] = useState(null)
  const [countryOptions, setCountryOptions] = useState(COUNTRY_ARRIVAL_OPTIONS)

  // Dates
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const today = getLocalDateYYYYMMDD()

  // Extra destinations
  const [additionalDests, setAdditionalDests] = useState([])
  const [additionalInput, setAdditionalInput] = useState('')

  // Companion
  const [companionIds, setCompanionIds] = useState([])
  const [companions, setCompanions] = useState(COMPANIONS)

  // Travel style
  const [styleIds, setStyleIds] = useState([])
  const [travelStyles, setTravelStyles] = useState(TRAVEL_STYLES)

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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

  useEffect(() => {
    function handlePointerDown(e) {
      if (!containerRef.current?.contains(e.target)) setActiveSection(null)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

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
    setActiveSection((prev) => (prev === name ? null : name))
  }

  const toggleCompanion = (id) => {
    setCompanionIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
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

  const canSubmit = Boolean(selectedCountry) && startDate && endDate && companionIds.length >= 1 && styleIds.length >= 1 && !submitting

  const handleSearch = async () => {
    if (!canSubmit || !selectedCountry) return
    setSubmitError('')
    setActiveSection(null)
    setSubmitting(true)

    try {
      trackEvent('cta_click', { button: 'desktop_home_search', destination: selectedCountry.city })

      const hasPet = companionIds.some((id) => id === 'pets' || id === 'withPet')
      const companionLabel = companions.filter((c) => companionIds.includes(c.id)).map((c) => c.label).join(', ') || null
      const travelStyleLabels = travelStyles.filter((s) => styleIds.includes(s.id)).map((s) => s.label)

      saveActiveTripPlan({
        destination: {
          iata: selectedCountry.iata,
          city: selectedCountry.city,
          country: selectedCountry.country,
          countryCode: selectedCountry.countryCode,
        },
        tripStartDate: startDate,
        tripEndDate: endDate,
        additionalDestinations: additionalDests,
        companion: companionLabel,
        hasPet,
        travelStyles: travelStyleLabels,
        companionIds,
        travelStyleIds: styleIds,
      })

      const step5State = { companionIds, travelStyleIds: styleIds }
      const baseState = {
        destination: {
          iata: selectedCountry.iata,
          city: selectedCountry.city,
          country: selectedCountry.country,
          countryCode: selectedCountry.countryCode,
        },
        fromDestinationPage: true,
        tripStartDate: startDate,
        tripEndDate: endDate,
        additionalDestinations: additionalDests,
        step5: step5State,
      }

      const token = await resolveAccessToken()
      if (!token) {
        navigate('/trips/guest/loading', { state: baseState })
        return
      }

      const plan = loadActiveTripPlan()
      const payload = buildCreateTripPayload(plan, { companionIds, hasPet, travelStyleIds: styleIds })

      if (!payload) {
        setSubmitError('여행 정보를 모두 입력한 뒤 다시 시도해 주세요.')
        return
      }

      const created = await createTrip(payload)
      const rawId = created?.id ?? created?.tripId
      const createdTripId = rawId != null ? String(rawId) : null

      if (createdTripId) {
        saveActiveTripId(createdTripId)
        trackEvent('trip_creation_completed', { trip_id: createdTripId })
        navigate(`/trips/${createdTripId}/loading`, { state: { ...baseState, createdTripId } })
      } else {
        navigate('/guide-archives', { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '여행 계획을 저장하지 못했어요.'
      console.warn('[DesktopHomeSearchBar] createTrip 실패:', msg)
      setSubmitError('여행 계획 저장 중 문제가 발생했습니다.')
      clearActiveTripId()
    } finally {
      setSubmitting(false)
    }
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
        <div className="relative flex-none min-w-[170px]">
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
          />
        </div>

        <PillDivider />

        {/* 2. 날짜 */}
        <div className="relative flex-none min-w-[190px]">
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
            onConfirm={() => setActiveSection(null)}
          />
        </div>

        <PillDivider />

        {/* 3. 추가 여행지 */}
        <div className="relative flex-1 min-w-[160px]">
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
            onConfirm={confirmExtraDests}
            additionalInput={additionalInput}
            onAdditionalInputChange={setAdditionalInput}
          />
        </div>

        <PillDivider />

        {/* 4. 동행인 선택 */}
        <div className="relative flex-none min-w-[160px] max-w-[190px]">
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
            onConfirm={() => setActiveSection(null)}
          />
        </div>

        <PillDivider />

        {/* 5. 여행 스타일 */}
        <div className="relative flex-none min-w-[160px] max-w-[190px]">
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
