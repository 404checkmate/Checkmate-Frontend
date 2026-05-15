/**
 * 보관용 — 활성 새 여행 플로우에서는 사용하지 않습니다.
 * 라우트 `/trips/new/step3`는 유지(직접 URL·복구용). 메인 플로우: `/trips/new/destination` → step4 → step5 (3단계).
 * 모바일/태블릿: TripNewDestinationPage로 리다이렉트.
 */
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  STEP3_CONFIG,
  FLIGHT_SECTIONS,
  FLIGHT_NO_EXAMPLES_HINT,
  HERO_IMAGE,
  AI_TIP,
} from '@/mocks/tripNewStep3Data'
import { fetchFlightInfo } from '@/mocks/flightMockData'
import StepHeader from '@/components/common/StepHeader'
import { TripNewFlowDesktopPrevBar } from '@/components/trip/TripNewFlowPrevControls'
import AiConciergeTip from '@/components/common/AiConciergeTip'
import TripStepDesktopSplit from '@/components/trip/TripStepDesktopSplit'
import { TripFlowNextStepButton } from '@/components/trip/TripFlowNextStepButton'
import { FullBleedMintImageHero } from '@/components/trip/MintProgressiveHero'
import { saveStep4NavigationState } from '@/utils/tripFlowDraftStorage'
import step3DesktopMascotUrl from '@/assets/step3-desktop-mascot.png'

const STEP3_SUBTITLE_TEXT =
  '맞춤 여행 준비를 도와드리려면, 먼저 예약하신 항공 일정이 필요해요. 가는편과 오는편 각각 탑승 날짜와 편명을 입력해 주세요.'

const STEP3_SUBTITLE_DESKTOP = (
  <>
    <p className="text-gray-600 leading-relaxed">{STEP3_SUBTITLE_TEXT}</p>
    <p className="mt-3 text-[11px] leading-relaxed text-gray-600">{FLIGHT_NO_EXAMPLES_HINT}</p>
  </>
)

function FlightResultBadge({ info }) {
  return (
    <div className="mt-3 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-teal-700">
          {info.departure.iata} → {info.arrival.iata}
          <span className="ml-2 font-normal text-gray-500">{info.airline}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {info.departure.city} → {info.arrival.city}
          {info.arrival.country && ` (${info.arrival.country})`}
        </p>
      </div>
    </div>
  )
}

