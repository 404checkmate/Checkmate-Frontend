import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TRAVEL_STYLE_QUESTIONS } from '@/data/travelStyleQuestions'

const STEP_INTERVAL_MS   = 700
const PROGRESS_INTERVAL_MS = 50
const PROGRESS_INCREMENT = 2
const DONE_DELAY_MS      = 2800

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

export function useTravelStyleLoading(totalSteps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress]   = useState(0)

  useEffect(() => {
    const answers = location.state?.answers
    if (!answers?.length) {
      navigate('/travel-style-test', { replace: true })
      return
    }

    const result = calcResult(answers)

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, totalSteps - 1))
    }, STEP_INTERVAL_MS)

    const progressTimer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + PROGRESS_INCREMENT))
    }, PROGRESS_INTERVAL_MS)

    const doneTimer = setTimeout(() => {
      clearInterval(stepTimer)
      clearInterval(progressTimer)
      navigate('/travel-style-test/result', { replace: true, state: { result } })
    }, DONE_DELAY_MS)

    return () => {
      clearInterval(stepTimer)
      clearInterval(progressTimer)
      clearTimeout(doneTimer)
    }
  }, [navigate, location.state, totalSteps])

  return { stepIndex, progress }
}
