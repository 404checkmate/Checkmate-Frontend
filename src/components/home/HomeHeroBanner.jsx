import mascotLuggageUrl from '@/assets/carryonmay.png'

export default function HomeHeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-[#3db4dd] px-5 py-5 shadow-md shadow-teal-900/15 lg:px-8 lg:py-8 xl:rounded-3xl xl:px-12 xl:py-10">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl xl:h-56 xl:w-56 xl:-right-12 xl:-top-12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-4 left-1/3 h-20 w-20 rounded-full bg-amber-300/20 blur-2xl xl:h-40 xl:w-40"
        aria-hidden
      />
      <div className="relative z-10 flex items-end justify-between">
        <div>
          <p className="hero-text-1 text-xs font-semibold text-teal-100 lg:text-sm xl:text-base">설레는 여행 준비 ✨</p>
          <h1 className="hero-text-2 mt-1 text-xl font-extrabold leading-tight text-white lg:text-3xl xl:text-4xl xl:mt-2">
            떠나기 전, 놓치는 건 없도록
          </h1>
          <p className="hero-text-3 mt-1 text-[11px] font-medium text-teal-100/80 lg:mt-2 lg:text-sm xl:text-base xl:mt-3">
            여행 준비 리스트를 빠짐없이 함께 체크해요
          </p>
        </div>
        <div className="hero-mascot-slide shrink-0">
          <img
            src={mascotLuggageUrl}
            alt="여행 가방을 든 메이트 마스코트"
            className="hero-mascot-bob h-28 w-28 object-contain drop-shadow-md lg:h-40 lg:w-40 xl:h-52 xl:w-52"
          />
        </div>
      </div>
    </div>
  )
}
