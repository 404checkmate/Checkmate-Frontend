/**
 * 보관용 — 활성 새 여행 플로우에서는 사용하지 않습니다.
 * 라우트 `/trips/new/step2`는 유지(직접 URL·복구용). 메인 플로우: `/trips/new/destination` → step4 → step5 (3단계).
 * 모바일/태블릿: TripNewDestinationPage로 리다이렉트.
 */
import { useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { STEP2_CONFIG, OPTION_CARDS } from '@/mocks/tripNewStep2Data'
import StepHeader from '@/components/common/StepHeader'
import { TripNewFlowDesktopPrevBar } from '@/components/trip/TripNewFlowPrevControls'
import { clearActiveTripId } from '@/utils/activeTripIdStorage'

function Step2ChoiceGlyph({ booked, className }) {
  if (booked) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="12" cy="12" r="7.35" fill="none" stroke="currentColor" strokeWidth="2.35" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" />
    </svg>
  )
}

function TripNewStep2Page() {
  const navigate = useNavigate()

  useEffect(() => {
    clearActiveTripId()
  }, [])

  if (window.innerWidth < 768) {
    return <Navigate to="/trips/new/destination" replace />
  }

  const handleCardNavigate = (cardId) => {
    if (cardId === 'notBooked') {
      navigate('/trips/new/destination')
      return
    }
    navigate('/trips/new/step3')
  }

  const pageBgStyle = {
    background: `
      radial-gradient(ellipse 110% 75% at 50% -8%, rgba(165, 243, 252, 0.35), transparent 58%),
      radial-gradient(ellipse 85% 60% at 100% 12%, rgba(204, 251, 241, 0.45), transparent 52%),
      radial-gradient(ellipse 80% 55% at 100% 92%, rgba(167, 243, 208, 0.22), transparent 55%),
      radial-gradient(ellipse 70% 50% at 0% 45%, rgba(236, 253, 245, 0.9), transparent 52%),
      radial-gradient(ellipse 95% 65% at 50% 105%, rgba(207, 250, 254, 0.35), transparent 55%),
      linear-gradient(152deg, #f0fdfa 0%, #ecfeff 18%, #f0fdfa 42%, #eefcf6 68%, #f7fef9 100%)
    `,
  }

  return (
    <div className="min-h-screen" style={pageBgStyle}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <TripNewFlowDesktopPrevBar className="mb-4" align="start" to="/" label="홈으로" />

        <StepHeader
          currentStep={STEP2_CONFIG.currentStep}
          totalSteps={STEP2_CONFIG.totalSteps}
          title={<>항공편 예약을<br />하셨나요?</>}
          className="mb-10"
        />

        <div className="grid grid-cols-2 gap-6 mb-10">
          {OPTION_CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardNavigate(card.id)}
              className="text-left rounded-3xl p-8 bg-white shadow-lg shadow-slate-900/[0.08] ring-1 ring-slate-200/90 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:ring-slate-300/90"
            >
              <div
                className={`mb-16 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ${
                  card.variant === 'primary'
                    ? 'bg-cyan-100 text-teal-700 ring-teal-600/15'
                    : 'bg-teal-700 text-white ring-teal-900/10'
                }`}
              >
                <Step2ChoiceGlyph booked={card.variant === 'primary'} className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">{card.titleDesktop}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.descDesktop}</p>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2024 Aerostatic Editorial. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">개인정보처리방침</button>
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">도움말</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripNewStep2Page
