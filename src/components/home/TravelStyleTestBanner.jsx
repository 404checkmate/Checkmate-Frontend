import { useNavigate } from 'react-router-dom'
import { STYLE_TYPES } from '@/data/travelStyleMeta'

/* ─── 배경: 체커보드 패턴 ───────────────────────────────────────────── */
function CheckerboardDecoration() {
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
          <rect width="9" height="9" fill="rgba(120,53,15,0.10)" />
          <rect x="9" y="9" width="9" height="9" fill="rgba(120,53,15,0.10)" />
        </pattern>
        <linearGradient id="lf" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="1" />
          <stop offset="42%" stopColor="#fde68a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="110" fill="url(#cb)" />
      <rect width="200" height="110" fill="url(#lf)" />
    </svg>
  )
}

/* ─── 미니 타로 카드 (테스트 페이지 TarotCard 축소판) ──────────────── */
function MiniTarotCard({ type }) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-b shadow-lg ${type.cardBg} lg:rounded-xl`}>
      {/* 테두리 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg lg:rounded-xl"
        style={{ boxShadow: `inset 0 0 0 1.5px ${type.cardAccent}99, inset 0 0 0 3px #00000040` }}
      />
      {/* 스파클 */}
      <span className="pointer-events-none absolute left-1 top-1 text-[7px] lg:text-[9px]" style={{ color: type.cardAccent, opacity: 0.7 }}>✦</span>
      <span className="pointer-events-none absolute right-1 top-3 text-[5px] lg:text-[7px]" style={{ color: type.cardAccent, opacity: 0.5 }}>✦</span>
      {/* 캐릭터 */}
      <div className="flex h-[78%] items-center justify-center p-1.5 lg:p-2">
        <img src={type.imgSrc} alt={type.label} className="h-full w-full object-contain drop-shadow-md" draggable={false} />
      </div>
      {/* 라벨 */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-0.5 lg:py-1"
        style={{ borderTop: `1px solid ${type.cardAccent}40`, background: 'rgba(0,0,0,0.35)' }}
      >
        <p className="text-[6px] font-extrabold tracking-widest lg:text-[8px]" style={{ color: type.cardAccent }}>
          {type.label}
        </p>
      </div>
    </div>
  )
}

/* ─── 카드 세로 스크롤 (2컬럼 마퀴) ───────────────────────────────── */
// 컬럼 내용을 2번 렌더 + translateY(-50%) 루프 → 끊김 없는 무한 스크롤
function ScrollColumn({ types, direction, duration, delay }) {
  const items = [...types, ...types]
  return (
    <div className="h-full overflow-hidden">
      <div
        className={`flex flex-col gap-2 lg:gap-2.5 ${direction === 'down' ? 'tst-col-down' : 'tst-col-up'}`}
        style={{ '--col-duration': duration, animationDelay: delay }}
      >
        {items.map((type, i) => (
          <div key={`${type.key}-${i}`} className="h-[84px] w-14 shrink-0 lg:h-[120px] lg:w-20">
            <MiniTarotCard type={type} />
          </div>
        ))}
      </div>
    </div>
  )
}

const SCROLLER_MASK = {
  maskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
}

function CardScroller() {
  return (
    <>
      {/* 모바일: 2컬럼 */}
      <div
        className="pointer-events-none absolute inset-y-0 right-3 z-[5] flex gap-2 sm:right-6 lg:hidden"
        style={SCROLLER_MASK}
        aria-hidden
      >
        <ScrollColumn types={STYLE_TYPES.slice(0, 3)} direction="up" duration="20s" delay="0s" />
        <ScrollColumn types={STYLE_TYPES.slice(3, 6)} direction="down" duration="26s" delay="-8s" />
      </div>

      {/* 데스크탑: 3컬럼 — 오른쪽 끝에서 살짝 안쪽으로 배치 */}
      <div
        className="pointer-events-none absolute inset-y-0 z-[5] hidden gap-2.5 lg:right-20 lg:flex xl:right-28"
        style={SCROLLER_MASK}
        aria-hidden
      >
        <ScrollColumn types={STYLE_TYPES.slice(0, 2)} direction="up" duration="22s" delay="0s" />
        <ScrollColumn types={STYLE_TYPES.slice(2, 4)} direction="down" duration="27s" delay="-9s" />
        <ScrollColumn types={STYLE_TYPES.slice(4, 6)} direction="up" duration="24s" delay="-15s" />
      </div>
    </>
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
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-3xl xl:h-52 xl:w-52" aria-hidden />
      <div className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-amber-300/30 blur-2xl" aria-hidden />

      <CheckerboardDecoration />
      <CardScroller />

      <div className="relative z-10 px-5 py-5 pr-40 lg:px-8 lg:py-6 lg:pr-96">
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
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
