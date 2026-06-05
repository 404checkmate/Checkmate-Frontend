import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { STYLE_TYPES } from '@/data/travelStyleMeta'
import { trackEvent } from '@/utils/analyticsTracker'
import { ga4Event } from '@/utils/ga4'


/* ─── 카드별 SVG 장식 ─────────────────────────────────────────────── */
const STAR_POSITIONS = [
  // 상단
  { x: 8,  y: 4,  r: 1.5 }, { x: 48, y: 3,  r: 1.8 }, { x: 88, y: 7,  r: 1.0 },
  { x: 25, y: 10, r: 0.8 }, { x: 70, y: 12, r: 1.3 }, { x: 15, y: 18, r: 0.7 },
  // 중상단
  { x: 38, y: 22, r: 1.1 }, { x: 62, y: 20, r: 0.9 }, { x: 92, y: 28, r: 1.4 },
  { x: 5,  y: 32, r: 0.8 }, { x: 55, y: 30, r: 0.6 }, { x: 78, y: 35, r: 1.0 },
  // 중단
  { x: 20, y: 45, r: 1.2 }, { x: 50, y: 42, r: 0.7 }, { x: 85, y: 48, r: 1.0 },
  { x: 35, y: 55, r: 0.8 }, { x: 65, y: 52, r: 1.5 }, { x: 10, y: 58, r: 0.9 },
  // 중하단
  { x: 75, y: 62, r: 1.1 }, { x: 28, y: 65, r: 0.7 }, { x: 55, y: 68, r: 1.3 },
  { x: 90, y: 70, r: 0.8 }, { x: 12, y: 72, r: 1.0 }, { x: 42, y: 75, r: 0.6 },
  // 하단
  { x: 68, y: 80, r: 1.2 }, { x: 22, y: 82, r: 0.9 }, { x: 88, y: 85, r: 1.0 },
  { x: 38, y: 88, r: 0.7 }, { x: 58, y: 92, r: 1.4 }, { x: 8,  y: 90, r: 0.8 },
]

// 카드별 유성 라인 — 각각 4개, 위치 상이
const METEOR_LINES_BY_TYPE = {
  rook:   [
    { x1: 5,  y1: 8,  x2: 38, y2: 24, w: 1.6, white: false },
    { x1: 55, y1: 3,  x2: 82, y2: 17, w: 0.9, white: true  },
    { x1: 12, y1: 52, x2: 45, y2: 68, w: 1.2, white: false },
    { x1: 62, y1: 72, x2: 90, y2: 86, w: 1.0, white: true  },
  ],
  knight: [
    { x1: 2,  y1: 5,  x2: 30, y2: 20, w: 1.8, white: true  },
    { x1: 60, y1: 10, x2: 88, y2: 28, w: 1.0, white: false },
    { x1: 30, y1: 40, x2: 58, y2: 58, w: 1.3, white: true  },
    { x1: 70, y1: 60, x2: 95, y2: 78, w: 0.9, white: false },
  ],
  bishop: [
    { x1: 15, y1: 2,  x2: 48, y2: 18, w: 1.5, white: false },
    { x1: 68, y1: 6,  x2: 92, y2: 22, w: 0.8, white: true  },
    { x1: 5,  y1: 45, x2: 35, y2: 62, w: 1.1, white: false },
    { x1: 48, y1: 68, x2: 78, y2: 84, w: 1.3, white: true  },
  ],
  queen:  [
    { x1: 8,  y1: 12, x2: 40, y2: 28, w: 1.7, white: true  },
    { x1: 52, y1: 2,  x2: 80, y2: 16, w: 1.0, white: false },
    { x1: 18, y1: 55, x2: 50, y2: 70, w: 0.9, white: true  },
    { x1: 65, y1: 75, x2: 92, y2: 90, w: 1.2, white: false },
  ],
  king:   [
    { x1: 3,  y1: 3,  x2: 32, y2: 18, w: 1.6, white: false },
    { x1: 58, y1: 8,  x2: 85, y2: 25, w: 0.9, white: true  },
    { x1: 22, y1: 48, x2: 55, y2: 64, w: 1.3, white: false },
    { x1: 72, y1: 65, x2: 96, y2: 80, w: 1.0, white: true  },
  ],
  pawn:   [
    { x1: 10, y1: 6,  x2: 42, y2: 22, w: 1.4, white: true  },
    { x1: 62, y1: 4,  x2: 90, y2: 20, w: 1.0, white: false },
    { x1: 5,  y1: 58, x2: 38, y2: 74, w: 1.2, white: false },
    { x1: 55, y1: 70, x2: 85, y2: 86, w: 0.8, white: true  },
  ],
}

