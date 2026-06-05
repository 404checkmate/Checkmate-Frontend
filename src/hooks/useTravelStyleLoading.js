import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TRAVEL_STYLE_QUESTIONS } from '@/data/travelStyleQuestions'
import { PIECE_TAG_TO_KEY, THEME_TAG_TO_KEY } from '@/data/travelStyleResults'

const STEP_INTERVAL_MS   = 700
const PROGRESS_INTERVAL_MS = 50
const PROGRESS_INCREMENT = 2
const DONE_DELAY_MS      = 2800

// 동점 시 마지막으로 선택한 유형 우선
function pickTop(counts, lastPickedAt) {
  const sorted = Object.entries(counts).sort(
    (a, b) => b[1] - a[1] || (lastPickedAt[b[0]] ?? -1) - (lastPickedAt[a[0]] ?? -1)
  )
  return sorted[0]?.[0] ?? null
}

// A축(체스말)·B축(테마) 각각 선택지 태그 합산 → 최다 유형 (다중 태그는 각 1점)
function calcResult(answers) {
  const pieceCounts = {}
  const themeCounts = {}
  const pieceLast = {}
  const themeLast = {}

  answers.forEach(({ questionId, optionIndex }, idx) => {
    const q = TRAVEL_STYLE_QUESTIONS.find((q) => q.id === questionId)
    const option = q?.options[optionIndex]
    if (!option) return
    const tags = Array.isArray(option.tag) ? option.tag : [option.tag]
    tags.forEach((tag) => {
      if (q.axis === 'A') {
        const key = PIECE_TAG_TO_KEY[tag]
        if (!key) return
        pieceCounts[key] = (pieceCounts[key] || 0) + 1
        pieceLast[key] = idx
      } else {
        const key = THEME_TAG_TO_KEY[tag]
        if (!key) return
        themeCounts[key] = (themeCounts[key] || 0) + 1
        themeLast[key] = idx
      }
    })
  })

  const piece = pickTop(pieceCounts, pieceLast) ?? 'pawn'
  const theme = pickTop(themeCounts, themeLast) ?? 'healing'
  return { piece, theme, topType: piece } // topType: 기존 코드 하위호환
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
      // 쿼리에 결과를 함께 실어 새로고침·링크 공유에도 결과가 유지되도록 함
      navigate(`/travel-style-test/result?r=${result.theme}_${result.piece}`, {
        replace: true,
        state: { result },
      })
    }, DONE_DELAY_MS)

    return () => {
      clearInterval(stepTimer)
      clearInterval(progressTimer)
      clearTimeout(doneTimer)
    }
  }, [navigate, location.state, totalSteps])

  return { stepIndex, progress }
}
