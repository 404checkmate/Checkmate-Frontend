import { useNavigate } from 'react-router-dom'

/* ─── 체스 기물 SVG 컴포넌트 ─────────────────────────────────────────── */
// 각 기물: 20×26 artboard 기준

function King() {
  return (
    <g>
      {/* 십자가 */}
      <rect x="8.5" y="0" width="3" height="7" rx="1"/>
      <rect x="5.5" y="2.5" width="9" height="3" rx="1"/>
      {/* 머리 구체 */}
      <circle cx="10" cy="9.5" r="3"/>
      {/* 목 */}
      <rect x="8.5" y="12" width="3" height="2" rx="0.5"/>
      {/* 어깨+몸통 */}
      <path d="M3,14 Q10,18 17,14 L17.5,23 H2.5 Z"/>
      {/* 기반 */}
      <rect x="1" y="23" width="18" height="3" rx="1.2"/>
    </g>
  )
}

function Queen() {
  return (
    <g>
      {/* 왕관 꼭지 5개 */}
      <circle cx="10" cy="1.5" r="1.5"/>
      <circle cx="5"  cy="3.5" r="1.3"/>
      <circle cx="15" cy="3.5" r="1.3"/>
      <circle cx="2"  cy="6"   r="1.1"/>
      <circle cx="18" cy="6"   r="1.1"/>
      {/* 왕관 몸체 */}
      <path d="M1,8 L3.5,20 H16.5 L19,8 L15,12 L12,6 L10,10 L8,6 L5,12 Z"/>
      {/* 기반 */}
      <rect x="1" y="20" width="18" height="3" rx="1.2"/>
    </g>
  )
}

function Bishop() {
  return (
    <g>
      {/* 상단 구체 */}
      <circle cx="10" cy="2" r="2"/>
      {/* 뾰족한 머리 */}
      <ellipse cx="10" cy="7.5" rx="3.5" ry="5.5"/>
      {/* 어깨 칼라 */}
      <ellipse cx="10" cy="13" rx="6" ry="2"/>
      {/* 몸통 */}
      <path d="M4.5,15 L4,23 H16 L15.5,15 Z"/>
      {/* 기반 */}
      <rect x="1" y="23" width="18" height="3" rx="1.2"/>
    </g>
  )
}

function Rook() {
  return (
    <g>
      {/* 흉벽 3개 */}
      <rect x="1"   y="0" width="5.5" height="7" rx="0.8"/>
      <rect x="7.5" y="0" width="5"   height="7" rx="0.8"/>
      <rect x="13.5" y="0" width="5.5" height="7" rx="0.8"/>
      {/* 흉벽 연결 */}
      <rect x="3" y="7" width="14" height="2"/>
      {/* 탑 몸통 */}
      <rect x="4" y="9" width="12" height="13" rx="0.5"/>
      {/* 기반 */}
      <rect x="1" y="22" width="18" height="3" rx="1.2"/>
    </g>
  )
}

function Knight() {
  return (
    <g>
      {/* 말 머리+목 실루엣 (오른쪽 방향) */}
      <path d="
        M 5,25
        L 5,17
        C 3,14 3,11 4,8
        C 5,5 7,2 10,2
        C 12,2 14,3 15,5
        L 17,4
        C 18,5 18,7 17,8
        L 15,9
        C 17,11 17,14 16,17
        L 15,25 Z
      "/>
      {/* 눈 */}
      <circle cx="13" cy="6.5" r="1.2" fill="rgba(254,243,199,0.55)"/>
      {/* 콧구멍 */}
      <circle cx="16.5" cy="8.5" r="0.7" fill="rgba(254,243,199,0.3)"/>
      {/* 기반 */}
      <rect x="3" y="25" width="14" height="3" rx="1.2"/>
    </g>
  )
}

function Pawn() {
  return (
    <g>
      {/* 머리 구체 */}
      <circle cx="10" cy="5" r="4.5"/>
      {/* 목 */}
      <rect x="8.5" y="9" width="3" height="2.5" rx="0.5"/>
      {/* 어깨 확장 */}
      <ellipse cx="10" cy="12" rx="5" ry="1.8"/>
      {/* 몸통 */}
      <path d="M5,13.5 L4,23 H16 L15,13.5 Z"/>
      {/* 기반 */}
      <rect x="2" y="23" width="16" height="3" rx="1.2"/>
    </g>
  )
}

