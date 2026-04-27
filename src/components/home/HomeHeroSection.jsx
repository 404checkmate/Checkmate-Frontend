import { Fragment } from 'react'
import homeHeroMascotUrl from '@/assets/home-hero-mascot-camera.png'
import { HOME_HERO_TITLE_LINES } from '@/mocks/homeData'
import RevealBlock from './RevealBlock'
import { SNAP_SLIDE } from './constants'

export default function HomeHeroSection({ heroRevealed, onStartTrip }) {
  return (
    <section className={`relative isolate overflow-hidden bg-transparent ${SNAP_SLIDE}`}>
      <div
        className="pointer-events-none absolute right-[-2%] top-[-12%] h-[62vw] w-[62vw] max-h-[560px] max-w-[560px] rounded-full bg-amber-200/58 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-14%] left-[-6%] h-[36vw] w-[36vw] max-h-[300px] max-w-[300px] rounded-full bg-cyan-300/40 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-[clamp(3.5rem,10vh,7rem)] pt-[clamp(4.5rem,12vh,8rem)] md:gap-10 md:px-8 md:pb-[clamp(4rem,12vh,7rem)] md:pt-[clamp(5rem,14vh,8rem)] lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-8 lg:px-12">
        <div className="order-2 flex w-full min-w-0 max-w-xl flex-col items-start text-left sm:max-w-2xl md:order-1 lg:order-1 lg:flex-1">
          <RevealBlock show={heroRevealed} className="mb-3 w-full md:mb-4">
            <h1 className="text-[1.9rem] font-extrabold leading-[1.25] tracking-tight text-slate-900 sm:text-[2.2rem] md:text-5xl md:leading-tight lg:text-[3.5rem]">
              {HOME_HERO_TITLE_LINES.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {Array.isArray(line) ? (
                    <>
                      {line[0]}
                      <span className="text-[#3db4dd]">{line[1]}</span>
                      {line[2]}
                    </>
                  ) : (
                    line
                  )}
                </Fragment>
              ))}
            </h1>
          </RevealBlock>
          <RevealBlock show={heroRevealed} delayClass="delay-[160ms]" className="mb-5 w-full max-w-xl md:mb-8">
            <p className="text-base font-semibold leading-relaxed text-[#0f5762] md:text-[1.25rem]">
              복잡한 여행 준비, 이제는 <span className="font-extrabold text-amber-500">메이트</span>가
              도와드릴게요
            </p>
          </RevealBlock>
          <RevealBlock
            show={heroRevealed}
            delayClass="delay-[320ms]"
            className="flex w-full flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-4"
          >
            <button
              type="button"
              onClick={onStartTrip}
              className="w-full max-w-sm self-start rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 px-6 py-3.5 text-center text-sm font-bold text-[#6a4a00] shadow-md shadow-amber-900/15 transition hover:from-amber-200 hover:to-amber-300 md:w-auto md:max-w-none md:px-8"
            >
              여행 준비 시작하기
            </button>
          </RevealBlock>
        </div>

        <RevealBlock
          show={heroRevealed}
          delayClass="delay-[400ms]"
          className="order-1 flex w-full min-w-0 shrink-0 justify-center md:order-2 lg:order-2 lg:w-auto lg:max-w-[min(42vw,400px)] lg:flex-none lg:justify-center"
        >
          <div className="mx-auto w-full max-w-[300px] md:max-w-[420px] lg:flex lg:w-full lg:max-w-[520px] lg:justify-center">
            <img
              src={homeHeroMascotUrl}
              alt="CHECKMATE 마스코트 — 여행 가방과 카메라를 든 체스 기사 캐릭터"
              className="mx-auto block h-auto w-full object-contain object-center drop-shadow-[0_10px_24px_rgba(15,23,42,0.25)] lg:max-w-full lg:object-bottom"
              loading="eager"
              decoding="async"
            />
          </div>
        </RevealBlock>

        <div
          className="order-3 flex w-full basis-full flex-col items-center pt-12 md:pt-20 lg:pt-24"
          aria-hidden
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 md:text-[11px]">
            Scroll down
          </span>
          <svg
            className="mt-1.5 h-5 w-5 text-gray-500 motion-safe:animate-bounce motion-reduce:animate-none"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>
      </div>
    </section>
  )
}