const SPARKLE_POSITIONS = [[20,7],[75,14],[42,22],[88,6],[10,44],[55,55],[30,68],[80,75],[15,85],[60,90]]

function CardDecoration({ accent, lines }) {
  const id = accent.replace('#', '')
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
      <defs>
        {lines.map((m, i) => (
          <linearGradient key={i} id={`mg${i}-${id}`} x1={`${m.x1}%`} y1={`${m.y1}%`} x2={`${m.x2}%`} y2={`${m.y2}%`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={m.white ? '#ffffff' : accent} stopOpacity="0.7" />
            <stop offset="100%" stopColor={m.white ? '#ffffff' : accent} stopOpacity="0" />
          </linearGradient>
        ))}
        <radialGradient id={`bg-${id}`} cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 배경 글로우 */}
      <ellipse cx="50%" cy="20%" rx="60%" ry="40%" fill={`url(#bg-${id})`} />

      {/* 유성 라인 + 머리 */}
      {lines.map((m, i) => (
        <g key={i}>
          <line x1={`${m.x1}%`} y1={`${m.y1}%`} x2={`${m.x2}%`} y2={`${m.y2}%`}
            stroke={`url(#mg${i}-${id})`} strokeWidth={m.w} />
          <circle cx={`${m.x1}%`} cy={`${m.y1}%`} r="1.1"
            fill={m.white ? '#ffffff' : accent} opacity="0.85" />
        </g>
      ))}

      {/* 별 */}
      {STAR_POSITIONS.map((s, i) => (
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r}
          fill={i % 4 === 0 ? accent : 'white'}
          opacity={0.45 + (i % 5) * 0.1} />
      ))}

      {/* 반짝이 십자 별 */}
      {SPARKLE_POSITIONS.map(([x, y], i) => (
        <g key={i}>
          <line x1={`${x-1.5}%`} y1={`${y}%`} x2={`${x+1.5}%`} y2={`${y}%`} stroke={accent} strokeWidth="0.6" opacity="0.7" />
          <line x1={`${x}%`} y1={`${y-1.5}%`} x2={`${x}%`} y2={`${y+1.5}%`} stroke={accent} strokeWidth="0.6" opacity="0.7" />
          <circle cx={`${x}%`} cy={`${y}%`} r="0.9" fill="white" opacity="0.9" />
        </g>
      ))}
    </svg>
  )
}

// 위치별 스케일·z-index: [-3, -2, -1, 0, 1, 2, 3]  (±3은 화면 밖 대기)
const POS_SCALE   = [0.58, 0.70, 0.84, 1.00, 0.84, 0.70, 0.58]
const POS_ZINDEX  = [0,    1,    4,    10,   4,    1,    0   ]
const VISIBLE_POS = [-3, -2, -1, 0, 1, 2, 3]

// 카드 너비 30% of container, 스텝 17.5% of container
const CARD_W = 0.30
const HALF   = CARD_W / 2  // 0.15

// 시각적 edge-to-edge 간격을 동일하게 하기 위한 비균일 step 계산
// visual_gap = step - HALF*(s_i + s_j) = 일정 → step 마다 다름
// target gap ≈ -1.3% (약간 겹쳐서 자연스러운 3D 느낌)
const GAP_TARGET = -0.013
const STEP_0_1 = GAP_TARGET + HALF * (POS_SCALE[3] + POS_SCALE[4])  // center→±1
const STEP_1_2 = GAP_TARGET + HALF * (POS_SCALE[4] + POS_SCALE[5])  // ±1→±2
const STEP_2_3 = GAP_TARGET + HALF * (POS_SCALE[5] + POS_SCALE[6])  // ±2→±3

// relPos별 x 위치 (컨테이너 비율)
const REL_X = {
  0:  0.50,
  1:  0.50 + STEP_0_1,
  2:  0.50 + STEP_0_1 + STEP_1_2,
  3:  0.50 + STEP_0_1 + STEP_1_2 + STEP_2_3,
  '-1': 0.50 - STEP_0_1,
  '-2': 0.50 - STEP_0_1 - STEP_1_2,
  '-3': 0.50 - STEP_0_1 - STEP_1_2 - STEP_2_3,
}

/* ─── 커스텀 훅 ──────────────────────────────────────────────────── */
function useCarousel3D(total, interval = 1500) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total)
    }, interval)
    return () => clearInterval(timer)
  }, [total, interval])

  return activeIndex
}

