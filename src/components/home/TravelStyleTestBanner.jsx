import { useNavigate } from 'react-router-dom'


export default function TravelStyleTestBanner() {
  const navigate = useNavigate()

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-lg xl:rounded-3xl"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 0% 0%, rgba(251, 191, 36, 0.55) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 100%, rgba(251, 146, 60, 0.45) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 0%, rgba(252, 211, 77, 0.35) 0%, transparent 40%),
          linear-gradient(145deg, #fef3c7 0%, #fde68a 40%, #fcd34d 75%, #fbbf24 100%)
        `,
      }}
    >
      {/* 장식 오브 */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-3xl xl:h-52 xl:w-52" aria-hidden />
      <div className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-amber-300/30 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-16 w-16 rounded-full bg-orange-200/40 blur-xl" aria-hidden />

      {/* 반짝이 장식 */}
      <span className="pointer-events-none absolute right-6 top-4 text-base opacity-40 xl:text-xl" aria-hidden>✦</span>
      <span className="pointer-events-none absolute right-14 top-8 text-xs opacity-30" aria-hidden>✦</span>
      <span className="pointer-events-none absolute left-1/2 bottom-4 text-sm opacity-25" aria-hidden>✦</span>

      <div className="relative z-10 px-5 py-5 lg:px-8 lg:py-6">
        {/* 배지 */}
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
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-amber-950/85 px-4 py-2 text-xs font-bold text-amber-100 shadow-md transition-all hover:bg-amber-900 active:scale-95 lg:mt-4 lg:px-5 lg:py-2.5 lg:text-sm"
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
