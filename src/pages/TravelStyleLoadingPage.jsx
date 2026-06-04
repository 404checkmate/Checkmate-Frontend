import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TRAVEL_STYLE_QUESTIONS } from '@/data/travelStyleQuestions'
import mascotUrl from '@/assets/trip-progress-mascot.png'

const STEPS = [
  '답변을 분석하고 있어요',
  '여행 성향을 계산 중이에요',
  '추천 여행지를 찾고 있어요',
  '체크리스트를 준비하고 있어요',
]

function calcResult(answers) {
  const scores = { rook: 0, knight: 0, bishop: 0, queen: 0, king: 0, pawn: 0 }
  answers.forEach(({ questionId, optionIndex }) => {
    const q = TRAVEL_STYLE_QUESTIONS.find((q) => q.id === questionId)
    if (!q) return
    const option = q.options[optionIndex]
    if (!option) return
    Object.entries(option.scores).forEach(([key, val]) => {
      scores[key] = (scores[key] || 0) + val
    })
  })
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1
  const normalized = Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, Math.round((v / total) * 100)])
  )
  const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  return { topType, scores: normalized }
}

export default function TravelStyleLoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const answers = location.state?.answers
    if (!answers?.length) {
      navigate('/travel-style-test', { replace: true })
      return
    }

    const result = calcResult(answers)

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
    }, 700)

    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        return p + 2
      })
    }, 50)

    const doneTimer = setTimeout(() => {
      clearInterval(stepTimer)
      clearInterval(progressTimer)
      navigate('/travel-style-test/result', { replace: true, state: { result } })
    }, 2800)

    return () => {
      clearInterval(stepTimer)
      clearInterval(progressTimer)
      clearTimeout(doneTimer)
    }
  }, [navigate, location.state])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.18) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(61, 180, 221, 0.15) 0%, transparent 35%),
          linear-gradient(160deg, #fffbeb 0%, #f0fdfa 100%)
        `,
      }}
    >
      <img
        src={mascotUrl}
        alt="분석 중인 메이트"
        className="mb-6 h-28 w-28 animate-bounce object-contain drop-shadow-lg lg:h-36 lg:w-36"
      />

      <p className="mb-1 text-xs font-bold text-amber-500 tracking-wide">MATE 분석중</p>
      <h2 className="mb-6 text-xl font-extrabold text-[#04384a] lg:text-2xl">
        나만의 여행 스타일 찾는 중…
      </h2>

      {/* 진행률 바 */}
      <div className="mb-6 w-64 lg:w-80">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-teal-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs font-semibold text-teal-600">{progress}%</p>
      </div>

      {/* 단계 메시지 */}
      <ul className="flex flex-col gap-2">
        {STEPS.map((step, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 lg:text-base
              ${idx <= stepIndex ? 'text-teal-700' : 'text-gray-300'}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300
              ${idx <= stepIndex ? 'bg-teal-400' : 'bg-gray-200'}`}
            />
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}
