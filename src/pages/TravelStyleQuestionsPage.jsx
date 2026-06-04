import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAVEL_STYLE_QUESTIONS } from '@/data/travelStyleQuestions'

const TOTAL = TRAVEL_STYLE_QUESTIONS.length

export default function TravelStyleQuestionsPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)

  const question = TRAVEL_STYLE_QUESTIONS[current]
  const progress = Math.round(((current) / TOTAL) * 100)

  const handleSelect = (optionIndex) => {
    setSelected(optionIndex)
  }

  const handleNext = () => {
    if (selected === null) return
    const newAnswers = [...answers, { questionId: question.id, optionIndex: selected }]

    if (current + 1 >= TOTAL) {
      navigate('/travel-style-test/loading', { state: { answers: newAnswers } })
    } else {
      setAnswers(newAnswers)
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  return (
    <div
      className="min-h-screen flex-1 flex flex-col"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(251, 191, 36, 0.15) 0%, transparent 35%),
          radial-gradient(circle at 90% 90%, rgba(61, 180, 221, 0.12) 0%, transparent 32%),
          linear-gradient(160deg, #fffbeb 0%, #f0fdfa 100%)
        `,
      }}
    >
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col px-4 pb-10 pt-6 lg:px-6 lg:pt-10">

        {/* 진행률 */}
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">{current + 1} / {TOTAL}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-[#3db4dd] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 질문 */}
        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold text-amber-500 tracking-wide">Q{current + 1}</p>
          <h2 className="text-lg font-extrabold leading-snug text-[#04384a] lg:text-2xl break-keep">
            {question.question}
          </h2>

          {/* 선택지 */}
          <ul className="mt-5 flex flex-col gap-3">
            {question.options.map((option, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-all lg:text-base
                    ${selected === idx
                      ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50/50'
                    }`}
                >
                  <span className={`mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold
                    ${selected === idx ? 'border-teal-400 bg-teal-400 text-white' : 'border-gray-300 text-gray-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 다음 버튼 */}
        <button
          type="button"
          onClick={handleNext}
          disabled={selected === null}
          className={`w-full rounded-2xl py-4 text-base font-extrabold transition-all
            ${selected !== null
              ? 'bg-amber-400 text-amber-900 shadow-md shadow-amber-200 hover:bg-amber-500 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {current + 1 === TOTAL ? '결과 보기 →' : '다음 →'}
        </button>

      </div>
    </div>
  )
}
