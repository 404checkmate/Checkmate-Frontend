import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import homeHeroMascotUrl from '@/assets/home-hero-mascot.png'
import BrandLogo from '@/components/common/BrandLogo'
import { useRevealOnScrollOnce } from '@/hooks/useRevealOnScrollOnce'
import {
  FOOTER_BOTTOM_LINKS,
  FOOTER_SECTIONS,
  FOOTER_SOCIAL_LINKS,
  HOME_BRAND_TAGLINE,
  HOME_CATCHPHRASE_DISPLAY,
  HOME_CTA,
  HOME_CTA_SIDE_IMAGE,
  HOME_FEATURE_CARDS,
  HOME_FEATURE_HEADING,
  HOME_FEATURE_KICKER,
  HOME_HERO_BG,
  HOME_HERO_SUBTITLE,
  HOME_HERO_TITLE_LINES,
  HOME_PROCESS_HEADING,
  HOME_PROCESS_STEPS,
  LANDING_SECTION_IDS,
} from '@/mocks/homeData'

/** 홈 전체 페이지 스크롤 스냅 — index.css 의 html.home-page-scroll-snap 과 함께 사용 */
const HOME_SCROLL_SNAP_HTML_CLASS = 'home-page-scroll-snap'

/** 스냅 슬라이드: 뷰포트 한 장 + 휠 한 번에 다음 섹션으로 */
const SNAP_SLIDE =
  'snap-start snap-always min-h-[100dvh] flex flex-col justify-center'

/**
 * 캐치프레이즈 ~ 푸터: 한 스냅 단위로만 정렬(CTA 다음 한 번). 둘 사이는 스냅 없이 연속 스크롤.
 */
const SNAP_TAIL_GROUP = 'snap-start snap-always flex w-full flex-col'

/** 홈 섹션 공통 리빌: 더 길게·부드럽게 (prefers-reduced-motion 은 duration 0) */
const REVEAL_EASE =
  'transition-[opacity,transform] duration-[1180ms] ease-[cubic-bezier(0.25,0.46,0.45,0.99)] motion-reduce:duration-0 motion-reduce:opacity-100 motion-reduce:translate-y-0'

/** 피처 카드 3장: 제목 이후 왼쪽 → 가운데 → 오른쪽 순 (JIT가 클래스를 생성하도록 리터럴 고정) */
const FEATURE_CARD_REVEAL_DELAY_CLASS = ['delay-[420ms]', 'delay-[980ms]', 'delay-[1540ms]']

/** 섹션 진입 시 페이드 + 살짝 위로 (스크롤 스냅과 별도) */
function RevealBlock({ show, delayClass = '', className = '', children }) {
  return (
    <div
      className={`${REVEAL_EASE} ${delayClass} ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/** 홈 푸터 전용: 클릭·포커스는 되지만 라우팅 등 동작 없음 */
function noopFooterAction() {}

function LegalFooterLinks({ className = '', nonInteractive = false }) {
  if (nonInteractive) {
    return (
      <nav className={className} aria-label="법적 안내">
        {FOOTER_BOTTOM_LINKS.map((link, idx) => (
          <span key={link.label} className="inline-flex items-center gap-x-2">
            {idx > 0 && <span className="text-gray-200 select-none" aria-hidden>|</span>}
            <button
              type="button"
              onClick={noopFooterAction}
              className="cursor-pointer border-0 bg-transparent p-0 text-inherit text-gray-500 underline-offset-2 transition-colors hover:text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
            >
              {link.label}
            </button>
          </span>
        ))}
      </nav>
    )
  }
  return (
    <nav className={className} aria-label="법적 안내">
      {FOOTER_BOTTOM_LINKS.map((link, idx) => (
        <span key={link.label} className="inline-flex items-center gap-x-2">
          {idx > 0 && <span className="text-gray-200 select-none" aria-hidden>|</span>}
          <a href={link.href} className="transition-colors hover:text-gray-600">
            {link.label}
          </a>
        </span>
      ))}
    </nav>
  )
}

function FeatureIcon({ type, accent }) {
  const ring =
    accent === 'teal'
      ? 'bg-teal-50 text-teal-600 ring-teal-100'
      : accent === 'amber'
        ? 'bg-amber-50 text-amber-600 ring-amber-100'
        : 'bg-cyan-50 text-cyan-600 ring-cyan-100'
  const paths = {
    folder: (
      <path
        fill="currentColor"
        d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
      />
    ),
    network: (
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      />
    ),
    list: (
      <path
        fill="currentColor"
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      />
    ),
  }
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${ring}`}
      aria-hidden
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
        {paths[type]}
      </svg>
    </span>
  )
}

