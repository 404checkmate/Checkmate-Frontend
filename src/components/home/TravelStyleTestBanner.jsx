import { useNavigate } from 'react-router-dom'

const STYLE_TYPES = [
  { key: 'pawn',   label: '폰',   desc: '여유형' },
  { key: 'rook',   label: '룩',   desc: '감성형' },
  { key: 'knight', label: '나이트', desc: '액티브형' },
  { key: 'bishop', label: '비숍',  desc: '문화형' },
  { key: 'queen',  label: '퀸',   desc: '올라운더' },
  { key: 'king',   label: '킹',   desc: '리더형' },
]

export default function TravelStyleTestBanner() {
  const navigate = useNavigate()

  return (
    <section
      className="relative overflow-hidden rounded-2xl px-5 py-5 shadow-md shadow-amber-900/10 lg:px-8 lg:py-6 xl:rounded-3xl"
      style={{
        backgroundImage: `
          radial-gradient(circle at 88% 18%, rgba(251, 191, 36, 0.28) 0%, transparent 42%),
          radial-gradient(circle at 10% 82%, rgba(251, 146, 60, 0.15) 0%, transparent 36%),
          linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fff7ed 100%)
        `,
      }}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-300/25 blur-2xl xl:h-40 xl:w-40" aria-hidden />
      <div className="pointer-events-none absolute -bottom-3 left-1/3 h-16 w-16 rounded-full bg-orange-200/30 blur-xl" aria-hidden />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 lg:text-xs">
          ✨ NEW
        </span>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold leading-tight text-[#04384a] lg:text-xl xl:text-2xl">
              나는 어떤 여행자일까?
            </h2>
            <p className="mt-1 text-[11px] text-gray-500 lg:text-sm break-keep">
              1분 만에 알아보는 여행 스타일 테스트
            </p>

            <button
              type="button"
              onClick={() => navigate('/travel-style-test')}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-amber-900 shadow-sm transition-all hover:bg-amber-500 active:scale-95 lg:mt-4 lg:px-5 lg:py-2.5 lg:text-sm"
            >
              테스트 시작하기
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap justify-end gap-1.5 max-w-[148px] shrink-0 lg:max-w-[210px]">
            {STYLE_TYPES.map((s) => (
              <span
                key={s.key}
                className="rounded-full bg-white/75 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 shadow-sm lg:text-xs"
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
