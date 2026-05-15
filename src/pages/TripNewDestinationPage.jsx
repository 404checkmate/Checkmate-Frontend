import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  STEP_DESTINATION_CONFIG,
  COUNTRY_ARRIVAL_OPTIONS,
  MOBILE_QUICK_DESTINATION_CHIPS,
  filterArrivalsByQuery,
  getArrivalsForCountry,
  sanitizeCountryInput,
  sanitizeArrivalInput,
} from '@/mocks/tripNewDestinationData'
import { listCountries, listCities } from '@/api/master'
import StepHeader from '@/components/common/StepHeader'
import { TripFlowNextStepButton } from '@/components/trip/TripFlowNextStepButton'
import {
  TripNewFlowDesktopPrevBar,
} from '@/components/trip/TripNewFlowPrevControls'
import DestinationMobileRangeCalendar from '@/components/trip/DestinationMobileRangeCalendar'
import DestinationCountryAutocomplete from '@/components/trip/DestinationCountryAutocomplete'
import SelectedCountryChip from '@/components/trip/SelectedCountryChip'
import { TripDestinationSvgIcon } from '@/components/trip/TripDestinationIcons'
import { saveStep4NavigationState } from '@/utils/tripFlowDraftStorage'
import { saveActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { clearActiveTripId } from '@/utils/activeTripIdStorage'
import { trackEvent } from '@/utils/analyticsTracker'

/** `<input type="date" min>` 용 — 브라우저 로컬 달력과 맞추기 위해 UTC가 아닌 로컬 날짜 사용 */
function getLocalDateYYYYMMDD() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** API 응답(countries + cities)을 COUNTRY_ARRIVAL_OPTIONS 형태로 변환 */
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

/** 엔터·정확 일치용: 목록에서 국가명 또는 별칭과 일치하는 항목 */
function findExactCountryMatch(trimmedQuery, list) {
  const q = trimmedQuery
  if (!q) return null
  const lower = q.toLowerCase()
  return (
    list.find((c) => c.name === q) ||
    list.find((c) => c.aliases?.some((a) => a.toLowerCase() === lower)) ||
    null
  )
}

function countryRowWithoutArrivals(row) {
  if (!row) return row
  const { arrivals: _a, ...rest } = row
  return rest
}

function formatDateKo(ymd) {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-').map(Number)
  return `${y}년 ${m}월 ${d}일`
}

const SUBTITLE_DESKTOP = (
  <p className="text-gray-600">
    어디로, 언제 떠날지 알려주시면 저희가 당신만을 위한 체크리스트를 만들어드릴게요!
  </p>
)

/** 이미지 히어로 없이 — CHECKMATE 플로우 틸·민트·시안 톤 (step2·step4와 계열 통일) */
const TRIP_FLOW_PAGE_BG_STYLE = {
  background: `
    radial-gradient(ellipse 120% 80% at 50% -15%, rgba(45, 212, 191, 0.18), transparent 55%),
    radial-gradient(ellipse 90% 70% at 0% 30%, rgba(204, 251, 241, 0.55), transparent 50%),
    radial-gradient(ellipse 85% 60% at 100% 70%, rgba(167, 243, 208, 0.28), transparent 52%),
    linear-gradient(165deg, #ecfdf5 0%, #f0fdfa 22%, #ecfeff 48%, #f8fafc 100%)
  `,
}

function DestinationDateForm({
  comboRef,
  countryQuery,
  onCountryInputChange,
  onCountryKeyDown,
  onCountryFocus,
  countryInputReadOnly,
  onChangeCountryRequest,
  suggestions,
  showDropdown,
  onPickCountry,
  pickerPhase,
  arrivalQuery,
  onArrivalQueryChange,
  onArrivalKeyDown,
  arrivalSuggestions,
  onPickArrival,
  selectedCountry,
  onRemoveCountryTag,
  startDate,
  endDate,
  today,
  onRangeChange,
  allCountries,
}) {
  const hasQuery = countryQuery.trim().length > 0
  const panelOpen = showDropdown && (pickerPhase === 'arrival' || hasQuery)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-100/90 bg-sky-50/90 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-sky-600 shadow-sm">
            <TripDestinationSvgIcon name="mapPin" className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-gray-900">어디로 떠나시나요?</span>
        </div>

        <DestinationCountryAutocomplete
          comboRef={comboRef}
          countryQuery={countryQuery}
          onCountryInputChange={onCountryInputChange}
          onCountryKeyDown={onCountryKeyDown}
          onCountryFocus={onCountryFocus}
          countryInputReadOnly={countryInputReadOnly}
          onChangeCountryRequest={onChangeCountryRequest}
          suggestions={suggestions}
          isPanelOpen={panelOpen}
          onPickCountry={onPickCountry}
          pickerPhase={pickerPhase}
          arrivalQuery={arrivalQuery}
          onArrivalQueryChange={onArrivalQueryChange}
          onArrivalKeyDown={onArrivalKeyDown}
          arrivalSuggestions={arrivalSuggestions}
          onPickArrival={onPickArrival}
          panelId="country-autocomplete-panel"
          placeholder="국가명 입력 후 엔터 또는 목록에서 선택"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {MOBILE_QUICK_DESTINATION_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                const c = allCountries.find((x) => x.name === chip.countryName)
                if (c) onPickCountry(c)
              }}
              className="rounded-full border border-sky-200/90 bg-white px-3 py-1.5 text-sm font-semibold text-sky-800 shadow-sm transition hover:border-sky-300/90 hover:bg-sky-50/80"
            >
              #{chip.label}
            </button>
          ))}
        </div>

        {selectedCountry && (
          <SelectedCountryChip country={selectedCountry} onRemove={onRemoveCountryTag} variant="desktop" />
        )}
      </div>

      <div
        className={`rounded-2xl border border-teal-100/90 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/40 p-5 shadow-sm transition-opacity ${
          selectedCountry ? '' : 'opacity-60'
        }`}
        aria-disabled={!selectedCountry}
      >
        <div className="mb-4 flex items-center gap-2">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
              selectedCountry ? 'bg-white/90 text-teal-600' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <TripDestinationSvgIcon name="calendar" className="h-5 w-5" />
          </div>
          <span className={`text-base font-bold ${selectedCountry ? 'text-gray-900' : 'text-gray-500'}`}>
            언제 떠나시나요?
          </span>
        </div>
        {!selectedCountry && (
          <p className="mb-3 rounded-xl bg-white/80 px-3 py-2 text-xs text-gray-500 ring-1 ring-teal-100/80">
            위에서 <strong className="text-teal-700">여행 국가</strong>를 먼저 선택하면 일정을 입력할 수 있어요.
          </p>
        )}
        <DestinationMobileRangeCalendar
          startDate={startDate}
          endDate={endDate}
          todayYmd={today}
          minDateYmd={today}
          disabled={!selectedCountry}
          onChangeRange={onRangeChange}
        />
      </div>
    </div>
  )
}