function ProcessMockup() {
  const rows = ['여권 & 서류', '항공·교통', '숙소 확인', '짐 싸기', '환전·카드']
  return (
    <div
      className="mx-auto w-full max-w-sm rounded-[1.75rem] border border-gray-800 bg-gray-900 p-4 shadow-2xl shadow-gray-900/40 ring-1 ring-white/10"
      aria-hidden
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-xs font-semibold text-white/90">CHECKMATE · 여행 체크리스트</span>
        <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.7)]" />
      </div>
      <ul className="space-y-2.5">
        {rows.map((label, i) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white/90"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                i < 3 ? 'bg-teal-500 text-white' : 'border border-white/20 text-white/40'
              }`}
            >
              {i < 3 ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <span className="text-[10px] font-bold">{i + 1}</span>
              )}
            </span>
            <span className="truncate font-medium">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 홈(/) 전용 — 우하단 맨 위로 스크롤 (모바일은 하단 탭 위로 배치) */
function HomeScrollToTopFab() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTop = () => {
    const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="페이지 맨 위로 이동"
      className={`fixed bottom-20 right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-900/30 transition-[opacity,transform] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 md:bottom-8 md:right-6 ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
      </svg>
    </button>
  )
}

function SocialIcon({ icon }) {
  if (icon === 'linkedin') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    )
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [heroRevealed, setHeroRevealed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const [featuresRef, featuresRevealed] = useRevealOnScrollOnce({
    threshold: 0.2,
    rootMargin: '0px 0px -12% 0px',
  })
  const [processRef, processRevealed] = useRevealOnScrollOnce({
    threshold: 0.16,
    rootMargin: '0px 0px -10% 0px',
  })
  const [ctaRef, ctaRevealed] = useRevealOnScrollOnce({
    threshold: 0.18,
    rootMargin: '0px 0px -10% 0px',
  })
  const [catchphraseRef, catchphraseRevealed] = useRevealOnScrollOnce({
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px',
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return undefined
    document.documentElement.classList.add(HOME_SCROLL_SNAP_HTML_CLASS)
    return () => {
      document.documentElement.classList.remove(HOME_SCROLL_SNAP_HTML_CLASS)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setHeroRevealed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  return (
    <div className="bg-white">
      {/* 히어로 — 풀블리드 배경, 왼쪽 카피·CTA / 오른쪽 마스코트 PNG */}
      <section
        className={`relative isolate overflow-hidden ${SNAP_SLIDE}`}
      >
        <img
          src={HOME_HERO_BG}
          alt="일몰이 비친 청록빛 바다 풍경"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* 상·중앙만 살짝 어둡게 — 제목·본문 대비 */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(15,23,42,0.48) 0%, rgba(15,23,42,0.22) 32%, rgba(15,23,42,0.08) 48%, transparent 58%)',
          }}
          aria-hidden
        />
        {/* 하단 ~70% 부근부터 이미지가 흰색으로 스며듦 (레퍼런스와 유사) */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 48%, rgba(255,255,255,0.35) 68%, rgba(255,255,255,0.88) 86%, #ffffff 100%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-[clamp(3.5rem,10vh,7rem)] pt-[clamp(4.5rem,12vh,8rem)] md:gap-10 md:px-8 md:pb-[clamp(4rem,12vh,7rem)] md:pt-[clamp(5rem,14vh,8rem)] lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-8 lg:px-12">
          {/* order: 모바일만 마스코트(1) → 카피(2) → 스크롤 안내(3) / md~ 는 카피→마스코트 */}
          <div className="order-2 flex w-full min-w-0 max-w-xl flex-col items-start text-left sm:max-w-2xl md:order-1 lg:order-1 lg:flex-1">
            <RevealBlock show={heroRevealed} className="mb-3 w-full md:mb-4">
              <h1 className="text-[1.6rem] font-extrabold leading-[1.35] tracking-tight text-white sm:text-3xl md:text-4xl md:leading-tight lg:text-[2.75rem]">
                {HOME_HERO_TITLE_LINES.map((line, i) => (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    {Array.isArray(line) ? (
                      <>
                        {line[0]}
                        <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                          {line[1]}
                        </span>
                        {line[2]}
                      </>
                    ) : i === 0 ? (
                      <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                        {line}
                      </span>
                    ) : (
                      line
                    )}
                  </Fragment>
                ))}
              </h1>
            </RevealBlock>
            <RevealBlock show={heroRevealed} delayClass="delay-[160ms]" className="mb-5 w-full max-w-xl md:mb-8">
              <p className="text-[0.9375rem] leading-relaxed text-teal-50/95 md:text-base">{HOME_HERO_SUBTITLE}</p>
            </RevealBlock>
            <RevealBlock
              show={heroRevealed}
              delayClass="delay-[320ms]"
              className="flex w-full flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-4"
            >
              <button
                type="button"
                onClick={() => navigate('/trips/new/step2')}
                className="w-full max-w-sm self-start rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-teal-900/35 transition hover:from-cyan-400 hover:to-teal-500 md:w-auto md:max-w-none md:px-8"
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
            <div className="mx-auto w-full max-w-[220px] md:max-w-[300px] lg:flex lg:w-full lg:max-w-none lg:justify-center">
              <img
                src={homeHeroMascotUrl}
                alt="CHECKMATE 마스코트 — 여행 가방과 카메라를 든 체스 기사 캐릭터"
                className="mx-auto block h-auto w-full object-contain object-center drop-shadow-[0_12px_40px_rgba(15,23,42,0.35)] lg:max-w-full lg:object-bottom"
                loading="eager"
                decoding="async"
              />
            </div>
          </RevealBlock>
          {/* 다음 섹션 스크롤 유도 — lg 에서는 한 줄 전체(basis-full)로 아래에 배치 */}
          <div
            className="order-3 flex w-full basis-full flex-col items-center pt-2 md:pt-5 lg:pt-6"
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

      {/* 피처 — 3열 카드 */}
      <section
        id={LANDING_SECTION_IDS.features}
        className={`${SNAP_SLIDE} bg-white py-12 md:py-16`}
        aria-labelledby="landing-features-title"
      >
        <div ref={featuresRef} className="mx-auto max-w-6xl px-5 md:px-6">
          <RevealBlock show={featuresRevealed} className="mb-3 text-center">
            <span className="inline-flex rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-1.5 text-[11px] font-bold tracking-wide text-teal-900 shadow-sm shadow-teal-900/5">
              {HOME_FEATURE_KICKER}
            </span>
          </RevealBlock>
          <RevealBlock show={featuresRevealed} delayClass="delay-[180ms]">
            <h2
              id="landing-features-title"
              className="mx-auto mb-12 max-w-3xl text-center text-2xl font-extrabold leading-snug text-gray-900 md:mb-16 md:text-3xl md:leading-tight"
            >
              <span className="block">{HOME_FEATURE_HEADING.line1}</span>
              <span className="block">{HOME_FEATURE_HEADING.line2}</span>
            </h2>
          </RevealBlock>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8 md:items-start">
            {HOME_FEATURE_CARDS.map((card, index) => {
              const staggerY =
                index === 0
                  ? 'md:-translate-y-3 motion-reduce:md:translate-y-0'
                  : index === 1
                    ? 'md:translate-y-12 motion-reduce:md:translate-y-0'
                    : 'md:translate-y-4 motion-reduce:md:translate-y-0'
              return (
                <RevealBlock
                  key={card.id}
                  show={featuresRevealed}
                  delayClass={FEATURE_CARD_REVEAL_DELAY_CLASS[index] ?? 'delay-0'}
                >
                  <article
                    className={`rounded-2xl border border-teal-100/70 bg-white p-6 shadow-md shadow-teal-900/[0.06] ring-1 ring-teal-900/[0.04] transition duration-300 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/10 ${staggerY}`}
                  >
                    <FeatureIcon type={card.icon} accent={card.accent} />
                    <h3 className="mt-4 text-lg font-bold text-gray-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{card.description}</p>
                  </article>
                </RevealBlock>
              )
            })}
          </div>
        </div>
      </section>

      {/* 프로세스 — 연한 회색 배경, 2단 */}
      <section
        id={LANDING_SECTION_IDS.how}
        className={`${SNAP_SLIDE} border-t border-teal-100/40 bg-gradient-to-br from-slate-50 via-teal-50/40 to-cyan-50/30 py-12 md:py-16`}
        aria-labelledby="landing-how-title"
      >
        <div
          ref={processRef}
          className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-6"
        >
          <RevealBlock show={processRevealed}>
            <div>
              <h2
                id="landing-how-title"
                className="text-2xl font-extrabold leading-snug text-gray-900 md:text-3xl"
              >
                {HOME_PROCESS_HEADING}
              </h2>
              <ol className="mt-8 space-y-6">
                {HOME_PROCESS_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-sm font-black text-white shadow-md shadow-teal-700/25"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </RevealBlock>
          <RevealBlock show={processRevealed} delayClass="delay-[260ms]" className="flex justify-center md:justify-end">
            <ProcessMockup />
          </RevealBlock>
        </div>
      </section>

      {/* CTA 배너 */}
      <section className={`${SNAP_SLIDE} py-10 md:py-12`}>
        <div ref={ctaRef} className="mx-auto max-w-6xl px-5 md:px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-600 shadow-xl shadow-teal-900/25 md:flex md:min-h-[280px]">
            <RevealBlock show={ctaRevealed} className="flex flex-1 flex-col justify-center px-6 py-10 md:px-12 md:py-12">
              <h2 className="text-xl font-extrabold leading-snug text-white md:text-2xl">
                <span className="block">{HOME_CTA.title.line1}</span>
                <span className="block">{HOME_CTA.title.line2}</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-teal-50/95">{HOME_CTA.subtitle}</p>
              <button
                type="button"
                onClick={() => navigate(HOME_CTA.buttonTo)}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-teal-950 shadow-md shadow-teal-900/20 transition hover:bg-amber-300"
              >
                {HOME_CTA.buttonLabel}
                <span aria-hidden>→</span>
              </button>
            </RevealBlock>
            <RevealBlock
              show={ctaRevealed}
              delayClass="delay-[240ms]"
              className="relative min-h-[200px] w-full md:w-[42%] md:min-h-0"
            >
              <img
                src={HOME_CTA_SIDE_IMAGE}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-teal-700/88 to-transparent md:bg-gradient-to-l"
                aria-hidden
              />
            </RevealBlock>
          </div>
        </div>
      </section>

      {/* 캐치프레이즈 + 푸터: tail 그룹(내부는 스냅 없음 → 푸터로 자연 스크롤) */}
      <div className={SNAP_TAIL_GROUP}>
      <section
        className="snap-none relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden border-t border-teal-200/50 bg-gradient-to-br from-teal-50 via-cyan-50/90 to-amber-50/80 py-14 md:py-20"
      >
        <div
          className="pointer-events-none absolute -left-20 top-6 h-52 w-52 rounded-full bg-teal-300/50 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-1/4 h-60 w-60 rounded-full bg-cyan-300/45 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-4 left-1/4 h-44 w-44 -translate-x-1/2 rounded-full bg-emerald-200/55 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-8 right-8 h-36 w-36 rounded-full bg-amber-200/60 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: `radial-gradient(circle at 18% 22%, rgba(45, 212, 191, 0.14) 0%, transparent 45%),
              radial-gradient(circle at 88% 72%, rgba(6, 182, 212, 0.12) 0%, transparent 42%),
              radial-gradient(circle at 48% 100%, rgba(251, 191, 36, 0.1) 0%, transparent 38%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[length:22px_22px] opacity-[0.2]"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(13, 148, 136, 0.12) 1.5px, transparent 1.6px)',
          }}
          aria-hidden
        />

        <div
          ref={catchphraseRef}
          className="relative z-10 mx-auto w-full max-w-3xl px-5 md:max-w-4xl md:px-6"
          style={{ fontFamily: "'SeoulNotice', system-ui, sans-serif" }}
        >
          <RevealBlock show={catchphraseRevealed}>
            <p className="text-center text-xl font-extrabold leading-snug text-teal-900 md:text-2xl md:leading-snug lg:text-[1.7rem]">
              <span className="block">{HOME_CATCHPHRASE_DISPLAY.line1}</span>
              <span className="mt-2 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 md:mt-2.5 md:gap-x-2.5">
                <BrandLogo
                  className="h-7 w-auto shrink-0 object-contain md:h-8 lg:h-9"
                  alt="CHECKMATE"
                />
                <span>{HOME_CATCHPHRASE_DISPLAY.afterLogo}</span>
              </span>
            </p>
          </RevealBlock>
        </div>
      </section>

      <footer className="snap-none border-t border-teal-100/60 bg-[#f4fdfa] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-12">
            <div className="max-w-xs">
              <BrandLogo className="h-7 w-auto" />
              <p className="mt-3 text-xs leading-relaxed text-gray-600">{HOME_BRAND_TAGLINE}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={noopFooterAction}
                  className="cursor-pointer border-0 bg-transparent p-0 text-gray-500 transition-colors hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
                >
                  홈
                </button>
                <button
                  type="button"
                  onClick={noopFooterAction}
                  className="cursor-pointer border-0 bg-transparent p-0 text-gray-500 transition-colors hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
                >
                  공지·소식
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:gap-10">
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.id}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-900">
                    {section.title}
                  </p>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={noopFooterAction}
                          className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-sm text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200/80 pt-8 md:flex-row">
            <div className="flex items-center gap-4 text-gray-500">
              {FOOTER_SOCIAL_LINKS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={noopFooterAction}
                  aria-label={s.label}
                  className="cursor-pointer border-0 bg-transparent p-0 text-gray-500 transition-colors hover:text-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1"
                >
                  <SocialIcon icon={s.icon} />
                </button>
              ))}
            </div>
            <LegalFooterLinks
              nonInteractive
              className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs text-gray-500"
            />
          </div>
          <p className="mt-6 text-center text-xs text-gray-400 md:text-right">
            © {new Date().getFullYear()} CHECKMATE. 무단 복제 및 배포를 금합니다.
          </p>
        </div>
      </footer>
      </div>

      <HomeScrollToTopFab />
    </div>
  )
}

export default HomePage