/* ─── 체스 장식 SVG ────────────────────────────────────────────────── */
function ChessDecoration() {
  const pc = 'rgba(120,53,15,'
  return (
    <svg
      viewBox="0 0 200 110"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="cb" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="rgba(120,53,15,0.10)"/>
          <rect x="9" y="9" width="9" height="9" fill="rgba(120,53,15,0.10)"/>
        </pattern>
        <linearGradient id="lf" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="#fde68a" stopOpacity="1"/>
          <stop offset="42%" stopColor="#fde68a" stopOpacity="0"/>
        </linearGradient>
        <filter id="sh1" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="2" dy="3.5" stdDeviation="3" floodColor="#78350f" floodOpacity="0.50"/>
        </filter>
        <filter id="sh2" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.2" floodColor="#78350f" floodOpacity="0.38"/>
        </filter>
        <filter id="sh3" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.8" floodColor="#78350f" floodOpacity="0.28"/>
        </filter>
      </defs>

      {/* 체스판 */}
      <rect width="200" height="110" fill="url(#cb)"/>
      {/* 왼쪽 페이드 */}
      <rect width="200" height="110" fill="url(#lf)"/>

      {/* ── 킹 — 중앙 크게 ── */}
      <g transform="translate(88,4) scale(1.85)" filter="url(#sh1)" fill={`${pc}0.65)`}>
        <King/>
      </g>

      {/* ── 퀸 — 오른쪽 위 ── */}
      <g transform="translate(145,8) scale(1.38)" filter="url(#sh1)" fill={`${pc}0.55)`}>
        <Queen/>
      </g>

      {/* ── 나이트 — 킹 왼쪽 위 ── */}
      <g transform="translate(62,5) scale(1.30)" filter="url(#sh2)" fill={`${pc}0.42)`}>
        <Knight/>
      </g>

      {/* ── 비숍 — 오른쪽 하단 ── */}
      <g transform="translate(150,55) scale(1.18)" filter="url(#sh2)" fill={`${pc}0.38)`}>
        <Bishop/>
      </g>

      {/* ── 룩 — 왼쪽 하단 ── */}
      <g transform="translate(58,52) scale(1.22)" filter="url(#sh2)" fill={`${pc}0.36)`}>
        <Rook/>
      </g>

      {/* ── 폰 1 ── */}
      <g transform="translate(112,52) scale(1.05)" filter="url(#sh3)" fill={`${pc}0.30)`}>
        <Pawn/>
      </g>

    </svg>
  )
}

/* ─── 배너 ──────────────────────────────────────────────────────────── */
export default function TravelStyleTestBanner() {
  const navigate = useNavigate()

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-lg xl:rounded-3xl"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 0% 0%, rgba(251,191,36,0.55) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 100%, rgba(251,146,60,0.45) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 0%, rgba(252,211,77,0.35) 0%, transparent 40%),
          linear-gradient(145deg, #fef3c7 0%, #fde68a 40%, #fcd34d 75%, #fbbf24 100%)
        `,
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-3xl xl:h-52 xl:w-52" aria-hidden/>
      <div className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-amber-300/30 blur-2xl" aria-hidden/>

      <ChessDecoration/>

      <div className="relative z-10 px-5 py-5 lg:px-8 lg:py-6">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 backdrop-blur-sm lg:text-xs">
          ✨ 여행 스타일 테스트
        </span>

        <div className="mt-2.5">
          <h2 className="text-[17px] font-extrabold leading-snug text-amber-950 lg:text-xl xl:text-2xl break-keep">
            나는 어떤 여행자일까?
          </h2>
          <p className="mt-1 text-[11px] font-medium text-amber-800/70 lg:text-sm break-keep">
            1분 만에 알아보는 나만의 여행 스타일
          </p>
          <button
            type="button"
            onClick={() => navigate('/travel-style-test')}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-amber-800 shadow-sm transition-all hover:bg-white/90 hover:text-amber-900 active:scale-95 lg:mt-4 lg:px-5 lg:py-2.5 lg:text-sm"
          >
            테스트 시작하기
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