function DesktopFlightCard({ section, date, flightNo, flightResult, loadingLookup, lookupError, today, returnMinDate, onDateChange, onFlightNoChange, onLookup }) {
  return (
    <div className="relative bg-white rounded-2xl p-6 pt-7 shadow-sm">
      {flightResult && (
        <span className="absolute right-6 top-4 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
          조회 완료
        </span>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">{section.dateLabel}</p>
          <input
            type="date"
            value={date}
            min={section.id === 'return' ? returnMinDate : today}
            onChange={(e) => onDateChange(section.id, e.target.value)}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">{section.flightLabel}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={flightNo}
              onChange={(e) => onFlightNoChange(section.id, e.target.value.toUpperCase())}
              placeholder={section.flightPlaceholder}
              className="flex-1 min-w-0 bg-gray-50 rounded-xl px-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
            <button
              onClick={() => onLookup(section.id)}
              disabled={!flightNo.trim() || loadingLookup}
              className={`flex-shrink-0 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                !flightNo.trim() || loadingLookup
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
              }`}
            >
              {loadingLookup ? '...' : '조회'}
            </button>
          </div>
        </div>
      </div>
      {lookupError && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {lookupError}
        </p>
      )}
      {flightResult && <FlightResultBadge info={flightResult} />}
    </div>
  )
}

function TripNewStep3Page() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const [flights, setFlights] = useState({
    departure: { date: '', flightNo: '' },
    return: { date: '', flightNo: '' },
  })
  const [flightInfo, setFlightInfo] = useState({ departure: null, return: null })
  const [loading, setLoading] = useState({ departure: false, return: false })
  const [error, setError] = useState({ departure: '', return: '' })

  if (window.innerWidth < 768) {
    return <Navigate to="/trips/new/destination" replace />
  }

  const getReturnMinDate = () => {
    if (!flights.departure.date) return today
    const next = new Date(flights.departure.date)
    next.setDate(next.getDate() + 1)
    return next.toISOString().split('T')[0]
  }

  const handleDateChange = (sectionId, value) => {
    setFlights((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], date: value } }))
    if (sectionId === 'departure') {
      setFlightInfo((prev) => ({ ...prev, return: null }))
      setFlights((prev) => ({ ...prev, return: { ...prev.return, date: '' } }))
    }
  }

  const handleFlightNoChange = (sectionId, value) => {
    setFlights((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], flightNo: value } }))
    setFlightInfo((prev) => ({ ...prev, [sectionId]: null }))
    setError((prev) => ({ ...prev, [sectionId]: '' }))
  }

  const handleLookup = async (sectionId) => {
    const flightNo = flights[sectionId].flightNo.trim()
    if (!flightNo) return
    setLoading((prev) => ({ ...prev, [sectionId]: true }))
    setError((prev) => ({ ...prev, [sectionId]: '' }))
    setFlightInfo((prev) => ({ ...prev, [sectionId]: null }))
    try {
      const data = await fetchFlightInfo(flightNo)
      setFlightInfo((prev) => ({ ...prev, [sectionId]: data }))
    } catch (e) {
      setError((prev) => ({ ...prev, [sectionId]: e.message }))
    } finally {
      setLoading((prev) => ({ ...prev, [sectionId]: false }))
    }
  }

  const isValid =
    flights.departure.date !== '' &&
    flights.return.date !== '' &&
    flightInfo.departure !== null &&
    flightInfo.return !== null

  const cardProps = (section) => ({
    section,
    date: flights[section.id].date,
    flightNo: flights[section.id].flightNo,
    flightResult: flightInfo[section.id],
    loadingLookup: loading[section.id],
    lookupError: error[section.id],
    today,
    returnMinDate: getReturnMinDate(),
    onDateChange: handleDateChange,
    onFlightNoChange: handleFlightNoChange,
    onLookup: handleLookup,
  })

  const goToStep4 = () => {
    const navState = { destination: flightInfo.departure?.arrival || null }
    saveStep4NavigationState(navState)
    navigate('/trips/new/step4', { state: navState })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #E0F7FA 0%, #F0FDFA 100%)' }}>
      <TripStepDesktopSplit
        fullBleed={<FullBleedMintImageHero src={HERO_IMAGE} alt="비행기 창문" />}
        left={
          <>
            <TripNewFlowDesktopPrevBar className="mb-6" />
            <StepHeader
              currentStep={STEP3_CONFIG.currentStep}
              totalSteps={STEP3_CONFIG.totalSteps}
              title={<>예약한 항공편 정보를<br />입력하세요</>}
              subtitle={STEP3_SUBTITLE_DESKTOP}
              className="mb-8"
              subtitleClassName="text-sm"
            />
            <div className="flex-1 space-y-4">
              {FLIGHT_SECTIONS.map((section) => (
                <DesktopFlightCard key={section.id} {...cardProps(section)} />
              ))}
            </div>
            <div className="mt-6">
              <TripFlowNextStepButton variant="teal" disabled={!isValid} onClick={goToStep4} />
            </div>
          </>
        }
        right={
          <div className="relative h-full w-full">
            <div className="pointer-events-none absolute inset-x-0 top-[22vh] z-30 flex justify-center px-4 lg:px-8">
              <img
                src={step3DesktopMascotUrl}
                alt=""
                role="presentation"
                draggable={false}
                className="h-auto w-full max-w-2xl object-contain object-bottom drop-shadow-[0_12px_32px_rgba(15,23,42,0.12)] [max-height:min(52vh,560px)]"
              />
            </div>
            <div className="pointer-events-auto absolute bottom-8 left-8 right-8 z-30">
              <AiConciergeTip description={AI_TIP.description} />
            </div>
          </div>
        }
      />
    </div>
  )
}

export default TripNewStep3Page