/* ─── 타로 카드 단일 컴포넌트 ───────────────────────────────────── */
function TarotCard({ type }) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b shadow-xl ${type.cardBg}`}
    >
      <CardDecoration accent={type.cardAccent} lines={METEOR_LINES_BY_TYPE[type.key]} />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: `inset 0 0 0 2px ${type.cardAccent}99, inset 0 0 0 5px #00000040, inset 0 0 0 7px ${type.cardAccent}55` }}
      />
      {['top-2.5 left-2.5','top-2.5 right-2.5','bottom-9 left-2.5','bottom-9 right-2.5'].map((pos) => (
        <span key={pos} className={`pointer-events-none absolute ${pos} text-[11px] lg:text-sm`}
          style={{ color: type.cardAccent, opacity: 0.7 }}>✦</span>
      ))}
      <div className="flex h-[76%] items-center justify-center p-4">
        <img src={type.imgSrc} alt={type.label} className="relative z-10 h-full w-full object-contain drop-shadow-2xl" />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2"
        style={{ borderTop: `1px solid ${type.cardAccent}40`, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      >
        <p className="text-[11px] font-extrabold tracking-widest lg:text-xs" style={{ color: type.cardAccent }}>
          {type.label.toUpperCase()}
        </p>
      </div>
    </div>
  )
}

/* ─── 페이지 ─────────────────────────────────────────────────────── */
export default function TravelStyleTestPage() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const activeIndex = useCarousel3D(STYLE_TYPES.length, 1500)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // 퍼널 1단계: 테스트 소개 페이지 진입
  useEffect(() => {
    trackEvent('travel_test_landing_viewed', { page: 'travel_style_test' })
  }, [])

  const handleStart = () => {
    trackEvent('travel_test_started', { button: 'travel_test_start' })
    ga4Event('travel_test_started')
    navigate('/travel-style-test/questions')
  }

  const cardWidth  = containerWidth * CARD_W
  const cardHeight = cardWidth * 1.5  // 2:3 비율

  return (
    <div
      className="min-h-screen flex-1"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 12%, rgba(251,191,36,0.2) 0%, transparent 38%),
          radial-gradient(circle at 90% 8%, rgba(61,180,221,0.15) 0%, transparent 32%),
          radial-gradient(circle at 15% 80%, rgba(251,146,60,0.12) 0%, transparent 30%),
          linear-gradient(160deg, #fffbeb 0%, #f0fdfa 55%, #fef3c7 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-8 lg:px-6 lg:pt-32 xl:max-w-3xl">

        {/* 타이틀 */}
        <section className="flex flex-col items-center text-center">
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">
            ✨ 여행 스타일 테스트
          </span>
          <h1 className="text-2xl font-extrabold leading-tight text-[#04384a] lg:text-3xl xl:text-4xl">
            나는 여행에서<br />어떤 유형일까?
          </h1>
          <p className="mt-2 text-sm text-gray-500 lg:text-base break-keep">
            6개의 여행 유형을 바탕으로<br />54가지의 여행스타일을 테스트해보세요
          </p>
        </section>

        {/* 3D 캐러셀 */}
        <section className="mt-8 lg:mt-10">
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ height: cardHeight > 0 ? cardHeight + 'px' : '240px' }}
          >
            {/* 양 끝 페이드 오버레이 */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[18%]"
              style={{ background: 'linear-gradient(to right, #fef9eb 0%, transparent 100%)' }} />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[18%]"
              style={{ background: 'linear-gradient(to left, #fef9eb 0%, transparent 100%)' }} />

            {containerWidth > 0 && VISIBLE_POS.map((relPos, i) => {
              const cardIdx = ((activeIndex + relPos) % STYLE_TYPES.length + STYLE_TYPES.length) % STYLE_TYPES.length
              const scale   = POS_SCALE[i]
              const xCenter = containerWidth * REL_X[relPos]
              const left    = xCenter - cardWidth / 2

              return (
                <div
                  key={`card-${cardIdx}`}
                  style={{
                    position:   'absolute',
                    left:       left + 'px',
                    top:        '50%',
                    width:      cardWidth + 'px',
                    height:     cardHeight + 'px',
                    transform:  `translateY(-50%) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1)',
                    zIndex:     POS_ZINDEX[i],
                  }}
                >
                  <TarotCard type={STYLE_TYPES[cardIdx]} />
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 flex flex-col items-center gap-3 lg:mt-10">
          <button
            type="button"
            onClick={handleStart}
            className="w-full max-w-sm rounded-2xl bg-amber-400 py-4 text-base font-extrabold text-amber-900 shadow-md shadow-amber-200 transition-all hover:bg-amber-500 active:scale-95 lg:text-lg"
          >
            테스트 시작하기 →
          </button>
          <p className="text-xs text-gray-400">약 1분 소요 · 로그인 불필요</p>
        </section>

      </div>
    </div>
  )
}