export default function TripNewDestinationPage() {
  const navigate = useNavigate()
  const { state: navState } = useLocation()
  const [today, setToday] = useState(getLocalDateYYYYMMDD)
  const comboRef = useRef(null)

  /** 오늘(로컬) 기준으로 갱신 — 탭 복귀·분 단위 체크로 자정 넘김 반영 */
  useEffect(() => {
    clearActiveTripId()
  }, [])

  useEffect(() => {
    const syncToday = () => setToday(getLocalDateYYYYMMDD())
    syncToday()

    const intervalId = setInterval(syncToday, 30_000)

    let midnightTimerId = null
    const scheduleNextMidnight = () => {
      const now = new Date()
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
      const ms = Math.max(500, next.getTime() - now.getTime())
      midnightTimerId = window.setTimeout(() => {
        syncToday()
        scheduleNextMidnight()
      }, ms)
    }
    scheduleNextMidnight()

    const onFocus = () => syncToday()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncToday()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(intervalId)
      if (midnightTimerId != null) window.clearTimeout(midnightTimerId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const [countryQuery, setCountryQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(navState?.preselectedCountry ?? null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [pickerPhase, setPickerPhase] = useState('country')
  const [draftCountry, setDraftCountry] = useState(null)
  const [arrivalQuery, setArrivalQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [additionalDests, setAdditionalDests] = useState([])
  const [additionalInput, setAdditionalInput] = useState('')
  const [additionalDropOpen, setAdditionalDropOpen] = useState(false)
  const additionalDropRef = useRef(null)
  const [countryOptions, setCountryOptions] = useState(COUNTRY_ARRIVAL_OPTIONS)
  const [calendarOpen, setCalendarOpen] = useState(false)

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

  /** 자정 등으로 today가 바뀌면 과거로 밀린 값은 비움 */
  useEffect(() => {
    setStartDate((prev) => (prev && prev < today ? '' : prev))
    setEndDate((prev) => (prev && prev < today ? '' : prev))
  }, [today])

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
    const all = getArrivalsForCountry(draftCountry)
    return filterArrivalsByQuery(all, sanitizeArrivalInput(arrivalQuery))
  }, [pickerPhase, draftCountry, arrivalQuery])

  const calendarRef = useRef(null)

  useEffect(() => {
    function handlePointerDown(e) {
      if (!comboRef.current?.contains(e.target)) setDropdownOpen(false)
      if (!calendarRef.current?.contains(e.target)) setCalendarOpen(false)
      if (!additionalDropRef.current?.contains(e.target)) setAdditionalDropOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!selectedCountry) {
      setStartDate('')
      setEndDate('')
      setCalendarOpen(false)
    }
  }, [selectedCountry])

  const confirmCountry = (c) => {
    setSelectedCountry(c)
    setCountryQuery('')
    setDropdownOpen(false)
    setPickerPhase('country')
    setDraftCountry(null)
    setArrivalQuery('')
  }

  const beginArrivalPicker = (c) => {
    setDraftCountry(c)
    setPickerPhase('arrival')
    setCountryQuery(c.name)
    setArrivalQuery('')
    setDropdownOpen(true)
  }

  const handlePickCountryFromList = (c) => {
    const arrivals = getArrivalsForCountry(c)
    if (arrivals.length === 1) {
      const merged = { ...countryRowWithoutArrivals(c), city: arrivals[0].city, iata: arrivals[0].iata }
      confirmCountry(merged)
      return
    }
    beginArrivalPicker(c)
  }

  const handlePickArrival = (a) => {
    if (!draftCountry) return
    const merged = { ...countryRowWithoutArrivals(draftCountry), city: a.city, iata: a.iata }
    confirmCountry(merged)
  }

  const handleChangeCountryRequest = () => {
    setPickerPhase('country')
    setDraftCountry(null)
    setCountryQuery('')
    setArrivalQuery('')
    setDropdownOpen(true)
  }

  const handleCountryInputChange = (raw) => {
    if (pickerPhase === 'arrival') return
    const v = sanitizeCountryInput(raw)
    setCountryQuery(v)
    setDropdownOpen(true)
    setSelectedCountry((prev) => {
      if (!prev) return null
      if (v.trim() === '') return prev
      if (v === prev.name) return prev
      return null
    })
  }

  const handleCountryFocus = () => {
    setDropdownOpen(true)
  }

  const handleCountryKeyDown = (e) => {
    if (pickerPhase === 'arrival') return
    if (e.key !== 'Enter') return
    if (e.nativeEvent.isComposing) return
    e.preventDefault()

    const trimmed = countryQuery.trim()
    if (!trimmed) return

    const exact = findExactCountryMatch(trimmed, countryOptions)
    if (exact) {
      handlePickCountryFromList(exact)
      return
    }

    const q = countryQuery.trim()
    const list = countryOptions.filter((c) => {
      if (c.name.includes(q)) return true
      if (c.aliases?.some((a) => a.includes(q))) return true
      return false
    })
    if (list.length === 1) {
      handlePickCountryFromList(list[0])
      return
    }
    if (list.length > 1) {
      handlePickCountryFromList(list[0])
    }
  }

  const handleArrivalQueryChange = (raw) => {
    setArrivalQuery(sanitizeArrivalInput(raw))
  }

  const handleArrivalKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleChangeCountryRequest()
      return
    }
    if (e.key !== 'Enter') return
    if (e.nativeEvent.isComposing) return
    e.preventDefault()
    if (arrivalSuggestions.length === 1) {
      handlePickArrival(arrivalSuggestions[0])
      return
    }
    const t = arrivalQuery.trim()
    if (t && arrivalSuggestions.length > 0) {
      handlePickArrival(arrivalSuggestions[0])
      return
    }
    // DB에 없는 도시 — 자유 입력 텍스트로 진행 허용
    if (t && arrivalSuggestions.length === 0 && draftCountry) {
      handlePickArrival({ city: t, iata: null })
    }
  }

  const removeCountryTag = () => {
    setSelectedCountry(null)
    setCountryQuery('')
    setPickerPhase('country')
    setDraftCountry(null)
    setArrivalQuery('')
  }

  const handleMobileRangeChange = ({ start, end }) => {
    setStartDate(start)
    setEndDate(end)
  }

  const additionalArrivalSuggestions = useMemo(() => {
    if (!selectedCountry) return []
    const fullEntry = countryOptions.find((c) => c.countryCode === selectedCountry.countryCode) ?? selectedCountry
    const all = getArrivalsForCountry(fullEntry)
    const existing = new Set([selectedCountry.city, ...additionalDests])
    const query = sanitizeArrivalInput(additionalInput)
    const filtered = query ? filterArrivalsByQuery(all, query) : all
    return filtered.filter((a) => !existing.has(a.city))
  }, [selectedCountry, additionalInput, additionalDests, countryOptions])

  const addAdditionalDest = (city) => {
    if (!city || additionalDests.includes(city)) return
    setAdditionalDests((prev) => [...prev, city])
    setAdditionalInput('')
  }

  const removeAdditionalDest = (city) => {
    setAdditionalDests((prev) => prev.filter((c) => c !== city))
  }

  const dateSectionOk =
    startDate !== '' && endDate !== '' && endDate >= startDate

  const isValid = Boolean(selectedCountry) && dateSectionOk

  const mobileIsValid = Boolean(selectedCountry) && dateSectionOk

  const goNextMobile = () => {
    if (!mobileIsValid || !selectedCountry) return
    const navState = {
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
    }
    trackEvent('step_complete', { step: 'destination', destination: navState.destination?.city })
    saveStep4NavigationState(navState)
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
    })
    navigate('/trips/new/step4', { state: navState })
  }

  const goNext = () => {
    if (!isValid || !selectedCountry) return
    const navState = {
      destination: {
        iata: selectedCountry.iata,
        city: selectedCountry.city,
        country: selectedCountry.country,
        countryCode: selectedCountry.countryCode,
      },
      fromDestinationPage: true,
      tripStartDate: startDate,
      tripEndDate: endDate,
    }
    trackEvent('step_complete', { step: 'destination', destination: navState.destination?.city })
    saveStep4NavigationState(navState)
    saveActiveTripPlan({
      destination: {
        iata: selectedCountry.iata,
        city: selectedCountry.city,
        country: selectedCountry.country,
        countryCode: selectedCountry.countryCode,
      },
      tripStartDate: startDate,
      tripEndDate: endDate,
    })
    navigate('/trips/new/step4', { state: navState })
  }

  const formProps = {
    comboRef,
    countryQuery,
    onCountryInputChange: handleCountryInputChange,
    onCountryKeyDown: handleCountryKeyDown,
    onCountryFocus: handleCountryFocus,
    countryInputReadOnly: pickerPhase === 'arrival',
    onChangeCountryRequest: handleChangeCountryRequest,
    suggestions,
    showDropdown: dropdownOpen,
    onPickCountry: handlePickCountryFromList,
    pickerPhase,
    arrivalQuery,
    onArrivalQueryChange: handleArrivalQueryChange,
    onArrivalKeyDown: handleArrivalKeyDown,
    arrivalSuggestions,
    onPickArrival: handlePickArrival,
    selectedCountry,
    onRemoveCountryTag: removeCountryTag,
    startDate,
    endDate,
    today,
    onRangeChange: handleMobileRangeChange,
    allCountries: countryOptions,
  }

  return (
    <div className="min-h-screen" style={TRIP_FLOW_PAGE_BG_STYLE}>
      {/* 데스크톱: 풀블리드 이미지 없음 — 본문만 뷰포트 중앙 정렬 */}
      <div className="hidden min-h-screen flex-col lg:flex">
        {/* Header.jsx 와 동일: max-w-7xl + px-3 md:px-6 lg:px-8 → 로고·이전으로 왼선 일치 */}
        <div className="shrink-0 mx-auto w-full max-w-7xl px-3 pt-8 md:px-6 md:pt-8 lg:px-8 lg:pt-10">
          <TripNewFlowDesktopPrevBar align="start" />
        </div>
        <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 items-center justify-center px-3 py-8 md:px-6 md:py-8 lg:px-8 lg:py-10">
          <div className="scrollbar-hide w-full max-w-xl overflow-y-auto">
            <StepHeader
              currentStep={STEP_DESTINATION_CONFIG.currentStep}
              totalSteps={STEP_DESTINATION_CONFIG.totalSteps}
              title={
                <>
                  방문 도시와 날짜를
                  <br />
                  알려주세요
                </>
              }
              subtitle={SUBTITLE_DESKTOP}
              className="mb-8"
            />
            <DestinationDateForm {...formProps} />
            <div className="mt-6">
              <TripFlowNextStepButton variant="amber" disabled={!isValid} onClick={goNext} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile + Tablet (< 1024px) */}
      <div
        className="lg:hidden flex min-h-screen flex-col"
        style={{
          backgroundColor: '#f3fff8',
          backgroundImage: `
            radial-gradient(circle at 8% 12%, rgba(117,221,255,0.34) 0%, rgba(117,221,255,0) 20%),
            radial-gradient(circle at 80% 16%, rgba(248,215,116,0.34) 0%, rgba(248,215,116,0) 24%),
            radial-gradient(circle at 10% 44%, rgba(117,221,255,0.18) 0%, rgba(117,221,255,0) 20%),
            radial-gradient(circle at 68% 78%, rgba(251,222,132,0.2) 0%, rgba(251,222,132,0) 28%),
            linear-gradient(180deg, #e8fffe 0%, #f4fff1 52%, #fff9e8 100%)`,
        }}
      >
        {/* 상단 바: 뒤로가기(< 모양) 절대 위치 + 진행률 바 완전 중앙 */}
        <div className="relative flex items-center justify-center px-5 pt-12 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="이전으로"
            className="absolute left-5 flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-white/60 active:bg-white/80"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex w-1/2 gap-1.5">
            {Array.from({ length: STEP_DESTINATION_CONFIG.totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i < (additionalDests.length > 0 ? 3 : dateSectionOk ? 2 : selectedCountry ? 1 : 0) ? 'bg-[#3db4dd]' : 'bg-gray-200/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 폼 */}
        <div className="flex-1 px-6 pt-8">
          {/* ① 여행지 — 항상 표시 */}
          <div className="mb-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#3db4dd]">
              Step {STEP_DESTINATION_CONFIG.currentStep}
            </p>
            <h1 className="mb-3 text-xl font-extrabold leading-snug text-slate-900">
              어떤 여행을 계획하고
              <br />
              계신가요?
            </h1>
            {selectedCountry ? (
              <div className="flex items-center justify-between rounded-xl border border-[#3db4dd]/40 bg-white/80 px-4 py-3.5 shadow-sm">
                <span className="font-medium text-gray-900">
                  {selectedCountry.country}, {selectedCountry.city}
                </span>
                <button
                  type="button"
                  onClick={removeCountryTag}
                  className="text-xs font-medium text-[#3db4dd] hover:text-[#0f5762]"
                >
                  변경
                </button>
              </div>
            ) : (
              <DestinationCountryAutocomplete
                comboRef={comboRef}
                countryQuery={countryQuery}
                onCountryInputChange={handleCountryInputChange}
                onCountryKeyDown={handleCountryKeyDown}
                onCountryFocus={handleCountryFocus}
                countryInputReadOnly={pickerPhase === 'arrival'}
                onChangeCountryRequest={handleChangeCountryRequest}
                suggestions={suggestions}
                isPanelOpen={dropdownOpen && (pickerPhase === 'arrival' || countryQuery.trim().length > 0)}
                onPickCountry={handlePickCountryFromList}
                pickerPhase={pickerPhase}
                arrivalQuery={arrivalQuery}
                onArrivalQueryChange={handleArrivalQueryChange}
                onArrivalKeyDown={handleArrivalKeyDown}
                arrivalSuggestions={arrivalSuggestions}
                onPickArrival={handlePickArrival}
                panelId="country-autocomplete-panel-mobile-v2"
                placeholder="일본, 도쿄"
              />
            )}
          </div>

          {/* ② 여행 시기 — 여행지 선택 후 등장 */}
          <div
            className={`grid transition-all duration-500 ${
              selectedCountry ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
            style={{ transitionTimingFunction: selectedCountry ? 'cubic-bezier(0.34,1.36,0.64,1)' : 'ease-in' }}
          >
            <div className="overflow-hidden">
              <div
                className={`mb-5 transition-transform duration-500 ${selectedCountry ? 'translate-y-0' : 'translate-y-4'}`}
                style={{ transitionTimingFunction: selectedCountry ? 'cubic-bezier(0.34,1.36,0.64,1)' : 'ease-in' }}
              >
                <div ref={calendarRef}>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#3db4dd]">Step 2</p>
                  <h2 className="mb-3 text-xl font-extrabold leading-snug text-slate-900">언제 떠나실 예정인가요?</h2>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left shadow-sm transition ${
                      calendarOpen
                        ? 'border-[#3db4dd]/60 bg-white ring-2 ring-[#3db4dd]/20'
                        : startDate
                        ? 'border-[#3db4dd]/40 bg-white/80'
                        : 'border-gray-200 bg-white/60'
                    }`}
                  >
                    <span className={startDate ? 'font-medium text-gray-900' : 'text-gray-400'}>
                      {startDate && endDate
                        ? `${formatDateKo(startDate)} ~ ${formatDateKo(endDate)}`
                        : startDate
                        ? `${formatDateKo(startDate)} 출발`
                        : '날짜를 선택하세요'}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* 인라인 캘린더 — overflow-hidden 부모에 의한 잘림 방지 */}
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                      calendarOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="mt-1 rounded-xl border border-[#3db4dd]/25 bg-white p-3 shadow-lg">
                      <DestinationMobileRangeCalendar
                        startDate={startDate}
                        endDate={endDate}
                        todayYmd={today}
                        minDateYmd={today}
                        onChangeRange={({ start, end }) => {
                          handleMobileRangeChange({ start, end })
                          if (start && end) setCalendarOpen(false)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ③ 추가 취항지 — 날짜 입력 후 등장 (선택) */}
          <div
            className={`grid transition-all duration-500 ${
              dateSectionOk ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
            style={{ transitionTimingFunction: dateSectionOk ? 'cubic-bezier(0.34,1.36,0.64,1)' : 'ease-in' }}
          >
            <div className={dateSectionOk ? 'overflow-visible' : 'overflow-hidden'}>
              <div
                className={`mb-5 transition-transform duration-500 ${dateSectionOk ? 'translate-y-0' : 'translate-y-4'}`}
                style={{ transitionTimingFunction: dateSectionOk ? 'cubic-bezier(0.34,1.36,0.64,1)' : 'ease-in' }}
              >
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#3db4dd]">Step 3</p>
                <h2 className="mb-3 text-xl font-extrabold leading-snug text-slate-900">추가로 방문할 도시가 있나요?</h2>
                <p className="mb-3 text-xs text-gray-400">선택사항이에요. 없으면 바로 다음으로 넘어가세요.</p>

                {/* 드롭다운 인풋 */}
                <div ref={additionalDropRef} className="relative">
                  <input
                    type="text"
                    value={additionalInput}
                    onChange={(e) => { setAdditionalInput(e.target.value); setAdditionalDropOpen(true) }}
                    onFocus={() => setAdditionalDropOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setAdditionalDropOpen(false); return }
                      if (e.key === 'Enter' && additionalArrivalSuggestions.length > 0) {
                        e.preventDefault()
                        addAdditionalDest(additionalArrivalSuggestions[0].city)
                      }
                    }}
                    placeholder="도시 이름을 검색하세요"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-[#3db4dd]/60 focus:outline-none focus:ring-2 focus:ring-[#3db4dd]/20"
                  />
                  {additionalDropOpen && additionalArrivalSuggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#3db4dd]/20 bg-white shadow-lg">
                      {additionalArrivalSuggestions.map((arrival) => (
                        <li key={arrival.iata ?? arrival.city}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); addAdditionalDest(arrival.city) }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-teal-50 active:bg-teal-100"
                          >
                            <span className="font-semibold">{arrival.city}</span>
                            {arrival.iata && <span className="text-xs text-gray-400">{arrival.iata}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {additionalDests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {additionalDests.map((city) => (
                      <span
                        key={city}
                        className="flex items-center gap-1.5 rounded-full border border-[#3db4dd]/30 bg-[#3db4dd]/10 px-3 py-1 text-sm font-semibold text-[#0f5762]"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => removeAdditionalDest(city)}
                          className="flex h-4 w-4 items-center justify-center rounded-full text-[#3db4dd] hover:bg-[#3db4dd]/20"
                          aria-label={`${city} 삭제`}
                        >
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 다음 버튼 */}
        <div className="px-6 pb-10 pt-8">
          <button
            type="button"
            onClick={goNextMobile}
            disabled={!mobileIsValid}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 py-4 text-base font-bold text-[#6a4a00] shadow-md shadow-amber-900/15 transition hover:from-amber-200 hover:to-amber-300 active:scale-[0.99] disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  )
}
