import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { generateChecklist, getGenerateStatus, generateChecklistFromContext } from '@/api/checklists'
import { loadActiveTripPlan } from '@/utils/tripPlanContextStorage'
import { buildContextInputFromPlan } from '@/utils/tripSearchUtils'
import { trackEvent } from '@/utils/analyticsTracker'
import BrandLogo from '@/components/common/BrandLogo'
import StepProgressBarMascot from '@/components/common/StepProgressBarMascot'
import {
  LOADING_VARIANTS,
  TIPS,
  BLUR_ORBS,
} from '@/mocks/loadingData'
import loadingWordMatePng from '@/assets/loading-word-mate-user-latest.png'
import loadingWordChecklistPng from '@/assets/loading-word-checklist-user-latest.png'

/* ─────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────── */
function TripLoadingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [generateError, setGenerateError] = useState(false)

  /** 이 페이지 방문당 1회만 고정 (진행률과 무관하게 문구 변경 없음) */
  const variantIndex = useMemo(
    () => Math.floor(Math.random() * LOADING_VARIANTS.length),
    []
  )
  const tipIndex = useMemo(() => Math.floor(Math.random() * TIPS.length), [])

  const v = LOADING_VARIANTS[variantIndex]

  // /trips/guest/loading 은 static 라우트라 useParams().id === undefined
  const isGuest = location.pathname === '/trips/guest/loading'

  /* progress 애니메이션 + generateChecklist 병렬 실행 — 둘 다 완료 시 이동 */
  useEffect(() => {
    if (!id && !isGuest) {
      navigate('/trips/new/destination', { replace: true })
      return
    }

    // guest 흐름: generateChecklistFromContext를 애니메이션과 병렬 실행 후 이동
    if (isGuest) {
      // curationSave 흐름은 templates를 직접 구성하므로 generate 불필요
      const hasCuration = !!sessionStorage.getItem('curationSave')

      if (hasCuration) {
        const interval = setInterval(() => {
          setProgress((prev) => {
            const next = prev + (prev < 70 ? 1.2 : 0.7)
            if (next >= 100) {
              clearInterval(interval)
              setProgress(100)
              setTimeout(() => {
                navigate('/trips/guest/search', { state: location.state, replace: true })
              }, 600)
            }
            return Math.min(next, 100)
          })
        }, 50)
        return () => clearInterval(interval)
      }

      let cancelled = false
      let progressDone = false
      let generateDone = false
      let generatedData = null

      const tryNavigate = () => {
        if (progressDone && generateDone) {
          navigate('/trips/guest/search', {
            state: { ...location.state, prefetchedItems: generatedData },
            replace: true,
          })
        }
      }

      const interval = setInterval(() => {
        setProgress((prev) => {
          const cap = generateDone ? 100 : 95
          const speed = prev < 70 ? 1.2 : prev < 90 ? 0.7 : 0.15
          const next = Math.min(prev + speed, cap)
          if (next >= 100) {
            clearInterval(interval)
            setTimeout(() => { progressDone = true; tryNavigate() }, 600)
          }
          return next
        })
      }, 50)

      const runGuestGenerate = async () => {
        try {
          const plan = loadActiveTripPlan()
          const contextInput = buildContextInputFromPlan(plan)
          if (contextInput) {
            const data = await generateChecklistFromContext(contextInput)
            if (!cancelled) generatedData = data
          }
        } catch {
          // 실패 시 prefetch 없이 이동 — guest/search에서 자체 재시도
        } finally {
          if (!cancelled) { generateDone = true; tryNavigate() }
        }
      }

      runGuestGenerate()
      return () => { clearInterval(interval); cancelled = true }
    }

    let cancelled = false
    let progressDone = false
    let generateDone = false

    const tryNavigate = () => {
      if (progressDone && generateDone) {
        trackEvent('travel_fixed', { trip_id: id })
        navigate(`/trips/${id}/search`)
      }
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        // 95% 이후로는 generateDone 될 때까지 천천히 대기
        const cap = generateDone ? 100 : 95
        const speed = prev < 70 ? 1.2 : prev < 90 ? 0.7 : 0.15
        const next = Math.min(prev + speed, cap)
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => { progressDone = true; tryNavigate() }, 600)
        }
        return next
      })
    }, 50)

    const runGenerate = async () => {
      try {
        await generateChecklist(id)  // 202: 백그라운드 생성 트리거
        // 생성 완료까지 폴링 (최대 32s, 2s 간격)
        const MAX_WAIT = 32000
        const POLL_MS = 2000
        const started = Date.now()
        while (!cancelled && Date.now() - started < MAX_WAIT) {
          await new Promise((r) => setTimeout(r, POLL_MS))
          if (cancelled) break
          try {
            const status = await getGenerateStatus(id)
            if (status?.status === 'completed') break
          } catch {
            break
          }
        }
      } catch (err) {
        console.error('[TripLoadingPage] generate 실패:', err)
        setGenerateError(true)
      } finally {
        if (!cancelled) { generateDone = true; tryNavigate() }
      }
    }

    runGenerate()

    return () => { clearInterval(interval); cancelled = true }
  }, [id, isGuest, navigate, location.state])

  const pct = Math.round(progress)

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none">

      {/* ── 배경 ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 30%, #E0F2FE 70%, #F0F9FF 100%)' }}
      />
      {/* 블러 오브 */}
      {BLUR_ORBS.map((orb) => (
        <div
          key={orb.id}
          className="absolute pointer-events-none"
          style={{
            width: orb.width,
            height: orb.height,
            top: orb.top,
            right: orb.right,
            bottom: orb.bottom,
            left: orb.left,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur})`,
          }}
        />
      ))}
      {/* ══════════════════════════════════
          본문 컨텐츠 (relative z-10)
      ══════════════════════════════════ */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6 text-center">

        {/* 마스코트 (public/loading-mascot.png) — 배경 박스 없이 이미지만 */}
        <div className="mb-5 md:mb-7">
          <img
            src="/loading-mascot.png"
            alt=""
            className="mx-auto h-44 w-auto max-w-[min(100%,16rem)] object-contain object-center sm:h-48 md:h-56 md:max-w-[22rem]"
            draggable={false}
          />
        </div>

        {/* 고정 카피 — 워드마크 PNG + 한글 (예시 레이아웃과 동일: 한 줄·줄바꿈 시 가운데 정렬) */}
        <div
          className="mb-6 w-full max-w-xl px-1 text-center text-[15px] font-semibold leading-snug text-gray-900 sm:text-base md:mb-8 md:text-lg"
          role="status"
          aria-label="MATE가 맞춤 CHECK LIST를 준비하고 있어요!"
        >
          <div className="inline-flex w-full items-end justify-center gap-0 whitespace-nowrap">
            <img
              src={loadingWordMatePng}
              alt=""
              className="inline-block h-7 w-auto max-w-[4.75rem] object-contain object-bottom sm:h-8 md:h-9 md:max-w-[5.75rem]"
              draggable={false}
              aria-hidden
            />
            <span className="whitespace-nowrap">가 맞춤</span>
            <img
              src={loadingWordChecklistPng}
              alt=""
              className="inline-block h-7 w-auto max-w-[9rem] object-contain object-bottom sm:h-8 sm:max-w-[10.5rem] md:h-9 md:max-w-[12.5rem]"
              draggable={false}
              aria-hidden
            />
            <span className="whitespace-nowrap">를</span>
          </div>
          <p className="mt-2 whitespace-nowrap text-center">준비하고 있어요!</p>
        </div>

        {/* 분석 카드 */}
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-md px-5 py-5 mb-6 md:mb-8 text-left">
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-800 mb-0.5">{v.cardLabel}</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="hidden md:inline">{v.descDesktop}</span>
              <span className="md:hidden">{v.descMobile}</span>
            </p>
          </div>

          {/* 진행률 바 + 스텝 플로우와 동일 마스코트(채움 끝 = 현재 %) */}
          <StepProgressBarMascot
            percent={pct}
            className="mb-3 w-full"
            trackClassName="bg-gray-100"
            fillClassName=""
            fillStyle={{
              background: 'linear-gradient(to right, #06B6D4, #22C55E, #EAB308)',
            }}
            fillTransitionClassName="transition-all duration-150 ease-linear"
            mascotTransitionClassName="transition-[left] duration-150 ease-linear"
            barHeightClass="h-2"
          />

          {/* 레이블 + % */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {v.barLabel}
            </span>
            <span className="text-sm font-extrabold text-cyan-500">{pct}%</span>
          </div>
        </div>

        {/* 체크리스트 생성 실패 알림 — 진행은 막지 않음 (finally로 tryNavigate 실행) */}
        {generateError && (
          <div className="w-full mb-4 rounded-2xl border border-red-100 bg-white/90 px-5 py-3 text-center text-sm text-red-500 shadow-sm">
            체크리스트 생성에 실패했습니다.
            <button
              type="button"
              onClick={() => navigate(`/trips/${id}/search`)}
              className="ml-2 underline underline-offset-2"
            >
              계속 진행
            </button>
          </div>
        )}

        {/* TIP 영역 */}
        {/* 데스크탑: 황색 pill */}
        <div className="hidden md:flex items-center gap-2 bg-amber-400 text-amber-900 text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm">
          <span className="text-amber-700 font-extrabold tracking-widest">MATE TIP</span>
          <span className="text-amber-800/60">·</span>
          {TIPS[tipIndex]}
        </div>

        {/* 모바일: MATE TIP 카드 */}
        <div className="md:hidden w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-4 py-4 text-left flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-extrabold tracking-tight text-amber-900 leading-none text-center">MATE<br/>TIP</span>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-amber-500 uppercase mb-1">
              MATE TIP
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">{TIPS[tipIndex]}</p>
          </div>
        </div>

      </div>

      {/* ── 하단 브랜딩 (데스크탑만) ── */}
      <div className="absolute bottom-8 hidden md:flex flex-col items-center z-10">
        <BrandLogo className="h-5 w-auto opacity-95" />
      </div>

    </div>
  )
}

export default TripLoadingPage
