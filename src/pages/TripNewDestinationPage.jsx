import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  STEP_DESTINATION_CONFIG,
  MOBILE_QUICK_DESTINATION_CHIPS,
  filterArrivalsByQuery,
  getArrivalsForCountry,
  sanitizeCountryInput,
  sanitizeArrivalInput,
} from '@/mocks/tripNewDestinationData'
import { COMPANIONS, TRAVEL_STYLES } from '@/mocks/tripNewStep5Data'
import { useTodaySync } from '@/hooks/useTodaySync'
import { useScrollChrome } from '@/contexts/scrollChromeContext'
import { useCountryOptions } from '@/hooks/useCountryOptions'
import {
  findExactCountryMatch,
  countryRowWithoutArrivals,
  formatDateKo,
} from '@/utils/destinationHelpers'
import DestinationMobileRangeCalendar from '@/components/trip/DestinationMobileRangeCalendar'
import DestinationCountryAutocomplete from '@/components/trip/DestinationCountryAutocomplete'
import RevealSection from '@/components/trip/RevealSection'
import CompanionSelector from '@/components/trip/CompanionSelector'
import TravelStyleSelector from '@/components/trip/TravelStyleSelector'
import DestinationResetConfirmModal from '@/components/trip/DestinationResetConfirmModal'
import DestinationNextButton from '@/components/trip/DestinationNextButton'
import { saveActiveTripPlan, loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { saveActiveTripId, clearActiveTripId } from '@/utils/activeTripIdStorage'
import { buildCreateTripPayload } from '@/utils/tripPlanToCreatePayload'
import { createTrip } from '@/api/trips'
import { resolveAccessToken } from '@/api/client'
import { trackEvent } from '@/utils/analyticsTracker'
import { ga4Event } from '@/utils/ga4'

/** 이미지 히어로 없이 — CHECKMATE 플로우 틸·민트·시안 톤 */
const TRIP_FLOW_PAGE_BG_STYLE = {
  background: `
    radial-gradient(ellipse 120% 80% at 50% -15%, rgba(45, 212, 191, 0.18), transparent 55%),
    radial-gradient(ellipse 90% 70% at 0% 30%, rgba(204, 251, 241, 0.55), transparent 50%),
    radial-gradient(ellipse 85% 60% at 100% 70%, rgba(167, 243, 208, 0.28), transparent 52%),
    linear-gradient(165deg, #ecfdf5 0%, #f0fdfa 22%, #ecfeff 48%, #f8fafc 100%)
  `,
}

function TripNewDestinationPageInner({ navState }) {
  const navigate = useNavigate()

  // ─── 날짜·스크롤·나라 옵션 훅 ───────────────────────────────────────────────
  const today = useTodaySync()
  const bottomNavVisible = useScrollChrome()
  const countryOptions = useCountryOptions()

  // ─── 여행지 선택 상태 ──────────────────────────────────────────────────────
  const comboRef = useRef(null)
  const [countryQuery, setCountryQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(navState?.preselectedCountry ?? null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [pickerPhase, setPickerPhase] = useState('country')
  const [draftCountry, setDraftCountry] = useState(null)
  const [arrivalQuery, setArrivalQuery] = useState('')

  // ─── 날짜 상태 ─────────────────────────────────────────────────────────────
  const calendarRef = useRef(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)

  // ─── 추가 취항지 상태 ──────────────────────────────────────────────────────
  const additionalDropRef = useRef(null)
  const [additionalDests, setAdditionalDests] = useState([])
  const [draftDests, setDraftDests] = useState([])
  const [additionalInput, setAdditionalInput] = useState('')
  const [additionalDropOpen, setAdditionalDropOpen] = useState(false)
  const [step3Confirmed, setStep3Confirmed] = useState(false)

  // ─── 동행인·여행 스타일·섹션 표시 상태 ─────────────────────────────────────
  const [section4Visible, setSection4Visible] = useState(false)
  const [section5Visible, setSection5Visible] = useState(false)
  const [companionIds, setCompanionIds] = useState([])
  const [styleIds, setStyleIds] = useState([])

  // ─── 제출 상태 ─────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ─── 섹션 ref ──────────────────────────────────────────────────────────────
  const step2Ref = useRef(null)
  const step3Ref = useRef(null)
  const step4Ref = useRef(null)
  const step5Ref = useRef(null)

  // ─── 파생 ──────────────────────────────────────────────────────────────────
  const dateSectionOk = startDate !== '' && endDate !== '' && endDate >= startDate

  const completedSteps =
    styleIds.length > 0     ? 5 :
    companionIds.length > 0 ? 4 :
    section4Visible         ? 3 :
    dateSectionOk           ? 2 :
    selectedCountry         ? 1 : 0

  // ─── 초기화 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    clearActiveTripId()
  }, [])

  // iOS 오버스크롤(rubber-band)로 헤더와 진행률바가 어긋나는 현상 방지
  useEffect(() => {
    const html = document.documentElement
    html.style.setProperty('overscroll-behavior-y', 'none')
    return () => html.style.removeProperty('overscroll-behavior-y')
  }, [])

  // ─── today 변경 시 과거 날짜 비움 ──────────────────────────────────────────
  useEffect(() => {
    setStartDate((prev) => (prev && prev < today ? '' : prev))
    setEndDate((prev) => (prev && prev < today ? '' : prev))
  }, [today])

  // ─── 드롭다운 외부 클릭 닫기 ───────────────────────────────────────────────
  useEffect(() => {
    function handlePointerDown(e) {
      if (!comboRef.current?.contains(e.target)) setDropdownOpen(false)
      if (!calendarRef.current?.contains(e.target)) setCalendarOpen(false)
      if (!additionalDropRef.current?.contains(e.target)) setAdditionalDropOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  // ─── 여행지 변경 시 하위 상태 초기화 ───────────────────────────────────────
  useEffect(() => {
    if (!selectedCountry) {
      setStartDate('')
      setEndDate('')
      setCalendarOpen(false)
      setAdditionalDests([])
      setDraftDests([])
      setAdditionalInput('')
      setAdditionalDropOpen(false)
      setStep3Confirmed(false)
      setSection4Visible(false)
      setSection5Visible(false)
      setCompanionIds([])
      setStyleIds([])
    }
  }, [selectedCountry])

  // ─── 섹션 전환 시 해당 섹션으로 스크롤 ─────────────────────────────────────
  const prevSelectedCountryRef = useRef(null)
  useEffect(() => {
    const prev = prevSelectedCountryRef.current
    prevSelectedCountryRef.current = selectedCountry
    if (!prev && selectedCountry) scrollToSection(step2Ref)
  }, [selectedCountry]) // eslint-disable-line react-hooks/exhaustive-deps

  const prevSection3Ref = useRef(false)
  useEffect(() => {
    const prev = prevSection3Ref.current
    prevSection3Ref.current = dateSectionOk
    if (!prev && dateSectionOk) scrollToSection(step3Ref)
  }, [dateSectionOk]) // eslint-disable-line react-hooks/exhaustive-deps

  const prevStep3ConfirmedRef = useRef(false)
  useEffect(() => {
    const prev = prevStep3ConfirmedRef.current
    prevStep3ConfirmedRef.current = step3Confirmed
    if (!prev && step3Confirmed) {
      setSection4Visible(true)
      scrollToSection(step4Ref)
    }
  }, [step3Confirmed]) // eslint-disable-line react-hooks/exhaustive-deps

  const prevHasCompanionRef = useRef(false)
  useEffect(() => {
    const hasCompanion = companionIds.length > 0
    const prev = prevHasCompanionRef.current
    prevHasCompanionRef.current = hasCompanion
    if (!prev && hasCompanion) {
      setSection5Visible(true)
      scrollToSection(step5Ref)
    }
  }, [companionIds.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 자동완성 파생 ─────────────────────────────────────────────────────────
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

  const additionalArrivalSuggestions = useMemo(() => {
    if (!selectedCountry) return []
    const fullEntry = countryOptions.find((c) => c.countryCode === selectedCountry.countryCode) ?? selectedCountry
    const all = getArrivalsForCountry(fullEntry)
    const query = sanitizeArrivalInput(additionalInput)
    const filtered = query ? filterArrivalsByQuery(all, query) : all
    return filtered.filter((a) => a.city !== selectedCountry.city)
  }, [selectedCountry, additionalInput, countryOptions])

  // ─── 유틸 ──────────────────────────────────────────────────────────────────
  const scrollToSection = (ref) => {
    setTimeout(() => {
      if (!ref.current) return
      const BAR_H = 72
      const target = ref.current.getBoundingClientRect().top + window.scrollY - BAR_H
      const footer = document.querySelector('footer')
      const maxY = footer
        ? footer.getBoundingClientRect().top + window.scrollY - window.innerHeight
        : document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: Math.min(Math.max(0, target), Math.max(0, maxY)), behavior: 'smooth' })
    }, 200)
  }

  // ─── 여행지 선택 핸들러 ────────────────────────────────────────────────────
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

  const handleCountryFocus = () => setDropdownOpen(true)

  const handlePickQuickCity = (chip) => {
    const country = countryOptions.find((c) => c.name === chip.countryName)
    if (!country) return
    const arrivals = getArrivalsForCountry(country)
    const arrival = arrivals.find((a) => a.iata === chip.iata) ?? arrivals[0]
    if (arrival) {
      confirmCountry({ ...countryRowWithoutArrivals(country), city: arrival.city, iata: arrival.iata })
    } else {
      confirmCountry(country)
    }
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

    const list = countryOptions.filter((c) => {
      if (c.name.includes(trimmed)) return true
      if (c.aliases?.some((a) => a.includes(trimmed))) return true
      return false
    })
    if (list.length >= 1) handlePickCountryFromList(list[0])
  }

  const handleArrivalQueryChange = (raw) => setArrivalQuery(sanitizeArrivalInput(raw))

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

  // ─── 추가 취항지 핸들러 ────────────────────────────────────────────────────
  const toggleDraftDest = (city) => {
    if (!city) return
    setDraftDests((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }

  const confirmAdditionalDests = () => {
    setAdditionalDests(draftDests)
    setAdditionalInput('')
    setAdditionalDropOpen(false)
    if (draftDests.length > 0) setStep3Confirmed(true)
  }

  // ─── 동행인·스타일 핸들러 ──────────────────────────────────────────────────
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

  // ─── 제출 ──────────────────────────────────────────────────────────────────
  const mobileIsValid = Boolean(selectedCountry) && dateSectionOk && step3Confirmed && companionIds.length >= 1 && styleIds.length >= 1

  const goNextMobile = async () => {
    if (!mobileIsValid || !selectedCountry || submitting) return
    setSubmitError('')
    setSubmitting(true)

    try {
      ga4Event('search_button_click', { source: 'mobile' })
      trackEvent('step_complete', { step: 'destination_mobile', destination: selectedCountry.city })

      const hasPet = companionIds.some((id) => id === 'pets' || id === 'withPet')
      const companionLabel = COMPANIONS
        .filter((c) => companionIds.includes(c.id))
        .map((c) => c.label)
        .join(', ') || null
      const travelStyleLabels = TRAVEL_STYLES
        .filter((s) => styleIds.includes(s.id))
        .map((s) => s.label)

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
        step5: { companionIds, travelStyleIds: styleIds },
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
        if (sessionStorage.getItem('curationSave')) {
          navigate(`/trips/${createdTripId}/search`, { state: { ...baseState, createdTripId, fromCuration: true } })
        } else {
          navigate(`/trips/${createdTripId}/loading`, { state: { ...baseState, createdTripId } })
        }
      } else {
        navigate('/guide-archives', { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '여행 계획을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'
      console.warn('[TripNewDestinationPage] createTrip 실패:', msg)
      setSubmitError('여행 계획 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      clearActiveTripId()
    } finally {
      setSubmitting(false)
    }
  }

  // ─── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={TRIP_FLOW_PAGE_BG_STYLE}>
      {/* Mobile (< 1024px) */}
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
        {/* 상단 바: 뒤로가기 + 진행률 바 */}
        <div className={`fixed left-0 right-0 z-[55] flex items-center justify-center px-5 pt-3 pb-2 lg:hidden transition-[top] duration-300 ease-out ${bottomNavVisible ? 'top-14' : 'top-0'}`}>
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
                  i < completedSteps ? 'bg-[#3db4dd]' : 'bg-gray-200/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 폼 */}
        <div className="flex-1 px-6 pb-32 pt-14">

          {/* 큐레이션에서 진입 시 안내 배너 */}
          {navState?.fromCuration && (
            <div className="mb-4 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700 font-medium">
              ✅ 큐레이션 항목이 저장됩니다. 여행 정보를 입력해주세요!
            </div>
          )}

          {/* ① 여행지 — 항상 표시 */}
          <div className="mb-5">
            <h1 className="mb-3 text-xl font-extrabold leading-snug text-slate-900">
              어떤 여행을 계획하고 계신가요?
            </h1>
            {selectedCountry ? (
              <div className="flex items-center justify-between rounded-xl border border-[#3db4dd]/40 bg-white/80 px-4 py-3.5 shadow-sm">
                <span className="font-medium text-gray-900">
                  {selectedCountry.country}, {selectedCountry.city}
                </span>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
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
                isPanelOpen={dropdownOpen}
                onPickCountry={handlePickCountryFromList}
                pickerPhase={pickerPhase}
                arrivalQuery={arrivalQuery}
                onArrivalQueryChange={handleArrivalQueryChange}
                onArrivalKeyDown={handleArrivalKeyDown}
                arrivalSuggestions={arrivalSuggestions}
                onPickArrival={handlePickArrival}
                panelId="country-autocomplete-panel-mobile-v2"
                placeholder="일본, 도쿄"
                quickCityChips={MOBILE_QUICK_DESTINATION_CHIPS}
                onPickQuickCity={handlePickQuickCity}
              />
            )}
          </div>

          {/* ② 여행 시기 — 여행지 선택 후 등장 */}
          <RevealSection visible={!!selectedCountry} innerRef={step2Ref}>
            <div ref={calendarRef}>
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
                      setStartDate(start)
                      setEndDate(end)
                      if (start && end) setCalendarOpen(false)
                    }}
                  />
                </div>
              </div>
            </div>
          </RevealSection>

          {/* ③ 추가 취항지 — 날짜 확정 후 등장 (선택) */}
          <RevealSection visible={dateSectionOk} innerRef={step3Ref} className="relative z-10" dynamicOverflow>
            <h2 className="mb-3 text-xl font-extrabold leading-snug text-slate-900">추가로 방문할 도시가 있나요?</h2>

            {/* 미확정: 인풋 + 없음 버튼 */}
            {!step3Confirmed && (
              <>
                <p className="mb-3 text-xs text-gray-400">선택사항이에요. 없으면 '없음'을 눌러주세요.</p>
                <div ref={additionalDropRef} className="relative">
                  <input
                    type="text"
                    value={additionalInput}
                    onChange={(e) => { setAdditionalInput(e.target.value); setAdditionalDropOpen(true) }}
                    onFocus={() => { setDraftDests([...additionalDests]); setAdditionalDropOpen(true) }}
                    onClick={() => { setDraftDests([...additionalDests]); setAdditionalDropOpen(true) }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setAdditionalDropOpen(false); return }
                      if (e.key === 'Enter' && additionalArrivalSuggestions.length > 0) {
                        e.preventDefault()
                        toggleDraftDest(additionalArrivalSuggestions[0].city)
                      }
                    }}
                    placeholder="도시 이름을 검색하세요"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-[#3db4dd]/60 focus:outline-none focus:ring-2 focus:ring-[#3db4dd]/20"
                  />
                  {additionalDropOpen && additionalArrivalSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-[#3db4dd]/20 bg-white shadow-lg">
                      <ul className="max-h-44 overflow-y-auto">
                        {additionalArrivalSuggestions.map((arrival) => {
                          const isSelected = draftDests.includes(arrival.city)
                          return (
                            <li key={arrival.iata ?? arrival.city}>
                              <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); toggleDraftDest(arrival.city) }}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                                  isSelected ? 'bg-[#3db4dd]/10 text-[#0f5762]' : 'text-gray-800 hover:bg-teal-50'
                                }`}
                              >
                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                  isSelected ? 'border-[#3db4dd] bg-[#3db4dd]' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  )}
                                </span>
                                <span className="font-semibold">{arrival.city}</span>
                                {arrival.iata && <span className="text-xs text-gray-400">{arrival.iata}</span>}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                      <div className="sticky bottom-0 border-t border-[#3db4dd]/20 px-3 py-2">
                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); confirmAdditionalDests() }}
                          className="w-full rounded-lg bg-[#3db4dd] py-2 text-sm font-bold text-white transition hover:bg-[#2da0c8] active:scale-[0.99]"
                        >
                          확인{draftDests.length > 0 ? ` (${draftDests.length})` : ''}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setAdditionalDests([]); setStep3Confirmed(true) }}
                  className="mt-3 w-full rounded-xl border border-[#3db4dd]/40 bg-white py-3 text-sm font-semibold text-[#3db4dd] shadow-sm transition hover:bg-[#3db4dd]/5 hover:border-[#3db4dd]/60 active:scale-[0.99]"
                >
                  없음
                </button>
              </>
            )}

            {/* 확정 후: 선택된 도시 요약 + 변경 */}
            {step3Confirmed && (
              <div className="flex items-center justify-between rounded-xl border border-[#3db4dd]/30 bg-white/80 px-4 py-3 shadow-sm">
                <div className="flex flex-wrap gap-1.5">
                  {additionalDests.length > 0 ? additionalDests.map((city) => (
                    <span key={city} className="rounded-full bg-[#3db4dd]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0f5762]">
                      {city}
                    </span>
                  )) : (
                    <span className="text-sm text-gray-500">추가 도시 없음</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep3Confirmed(false)}
                  className="ml-3 shrink-0 text-xs font-medium text-[#3db4dd] hover:text-[#0f5762]"
                >
                  변경
                </button>
              </div>
            )}
          </RevealSection>

          {/* ④ 동행인 — step3 확정 후 등장 */}
          <RevealSection visible={section4Visible} innerRef={step4Ref}>
            <h2 className="mb-3 text-xl font-extrabold leading-snug text-slate-900">누구와 함께 하나요?</h2>
            <p className="mb-3 text-xs text-gray-400">최대 2개까지 선택 가능해요.</p>
            <CompanionSelector selectedIds={companionIds} onToggle={toggleCompanion} />
          </RevealSection>

          {/* ⑤ 여행 스타일 — 동행인 선택 후 등장 */}
          <RevealSection visible={section5Visible} innerRef={step5Ref}>
            <h2 className="mb-3 text-xl font-extrabold leading-snug text-slate-900">어떤 여행을 즐기시나요?</h2>
            <p className="mb-3 text-xs text-gray-400">복수 선택 가능해요.</p>
            <TravelStyleSelector selectedIds={styleIds} onToggle={toggleStyle} />
          </RevealSection>
        </div>

        <DestinationResetConfirmModal
          open={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={() => { setShowResetConfirm(false); removeCountryTag() }}
        />

        <DestinationNextButton
          visible={styleIds.length > 0}
          navBarVisible={bottomNavVisible}
          submitting={submitting}
          submitError={submitError}
          onClick={goNextMobile}
        />
      </div>
    </div>
  )
}

export default function TripNewDestinationPage() {
  const { state: navState } = useLocation()
  const fromCuration = navState?.fromCuration ?? false
  if (typeof window !== 'undefined' && window.innerWidth >= 1024 && !fromCuration) {
    return <Navigate to="/" replace />
  }
  return <TripNewDestinationPageInner navState={navState} />
}
