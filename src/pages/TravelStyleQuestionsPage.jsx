import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAVEL_STYLE_QUESTIONS } from '@/data/travelStyleQuestions'

const TOTAL = TRAVEL_STYLE_QUESTIONS.length

function renderText(text) {
  return text.split('\n').map((part, i, arr) => (
    <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
  ))
}

function OptionButton({ option, index, isSelected, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all active:scale-[0.98]
          ${isSelected
            ? 'border-[#3db4dd] bg-[#3db4dd]/10'
            : 'border-gray-200 bg-white/80 hover:border-[#3db4dd]/40 hover:bg-[#3db4dd]/5'
          }`}
      >
        <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-all
          ${isSelected ? 'bg-[#3db4dd] text-white' : 'bg-gray-100 text-gray-400'}`}>
          {String.fromCharCode(65 + index)}
        </span>
        <span className={`flex-1 text-[13px] font-semibold leading-snug break-keep lg:text-sm
          ${isSelected ? 'text-[#0f5762]' : 'text-gray-600'}`}>
          {renderText(option.label)}
        </span>
      </button>
    </li>
  )
}


export default function TravelStyleQuestionsPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)

  const question = TRAVEL_STYLE_QUESTIONS[current]
  const progress = Math.round((current / TOTAL) * 100)

  const handleSelect = (optionIndex) => setSelected(optionIndex)

  const handleBack = () => {
    if (current === 0) {
      navigate('/travel-style-test')
      return
    }
    const prevAnswers = answers.slice(0, -1)
    const prevSelected = answers[answers.length - 1]?.optionIndex ?? null
    setAnswers(prevAnswers)
    setCurrent((c) => c - 1)
    setSelected(prevSelected)
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
          radial-gradient(circle at 10% 10%, rgba(251,191,36,0.15) 0%, transparent 35%),
          radial-gradient(circle at 90% 90%, rgba(61,180,221,0.12) 0%, transparent 32%),
          linear-gradient(160deg, #fffbeb 0%, #f0fdfa 100%)
        `,
      }}
    >
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col px-4 pb-10 pt-6 lg:px-6 lg:pt-10">

        {/* 진행률 바 */}
        <div className="mb-7 lg:mt-20">
          <div className="mb-1.5 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 transition-colors hover:text-gray-600 active:scale-95"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
              {current === 0 ? '처음으로' : '이전'}
            </button>
            <span className="text-[11px] font-semibold text-gray-400">{current + 1} / {TOTAL}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-teal-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 질문 영역 */}
        <div className="mb-5">
          {/* Q넘버 배지 */}
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-600 lg:text-xs">
            Q{current + 1}
          </span>

          {/* 메인 타이틀 */}
          <h2 className="mt-2 text-[19px] font-extrabold leading-snug text-[#04384a] lg:text-2xl break-keep">
            {/* 모바일: question, 데스크탑: questionDesktop(줄바꿈 적용) */}
            <span className="lg:hidden">{question.title ?? question.question}</span>
            <span className="hidden lg:inline">
              {renderText(question.questionDesktop ?? question.title ?? question.question)}
            </span>
          </h2>

          {/* 서브 상세 질문 — title 있을 때만 */}
          {question.title && (
            <p className="mt-2 text-[12px] font-medium leading-relaxed text-gray-500 lg:text-sm break-keep">
              {question.question}
            </p>
          )}
        </div>

        {/* 선택지 */}
        <ul className="mb-5 flex flex-col gap-2">
          {question.options.map((option, idx) => (
            <OptionButton
              key={idx}
              option={option}
              index={idx}
              isSelected={selected === idx}
              onClick={() => handleSelect(idx)}
            />
          ))}
        </ul>

        {/* 다음 버튼 */}
        <button
          type="button"
          onClick={handleNext}
          disabled={selected === null}
          className={`w-full rounded-2xl py-3.5 text-sm font-extrabold transition-all lg:text-base
            ${selected !== null
              ? 'bg-amber-400 text-amber-900 shadow-md shadow-amber-200 hover:bg-amber-500 active:scale-95'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
        >
          {current + 1 === TOTAL ? '결과 보기 →' : '다음 →'}
        </button>

      </div>
    </div>
  )
}
