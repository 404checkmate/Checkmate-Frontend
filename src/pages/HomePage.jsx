import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IMAGES } from '@/images/constants'
import { FEATURE_CARDS, FOOTER_SECTIONS, FOOTER_BOTTOM_LINKS } from '@/mocks/homeData'
import BrandLogo from '@/components/common/BrandLogo'
import { AUTH_CONSENT_PATH, AUTH_CONSENT_PREVIEW_PARAM } from '@/utils/onboardingGate'
import homeMobileHeroTravel from '@/assets/home-mobile-hero-travel.png'

const SLIDE_INTERVAL = 5000
const HERO_SLIDES = IMAGES.home.heroSlides

/** 문의하기 · 개인정보 · 약관 — 푸터 하단 공통 */
function LegalFooterLinks({ className = '' }) {
  return (
    <nav className={className} aria-label="법적 안내">
      {FOOTER_BOTTOM_LINKS.map((link, idx) => (
        <span key={link.label} className="inline-flex items-center gap-x-2">
          {idx > 0 && <span className="text-gray-200 select-none" aria-hidden>|</span>}
          <a href={link.href} className="hover:text-gray-600 transition-colors">
            {link.label}
          </a>
        </span>
      ))}
    </nav>
  )
}

/** 히어로 슬라이드 이미지 (데스크톱·모바일 공용, 레이아웃만 반응형) */
function HeroSlideshow({ currentSlide }) {
  return (
    <>
      {HERO_SLIDES.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt={`여행 풍경 ${idx + 1}`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: idx === currentSlide ? 1 : 0 }}
          loading={idx === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    let timer
    const tick = () => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }
    const sync = () => {
      clearInterval(timer)
      if (mq.matches) timer = setInterval(tick, SLIDE_INTERVAL)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => {
      mq.removeEventListener('change', sync)
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="bg-white">
      {/* 히어로 — 웹과 동일 카피·구조, 모바일은 세로 스택 */}
      <section
        className="relative overflow-hidden pb-0 md:min-h-[520px] md:pb-0"
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 30%, #EDE9FE 65%, #FDF2F8 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute hidden md:block"
          style={{
            width: '40vw',
            height: '40vw',
            top: '-12vw',
            right: '-5vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="pointer-events-none absolute hidden md:block"
          style={{
            width: '30vw',
            height: '30vw',
            bottom: '-8vw',
            left: '10vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="pointer-events-none absolute hidden md:block"
          style={{
            width: '20vw',
            height: '20vw',
            top: '20%',
            left: '-5vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-5 pt-6 md:px-6 md:py-20">
          <div className="mx-auto max-w-md md:mx-0">
            <span
              className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white shadow-sm md:mb-6 md:px-4 md:py-1.5 md:text-xs"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)' }}
            >
              Editorial Curation
            </span>
            <h1 className="mb-3 text-3xl font-extrabold leading-tight text-gray-900 md:mb-5 md:text-5xl">
              여행은 가는데…
              <br />
              준비는 안 했죠?
            </h1>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-500 md:mb-8 md:text-base">
              찾기만 하고 끝나는 여행 준비는 그만
              <br />
              저장부터 체크까지 한 번에 체크리스트로 여행 준비를 완성하세요.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/trips/new/step2')}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.03] hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)' }}
              >
                시작하기
              </button>
              <button
                type="button"
                onClick={() => navigate(`${AUTH_CONSENT_PATH}?${AUTH_CONSENT_PREVIEW_PARAM}=1`)}
                className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-100"
              >
                약관 동의 페이지 예시
              </button>
              <Link
                to="/onboarding"
                className="rounded-xl border-2 border-teal-300 bg-teal-50/90 px-4 py-3 text-sm font-semibold text-teal-900 shadow-sm transition-colors hover:bg-teal-100/90"
              >
                온보딩 페이지
              </Link>
            </div>
          </div>
        </div>

        {/* 모바일: 히어로 단일 이미지 — 하단만 라운드. 뒤에 직사각 흰 판을 두어 border-radius 바깥 삼각형에 그라데이션이 비치지 않게 함 */}
        <div className="relative z-[1] mt-8 h-64 w-full md:hidden">
          <div className="absolute inset-0 bg-white" aria-hidden />
          <div className="absolute inset-0 overflow-hidden rounded-b-2xl">
            <img
              src={homeMobileHeroTravel}
              alt="비행기 창밖으로 보이는 구름 위의 여행 풍경"
              className="absolute left-1/2 top-1/2 h-[106%] w-[106%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-[58%_36%]"
              loading="eager"
            />
          </div>
        </div>

        {/* 데스크톱: 오른쪽 풀블리드 슬라이드 + 마스크 */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden h-full w-[55%] md:block"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 40%, black 60%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 40%, black 60%)',
          }}
        >
          <div className="pointer-events-auto relative h-full w-full">
            <HeroSlideshow currentSlide={currentSlide} />
          </div>
        </div>
      </section>

      {/* 공감 + 쓰는 법 — 심플 2단 */}
      <section className="border-t border-gray-100 bg-white" aria-label="CHECKMATE 한눈에 보기">
        <div className="mx-auto max-w-7xl px-3 pb-10 pt-16 md:pl-9 md:pr-4 md:pb-14 md:pt-24 lg:pl-12 lg:pr-6">
          <div className="relative">
            {/* 두 칸 콘텐츠 사이 정중앙 세로선 (그리드 열 경계가 아닌 컨테이너 50%) */}
            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-px -translate-x-1/2 bg-gray-100 md:block"
              aria-hidden
            />
            <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start md:gap-0">
            {FEATURE_CARDS.map((card, index) => {
              const isHighlight = card.variant === 'highlight'
              const kicker = card.kicker ?? (isHighlight ? '어떻게 이용하지?' : '공감')
              /** 두 섹션 같은 높이에서 시작 (수평 맞춤) */
              const columnClass = 'md:justify-self-start md:max-w-[min(100%,36rem)]'
              const stepBadgeClass = isHighlight
                ? 'rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] ring-amber-200/70'
                : 'rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50/60 text-teal-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] ring-teal-200/70'
              const progressBorderClass = isHighlight ? 'border-amber-100' : 'border-teal-100'
              const progressValueClass = isHighlight ? 'text-amber-500' : 'text-teal-600'
              const showStepNumbers = card.showStepNumbers !== false
              const StepListTag = showStepNumbers ? 'ol' : 'ul'

              return (
                <div
                  key={card.id}
                  className={`md:px-5 ${index === 0 ? 'md:pr-7' : 'md:pl-20'} lg:px-6 ${index === 0 ? 'lg:pr-8' : 'lg:pl-24'} ${index > 0 ? 'border-t border-gray-100 pt-12 md:border-t-0 md:pt-0' : ''} ${columnClass}`}
                >
                  <div className="mb-4 flex min-h-[2.75rem] items-center gap-3">
                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isHighlight ? 'bg-amber-100' : 'bg-teal-50'
                      }`}
                      aria-hidden
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${isHighlight ? 'text-amber-700' : 'text-teal-600'}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d={card.desktopIcon.path} />
                      </svg>
                    </span>
                    <span
                      className={`text-lg font-extrabold leading-tight md:text-xl ${
                        isHighlight ? 'text-amber-700' : 'text-teal-600'
                      }`}
                    >
                      {kicker}
                    </span>
                  </div>

                  <h3 className="whitespace-pre-line text-xl font-extrabold leading-snug text-gray-900 md:text-2xl">
                    {card.title}
                  </h3>

                  {card.description && (
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-600">{card.description}</p>
                  )}

                  {!isHighlight && card.tags?.length > 0 && (
                    <p className="mt-5 text-xs font-medium tracking-wide text-gray-400">
                      {card.tags.join('  ·  ')}
                    </p>
                  )}

                  {card.steps?.length > 0 && (
                    <StepListTag
                      className="mt-6 max-w-lg list-none space-y-4 overflow-visible md:space-y-5"
                      aria-label={isHighlight ? '이용 순서' : '왜 쓰면 좋은지'}
                    >
                      {card.steps.map((line, i) => (
                        <li
                          key={line}
                          className={showStepNumbers ? 'flex items-start gap-3.5 md:gap-4' : 'overflow-visible'}
                        >
                          {showStepNumbers ? (
                            <>
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center text-sm font-black tabular-nums ring-1 md:h-[2.625rem] md:w-[2.625rem] md:text-[0.9375rem] ${stepBadgeClass}`}
                                aria-hidden
                              >
                                {i + 1}
                              </span>
                              <p className="min-w-0 flex-1 pt-0.5 text-sm font-bold leading-snug tracking-tight text-gray-900 md:pt-0.5 md:text-[0.9375rem] md:leading-relaxed">
                                {line}
                              </p>
                            </>
                          ) : (
                            <div
                              className={`relative max-w-lg ${i === 1 ? 'ml-auto mr-0.5' : 'ml-0.5'}`}
                            >
                              {/*
                                말풍선: i=1 만 오른쪽 꼬리·오른쪽 정렬(공감 털어놓기) — 앰버·로즈 톤으로 1·3번 틸과 구분.
                              */}
                              <div
                                className={`relative overflow-visible rounded-2xl border px-4 py-3.5 ${
                                  i === 1
                                    ? 'border-amber-200/85 bg-gradient-to-bl from-amber-50/98 via-orange-50/75 to-rose-50/45 shadow-[0_4px_24px_-8px_rgba(217,119,6,0.18),0_2px_10px_-4px_rgba(244,114,182,0.14)]'
                                    : 'border-teal-200/80 bg-gradient-to-br from-emerald-50/95 via-teal-50/70 to-cyan-50/55 shadow-[0_4px_24px_-8px_rgba(13,148,136,0.2),0_2px_8px_-4px_rgba(6,182,212,0.16)]'
                                }`}
                              >
                                <span
                                  aria-hidden
                                  className={`pointer-events-none absolute top-1/2 z-0 block h-3 w-3 -translate-y-1/2 rotate-45 rounded-[2px] ${
                                    i === 1
                                      ? 'right-0 translate-x-1/2 border-t border-r border-amber-200/85 bg-amber-50/98'
                                      : 'left-0 -translate-x-1/2 border-b border-l border-teal-200/80 bg-emerald-50/95'
                                  }`}
                                />
                                <p className="relative z-10 m-0 whitespace-pre-line text-sm font-bold leading-relaxed tracking-tight text-gray-900 md:text-[0.9375rem]">
                                  {line}
                                </p>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </StepListTag>
                  )}

                  {card.progress && (
                    <div
                      className={`mt-6 flex flex-wrap items-baseline gap-2 border-t pt-5 ${progressBorderClass}`}
                    >
                      <span
                        className={`text-3xl font-black tabular-nums md:text-4xl ${progressValueClass}`}
                      >
                        {card.progress.value}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{card.progress.label}</span>
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>
        </div>
      </section>

      {/* 나의 체크리스트 유도 — 브랜드 톤(민트·스카이, 히어로와 맞춤) */}
      <section
        className="relative overflow-hidden py-12 md:py-16"
        style={{
          background:
            'linear-gradient(180deg, #ECFDF5 0%, #E0F2FE 42%, rgba(236, 253, 245, 0.35) 72%, #ffffff 100%)',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 md:px-6 lg:flex-row lg:items-center lg:gap-16">
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-xs font-semibold tracking-widest text-teal-600/90">나의 체크리스트</p>
            <h2 className="mb-4 text-2xl font-extrabold leading-snug text-gray-900 md:text-[26px]">
              챙길 것은 한곳에 모으고
              <br />
              출발 전까지 체크로 마무리하세요
            </h2>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-600">
              여행 준비는 생각날 때마다 조금씩 늘어나기 마련이에요. 목적지와 일정에 맞춰 필요한 항목을 골라{' '}
              <strong className="font-semibold text-gray-800">나의 체크리스트</strong>로 모아 두면, 잊기 쉬운 준비물도 한눈에
              정리됩니다. 저장해 둔 가이드는 보관함에서 다시 열고, 떠나기 직전까지 체크하며 가볍게 마음을 비워 보세요.
            </p>
            <button
              type="button"
              onClick={() => navigate('/trips/1/guide-archive')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              나의 체크리스트로
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-shrink-0 justify-center gap-4 sm:gap-5 lg:justify-end">
            <div className="h-52 w-36 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 sm:h-56 sm:w-44">
              <img
                src={IMAGES.home.editorial1}
                alt="여행 준비 항목을 체크리스트로 정리하는 모습"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-6 h-52 w-36 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 sm:mt-10 sm:h-56 sm:w-44">
              <img
                src={IMAGES.home.editorial2}
                alt="여행 전 체크리스트로 준비를 확인하는 모습"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 가치 제안 — 나의 체크리스트 섹션 하단, 배경 순백 */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5 text-center md:px-6">
          <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:mb-4 md:text-3xl">
            여행 준비를 빠짐없이,
            <br />
            한곳에서 완성하세요
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-500 md:text-base">
            항공·일정을 바탕으로 필요한 준비물과 방문 동선을 정리하고, 출발 전까지 체크리스트로 확인할 수 있도록 돕습니다. 흩어진
            메모와 검색에 그치지 않고, 저장부터 확인까지 이어지는 준비 흐름을 제공합니다.
          </p>
        </div>
      </section>

      {/* 푸터 — 웹과 동일 정보, 모바일은 세로 스택 */}
      <footer className="border-t border-gray-100 bg-white py-10 md:py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-10 md:px-6">
          <div className="max-w-xs">
            <div className="mb-2">
              <BrandLogo className="h-6 w-auto" />
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              항공·일정을 바탕으로 준비물과 방문 동선을 정리하고, 체크리스트로 출발 전까지 한눈에 확인할 수 있는 여행 준비
              서비스입니다.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link to="/" className="text-xs text-gray-400 transition-colors hover:text-gray-600">
                홈
              </Link>
              <a href="#" className="text-xs text-gray-400 transition-colors hover:text-gray-600">
                공지·소식
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:flex md:flex-1 md:flex-wrap md:justify-end md:gap-10">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.id} className="min-w-[140px]">
                <p className="mb-3 text-xs font-semibold tracking-wide text-gray-900 md:mb-4">{section.title}</p>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl border-t border-gray-50 px-5 pt-6 md:mt-10 md:px-6">
          <LegalFooterLinks className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs text-gray-400 md:mb-5" />
          <p className="text-center text-xs text-gray-400">© 2024 CHECKMATE. 무단 복제 및 배포를 금합니다.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
