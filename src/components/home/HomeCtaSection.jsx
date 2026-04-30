import ctaSceneUrl from '@/assets/0f249867d538bc1717.png'
import ctaTitleCombinedUrl from '@/assets/home-cta-title-combined.png'
import RevealBlock from './RevealBlock'
import { SNAP_SLIDE } from './constants'

export default function HomeCtaSection({ ctaRef, ctaRevealed, onStartTrip }) {
  return (
    <section className={`${SNAP_SLIDE} bg-transparent py-0`}>
      <div ref={ctaRef} className="w-full">
        <div className="relative w-full overflow-hidden bg-transparent pb-0 pt-6 md:pt-8">
          <RevealBlock
            show={ctaRevealed}
            className="relative z-20 mt-4 mx-auto w-fit px-4 text-center md:mt-2 md:px-0 md:text-center"
          >
            <img
              src={ctaTitleCombinedUrl}
              alt="이제 MATE와 함께 CHECK 하러 가볼까요?"
              className="mx-auto block h-auto w-full max-w-[336px] object-contain md:max-w-[432px] lg:max-w-[492px]"
              loading="lazy"
              decoding="async"
            />
          </RevealBlock>

          <RevealBlock
            show={ctaRevealed}
            delayClass="delay-[320ms]"
            className="relative z-20 mt-0.5 mb-2 flex justify-center px-4 md:mt-1 md:mb-3"
          >
            <button
              type="button"
              onClick={onStartTrip}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/90 bg-white/85 px-4 py-2 text-sm font-extrabold text-[#0d4b5b] shadow-sm shadow-teal-900/5 backdrop-blur-[1px] transition-all hover:-translate-y-[1px] hover:bg-teal-50/95 hover:text-[#083a4a] hover:shadow-md md:px-5 md:py-2.5 md:text-base"
            >
              여행 준비 시작하기
              <span aria-hidden className="text-[0.95em] leading-none text-amber-500">→</span>
            </button>
          </RevealBlock>

          <RevealBlock
            show={ctaRevealed}
            delayClass="delay-[200ms]"
            className="relative -mt-2 flex justify-center md:-mt-4"
          >
            <img
              src={ctaSceneUrl}
              alt="여행 가방을 든 메이트와 깃발을 든 작은 메이트가 체스판 위에 서 있는 장면"
              className="mx-auto block h-auto w-full max-w-[720px] object-contain md:max-w-[1100px] lg:max-w-[1300px]"
              loading="lazy"
              decoding="async"
            />
          </RevealBlock>
        </div>
      </div>
    </section>
  )
}
