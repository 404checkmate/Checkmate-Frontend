import processCardSaveUrl from '@/assets/home-process-card-save.png'
import processCardOpenUrl from '@/assets/home-process-card-open.png'
import processCardCheckUrl from '@/assets/home-process-card-check.png'
import { LANDING_SECTION_IDS } from '@/mocks/homeData'
import RevealBlock from './RevealBlock'
import { SNAP_SLIDE, FEATURE_CARD_REVEAL_DELAY_CLASS } from './constants'

const FLOW_CARDS = [
  {
    id: 'save',
    imageSrc: processCardSaveUrl,
    imageAlt: '저장 단계를 안내하는 메이트',
    topLine: '여행과 일정을 정한 뒤,',
    bottomLine: (
      <>
        필요한 준비 항목을 찾아
        <br />
        <span className="text-sky-500">저장</span>합니다
      </>
    ),
  },
  {
    id: 'open',
    imageSrc: processCardOpenUrl,
    imageAlt: '확인 및 수정 단계를 안내하는 메이트',
    topLine: (
      <>
        <span className="text-amber-500">나의 체크리스트</span>에서
      </>
    ),
    bottomLine: (
      <>
        저장한 리스트를 확인하고,
        <br />
        <span className="md:hidden">
          필요한 항목을
          <br />
          <span className="text-sky-500">추가, 수정</span>합니다
        </span>
        <span className="hidden md:inline">
          필요한 항목을 <span className="text-sky-500">추가, 수정</span>합니다
        </span>
      </>
    ),
  },
  {
    id: 'check',
    imageSrc: processCardCheckUrl,
    imageAlt: '체크 단계를 안내하는 메이트',
    topLine: '체크리스트에서',
    bottomLine: (
      <>
        하나씩 준비하면서 <span className="text-sky-500">체크</span>하며
        <br />
        출발 전까지 마무리합니다
      </>
    ),
  },
]

export default function HomeProcessSection({ processRef, processRevealed }) {
  return (
    <section
      id={LANDING_SECTION_IDS.how}
      className={`${SNAP_SLIDE} bg-transparent py-12 md:py-16`}
      aria-labelledby="landing-how-title"
    >
      <div ref={processRef} className="mx-auto max-w-6xl px-5 md:px-6">
        <RevealBlock show={processRevealed}>
          <h2
            id="landing-how-title"
            className="text-center text-[2.2rem] font-extrabold leading-tight text-[#083a4a] md:text-[3.2rem]"
          >
            어떻게 이용할까요?
          </h2>
          <p className="mt-2 text-center text-base font-extrabold text-[#0d4b5b] md:text-[1.25rem]">
            <span className="md:hidden">
              복잡한 단계 없이
              <br />
              <span className="text-amber-500">저장</span> <span className="text-amber-500">-&gt;</span>{' '}
              <span className="text-amber-500">확인</span> <span className="text-amber-500">-&gt;</span>{' '}
              <span className="text-amber-500">체크</span>만 기억하세요!
            </span>
            <span className="hidden md:inline">
              복잡한 단계 없이 <span className="text-amber-500">저장</span>{' '}
              <span className="text-amber-500">-&gt;</span> <span className="text-amber-500">확인</span>{' '}
              <span className="text-amber-500">-&gt;</span> <span className="text-amber-500">체크</span>만
              기억하세요!
            </span>
          </p>
        </RevealBlock>

        <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3 md:gap-7">
          {FLOW_CARDS.map((card, index) => (
            <RevealBlock
              key={card.id}
              show={processRevealed}
              delayClass={FEATURE_CARD_REVEAL_DELAY_CLASS[index]}
            >
              <article className="flex h-full min-h-[318px] flex-col items-center rounded-3xl border border-slate-300/60 bg-slate-50 px-6 py-7 text-center shadow-[0_14px_30px_rgba(13,58,76,0.18)]">
                <div className="flex h-[130px] w-[130px] items-center justify-center rounded-[2rem] bg-[#f3ebce]">
                  <img
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    className="h-[112px] w-[112px] object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="mt-8 text-[1.45rem] font-extrabold leading-tight text-[#113e4b] md:text-[1.3rem]">
                  <span className="block">{card.topLine}</span>
                  <span className="block">{card.bottomLine}</span>
                </p>
              </article>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  )
}
