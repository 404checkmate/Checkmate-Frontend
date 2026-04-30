import featureMascotQuestionUrl from '@/assets/ChatGPT_Image_2026_4_30_02_46_20_2.png'
import { LANDING_SECTION_IDS } from '@/mocks/homeData'
import RevealBlock from './RevealBlock'
import FeatureSpeechBubble from './FeatureSpeechBubble'
import { SNAP_SLIDE, FEATURE_CARD_REVEAL_DELAY_CLASS } from './constants'

export default function HomeFeatureSection({ featuresRef, featuresRevealed }) {
  return (
    <section
      id={LANDING_SECTION_IDS.features}
      className={`${SNAP_SLIDE} relative overflow-hidden bg-transparent py-12 md:py-16`}
      aria-labelledby="landing-features-title"
    >
      <div
        className="pointer-events-none absolute -left-24 -top-16 h-[36vw] w-[36vw] max-h-[300px] max-w-[300px] rounded-full bg-cyan-300/40 blur-3xl md:-left-20 md:-top-20"
        aria-hidden
      />
      <div ref={featuresRef} className="mx-auto max-w-6xl px-5 md:px-6">
        <RevealBlock show={featuresRevealed}>
          <h2
            id="landing-features-title"
            className="mx-auto mb-12 max-w-4xl text-center text-[1.65rem] font-extrabold leading-tight text-[#04384a] md:mb-14 md:text-[3.25rem]"
          >
            <span className="block">조건만 입력하면,</span>
            <span className="block">
              메이트가 <span className="text-amber-500">자동 생성</span>해드려요!
            </span>
          </h2>
        </RevealBlock>

        <div className="grid items-center gap-8 md:grid-cols-[1.35fr_1fr] md:gap-10">
          <div className="relative flex w-full max-w-[640px] flex-col gap-3 md:ml-4 md:gap-4">
            <RevealBlock
              show={featuresRevealed}
              delayClass={FEATURE_CARD_REVEAL_DELAY_CLASS[0]}
              className="relative z-[3] flex w-full justify-start pr-10 md:pr-12"
            >
              <FeatureSpeechBubble text="어디로 떠날 예정이세요?" tone="light" tail="left" />
            </RevealBlock>
            <RevealBlock
              show={featuresRevealed}
              delayClass={FEATURE_CARD_REVEAL_DELAY_CLASS[1]}
              className="relative z-[2] -mt-1 flex w-full justify-end pl-10 md:-mt-2 md:pl-12"
            >
              <FeatureSpeechBubble text="누구와 함께하세요?" tone="teal" tail="right" />
            </RevealBlock>
            <RevealBlock
              show={featuresRevealed}
              delayClass={FEATURE_CARD_REVEAL_DELAY_CLASS[2]}
              className="relative z-[1] -mt-1 flex w-full justify-start pr-10 md:-mt-2 md:pr-12"
            >
              <FeatureSpeechBubble text="여행 스타일은 어떠세요?" tone="light" tail="left" />
            </RevealBlock>
          </div>

          <RevealBlock show={featuresRevealed} delayClass="delay-[480ms]" className="flex justify-center md:justify-end">
            <img
              src={featureMascotQuestionUrl}
              alt="질문표시와 함께 놀란 메이트 마스코트"
              className="h-auto w-full max-w-[320px] object-contain md:max-w-[360px]"
              loading="lazy"
              decoding="async"
            />
          </RevealBlock>
        </div>

        <RevealBlock show={featuresRevealed} delayClass="delay-[620ms]">
          <p className="mx-auto mt-8 max-w-4xl text-center text-[1.05rem] font-extrabold leading-snug text-[#083a4a] md:mt-10 md:text-[1.7rem]">
            <span className="md:hidden">
              간단한 조건 입력만으로 메이트가
              <br />
              필요한 준비물과 주의사항을
              <br />
              한 번에 정리해서 <span className="text-amber-500">체크리스트</span>로 제공해드려요!
            </span>
            <span className="hidden md:inline">
              간단한 조건 입력만으로 메이트가 필요한 준비물과 주의사항을
              <br />
              한 번에 정리해서 <span className="text-amber-500">체크리스트</span>로 제공해드려요!
            </span>
          </p>
        </RevealBlock>
      </div>
    </section>
  )
}
