import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'

/* ─────────────────────────── Data ─────────────────────────── */
const IMG = {
  hero:    'https://images.unsplash.com/photo-1528127269322-539801943592?w=2400&q=80&auto=format&fit=crop',
  packing: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=1600&q=80&auto=format&fit=crop',
  money:   'https://images.unsplash.com/photo-1554260570-9140fd3b7614?w=1600&q=80&auto=format&fit=crop',
  bay:     'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=2400&q=80&auto=format&fit=crop',
  lantern: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=2400&q=80&auto=format&fit=crop',
  beach:   'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80&auto=format&fit=crop',
  food:    'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=1400&q=80&auto=format&fit=crop',
  scooter: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80&auto=format&fit=crop',
  market:  'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1400&q=80&auto=format&fit=crop',
}

const CHECKLIST_ITEMS = [
  { id: 'd1', cat: '서류', label: '여권 (유효기간 6개월 이상)' },
  { id: 'd2', cat: '서류', label: '전자비자(e-VISA) 또는 도착비자' },
  { id: 'd3', cat: '서류', label: '여행 일정표·예약 확인서 출력본' },
  { id: 'd4', cat: '서류', label: '여권 사본 + 증명사진 2매' },
  { id: 'm1', cat: '환전', label: '베트남 동(VND) 환전' },
  { id: 'm2', cat: '환전', label: '트래블로그 또는 환율우대 카드' },
  { id: 'm3', cat: '환전', label: '미국 달러 예비 환전' },
  { id: 'm4', cat: '환전', label: '비상금 분산 보관' },
  { id: 'c1', cat: '의류', label: '얇은 반팔·반바지 (3~5벌)' },
  { id: 'c2', cat: '의류', label: '긴 바지 또는 가디건 (사원 방문용)' },
  { id: 'c3', cat: '의류', label: '편한 샌들 & 운동화' },
  { id: 'c4', cat: '의류', label: '수영복' },
  { id: 'c5', cat: '의류', label: '챙 넓은 모자' },
  { id: 'h1', cat: '건강', label: '선크림 SPF50+' },
  { id: 'h2', cat: '건강', label: '모기 기피제' },
  { id: 'h3', cat: '건강', label: '지사제·소화제·두통약' },
  { id: 'h4', cat: '건강', label: '상처 밴드' },
  { id: 'h5', cat: '건강', label: '마스크 & 손소독제' },
  { id: 'a1', cat: '앱',   label: 'Grab 앱 설치' },
  { id: 'a2', cat: '앱',   label: '오프라인 Google Maps' },
  { id: 'a3', cat: '앱',   label: '숙소 예약 확인서 저장' },
  { id: 'a4', cat: '앱',   label: '여행자 보험 증서' },
  { id: 'a5', cat: '앱',   label: 'Papago 번역앱' },
  { id: 'e1', cat: '전자', label: '멀티 어댑터 (A/C타입)' },
  { id: 'e2', cat: '전자', label: '보조배터리 (20,000mAh 이하)' },
  { id: 'e3', cat: '전자', label: '방수 파우치' },
  { id: 'e4', cat: '전자', label: '충전 케이블 여분' },
  { id: 'e5', cat: '전자', label: '셀카봉 또는 미니 삼각대' },
  { id: 'l1', cat: '짐',   label: '캐리어 잠금장치' },
  { id: 'l2', cat: '짐',   label: '여행용 지퍼백·압축팩' },
  { id: 'l3', cat: '짐',   label: '소형 우산·우비' },
  { id: 'l4', cat: '짐',   label: '에코백 (보조 가방)' },
]

const CATEGORIES = ['전체', '서류', '환전', '의류', '건강', '앱', '전자', '짐']

const TOC_SECTIONS = [
  { id: 'packing',   label: '01 · 짐 싸기 전 필수 체크' },
  { id: 'money',     label: '02 · 환전 & 결제' },
  { id: 'bay',       label: '03 · 잠깐, 하롱베이' },
  { id: 'apps',      label: '04 · 필수 앱 3가지' },
  { id: 'health',    label: '05 · 건강 & 안전' },
  { id: 'checklist', label: '체크리스트 저장' },
]

const APPS = [
  { name: 'Grab',          tagline: '동남아 이동의 정답',  desc: '동남아 우버. 택시보다 저렴하고 안전해요. 미터기 바가지 걱정 없음.', glyph: 'G', tone: 'teal' },
  { name: 'Google Maps',   tagline: '오프라인 길찾기',     desc: '오프라인 지도 다운로드 필수. 데이터 없어도 길찾기가 됩니다.',       glyph: 'M', tone: 'sky'  },
  { name: 'Agoda · Klook', tagline: '숙소·액티비티',       desc: '현지 최저가 확인용. 가격을 비교하며 예약하기 좋아요.',             glyph: 'A', tone: 'amber'},
]

const RELATED = [
  { country: '베트남',  title: '다낭 미케 비치 완벽 가이드',    meta: '해변 · 리조트 · 카페',      img: IMG.beach   },
  { country: '베트남',  title: '하노이 길거리 음식 버킷리스트',  meta: '쌀국수 · 반미 · 에그커피', img: IMG.food    },
  { country: '베트남',  title: '나트랑 투어 & 액티비티 추천',   meta: '스쿠버 · 섬투어 · 머드욕', img: IMG.scooter },
  { country: '여행 팁', title: '동남아 여행 공통 필수 준비물',  meta: '태국 · 베트남 · 필리핀',   img: IMG.market  },
]

const OTHER_COUNTRIES = [
  { code: 'JP', name: '일본',      en: 'Japan' },
  { code: 'TH', name: '태국',      en: 'Thailand' },
  { code: 'TW', name: '대만',      en: 'Taiwan' },
  { code: 'PH', name: '필리핀',    en: 'Philippines' },
  { code: 'ID', name: '인도네시아', en: 'Indonesia' },
  { code: 'SG', name: '싱가포르',  en: 'Singapore' },
]

/* ─────────────────────────── Hooks ─────────────────────────── */
function useReadingProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const total = (h.scrollHeight || 0) - (h.clientHeight || 0)
      setP(total > 0 ? Math.min(100, Math.max(0, (h.scrollTop / total) * 100)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return p
}

function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.cur-reveal').forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('.cur-reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0] || null)
  useEffect(() => {
    const els = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { threshold: [0.18, 0.4, 0.6], rootMargin: '-15% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join('|')])
  return active
}

function useCountUp(value, duration = 700) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    let raf = 0
    const start = prev.current, end = value, t0 = performance.now()
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - k, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  useEffect(() => { prev.current = value }, [value])
  return display
}

/* ─────────────────────────── Atoms ─────────────────────────── */
function BlurImg({ src, alt, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.complete && el.naturalWidth > 0) el.classList.add('is-loaded')
    const onload = () => el.classList.add('is-loaded')
    el.addEventListener('load', onload)
    return () => el.removeEventListener('load', onload)
  }, [])
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={'cur-img-fade w-full h-full object-cover ' + className}
    />
  )
}

function Caption({ children }) {
  return (
    <figcaption className="text-[12px] tracking-wide text-slate-500 mt-3 leading-relaxed">
      {children}
    </figcaption>
  )
}

function Kicker({ idx, label }) {
  return (
    <div className="cur-reveal flex items-center gap-3 mb-5">
      <span className="text-[10.5px] font-bold tracking-[0.24em] uppercase text-amber-600">
        № {idx}
      </span>
      <span className="h-px flex-1 max-w-[64px] bg-slate-300" />
      <span className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-slate-500">
        {label}
      </span>
    </div>
  )
}

function SectionH2({ children }) {
  return (
    <h2 className="cur-reveal text-[1.9rem] md:text-[2.6rem] leading-[1.18] font-extrabold tracking-tight text-slate-900 mb-6">
      {children}
    </h2>
  )
}

/* ─────────────────────────── Hero ─────────────────────────── */
function Hero() {
  const bgRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => {
      const y = window.scrollY
      if (titleRef.current) titleRef.current.style.transform = `translateY(${Math.min(y * 0.16, 70)}px)`
      if (bgRef.current)    bgRef.current.style.transform    = `translateY(${y * 0.3}px) scale(1.08)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative isolate overflow-hidden bg-slate-900">
      <img
        ref={bgRef}
        src={IMG.hero}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover will-change-transform"
        style={{ transform: 'scale(1.08)' }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.3) 45%, rgba(15,23,42,0.85) 100%)' }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{ background: 'linear-gradient(to top, #f3fff8 0%, rgba(243,255,248,0.4) 50%, rgba(243,255,248,0) 100%)' }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-24 pb-24 md:pt-32 md:pb-28 lg:pt-40 lg:pb-32 text-white">
        <div ref={titleRef} className="will-change-transform max-w-3xl">
          <div className="cur-reveal flex flex-wrap items-center gap-3 mb-7">
            <span className="text-[10.5px] font-bold tracking-[0.24em] uppercase text-amber-300">
              여행 가이드 · 베트남
            </span>
            <span className="h-px w-10 bg-amber-300/70" />
            <span className="font-bold text-[14px] text-white/85">VIETNAM</span>
          </div>

          <h1 className="cur-reveal font-extrabold leading-[1.1] tracking-[-0.01em] text-[2.4rem] sm:text-[3rem] md:text-[4.4rem] lg:text-[5.2rem]">
            준비는 가볍게,<br />
            <span>여행은 </span>
            <span style={{ color: '#3db4dd' }}>완벽하게</span><br />
            <span className="text-amber-300">— 베트남.</span>
          </h1>
          <p className="cur-reveal mt-6 max-w-2xl font-medium text-[16px] md:text-[19px] leading-relaxed text-white/90">
            다낭·나트랑·하노이 — 도시 셋, 짐 하나. 메이트가 정리한 필수 준비물·환전·앱 가이드를 한 번에 챙기세요.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── TOC ─────────────────────────── */
function TableOfContents({ activeId }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-slate-500 mb-5 pl-1">
          In this guide
        </div>
        <nav className="space-y-3.5 pl-4 border-l border-slate-200">
          {TOC_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={
                'cur-toc-link block text-[12.5px] leading-snug text-slate-500 hover:text-slate-800 transition ' +
                (activeId === s.id ? 'active' : '')
              }
            >
              {s.label}
            </a>
          ))}
        </nav>
        <a
          href="#checklist"
          className="mt-8 inline-flex items-center gap-1.5 font-extrabold text-[13px] text-teal-700 hover:text-teal-800"
        >
          <span>체크리스트로 바로 가기</span>
          <span className="text-amber-500" aria-hidden>→</span>
        </a>
      </div>
    </aside>
  )
}

/* ─────────────────────────── Intermission ─────────────────────────── */
function Intermission() {
  const bgRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => {
      if (!bgRef.current) return
      const r = bgRef.current.getBoundingClientRect()
      const vh = window.innerHeight || 800
      const progress = (vh - r.top) / (vh + r.height)
      bgRef.current.style.transform = `translateY(${(progress - 0.5) * 80}px) scale(1.1)`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="bay"
      data-toc
      className="cur-reveal relative -mx-4 md:mx-[calc(50%-50vw)] my-20 md:my-28 h-[68vh] min-h-[440px] overflow-hidden bg-slate-900"
    >
      <img
        ref={bgRef}
        src={IMG.bay}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        style={{ transform: 'scale(1.1)' }}
      />
      <div className="absolute inset-0 bg-slate-900/45" aria-hidden />
      <div className="relative h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-12 md:pb-16 text-white">
        <div className="text-[10.5px] font-bold tracking-[0.28em] uppercase text-amber-300 mb-4">
          잠깐 · Hạ Long Bay
        </div>
        <blockquote className="font-extrabold text-[2rem] md:text-[3.4rem] lg:text-[4rem] leading-[1.1] max-w-[22ch]">
          <span>북부 일정이라면 </span>
          <span className="text-amber-300">하롱베이 1박 크루즈</span>
          <span>는 정말 권할 만해요.</span>
        </blockquote>
        <div className="mt-5 max-w-md font-medium text-[14px] md:text-[15px] leading-relaxed text-white/85">
          하노이에서 차로 두 시간. 두 시간 이동의 값은 천 개의 석회암 그림자가 갚아 줍니다.
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── App Shelf ─────────────────────────── */
function AppShelf() {
  return (
    <div className="cur-reveal -mx-4 md:-mx-12 lg:-mx-20">
      <ul className="flex md:grid md:grid-cols-3 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory cur-no-scrollbar px-4 md:px-0 pb-2">
        {APPS.map((a, i) => {
          const toneCls =
            a.tone === 'teal'  ? 'bg-teal-50 text-teal-700' :
            a.tone === 'sky'   ? 'bg-sky-50 text-sky-700' :
                                 'bg-amber-50 text-amber-700'
          return (
            <li
              key={a.name}
              className="group snap-center shrink-0 w-[78%] md:w-auto rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:border-sky-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={'h-12 w-12 rounded-xl grid place-items-center font-extrabold text-[22px] ' + toneCls}>
                  {a.glyph}
                </div>
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-slate-400">
                  No. {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="text-[20px] font-extrabold leading-tight text-slate-900">{a.name}</div>
              <div className="mt-0.5 text-[12.5px] font-semibold text-slate-500">{a.tagline}</div>
              <p className="mt-3 font-medium text-[14px] leading-relaxed text-gray-700">{a.desc}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-[11.5px] font-extrabold tracking-wide text-teal-700">
                <span>설치하러 가기</span>
                <span aria-hidden className="text-amber-500">→</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ─────────────────────────── Article ─────────────────────────── */
function Article() {
  return (
    <article className="cur-editorial">
      {/* Section A — Packing */}
      <section id="packing" data-toc>
        <Kicker idx="01" label="Before You Pack" />
        <SectionH2>
          가볍게 챙기고,{' '}
          <span style={{ color: '#3db4dd' }}>단단하게</span> 떠나기
        </SectionH2>
        <p className="cur-drop-cap cur-reveal">
          베트남은 여름 내내 덥고 습합니다. 다낭 기준 평균 기온은 28~35°C로, 얇고 통기성 좋은 소재 위주로 챙기는 게 포인트예요. 슬리퍼와 편한 운동화는 필수이고, 사원이나 호이안 올드타운을 방문할 때를 대비해 긴 바지나 얇은 스카프도 하나쯤 가방에 넣어두면 좋습니다.
        </p>
        <p className="cur-reveal">
          짐의 핵심은 빼는 것이에요. 현지에서 사도 되는 것(저렴한 슬리퍼, 모기약 등)과 한국에서 가져가야 할 것(약, 자외선 차단제, 어댑터)을 명확히 구분해두면 짐이 절반으로 줄어듭니다.
        </p>
      </section>

      {/* Magazine break-out: image left, quote right */}
      <section className="cur-reveal relative -mx-4 md:mx-0 my-16 md:my-24 md:grid md:grid-cols-12 md:gap-10 md:items-center">
        <figure className="md:col-span-7 md:-ml-24 lg:-ml-32">
          <div className="relative overflow-hidden rounded-2xl aspect-[5/4] shadow-[0_14px_30px_rgba(13,58,76,0.18)]">
            <BlurImg src={IMG.packing} alt="옷가지를 가지런히 정리한 짐가방" />
          </div>
          <Caption>
            <span className="font-bold tracking-wider text-[10px] uppercase mr-2 text-amber-600">Pl. 01</span>
            얇은 면 셔츠 3벌·반바지 2벌·긴바지 1벌이면 다낭 5일은 충분합니다.
          </Caption>
        </figure>
        <div className="md:col-span-5 mt-7 md:mt-0 md:pl-2 px-4 md:px-0">
          <div className="font-extrabold text-[24px] md:text-[28px] leading-[1.35] text-slate-900 max-w-[24ch]">
            "수분이 많은 과일은 입국 시 반입 금지. 현지에서 더 싸고, 더 달아요."
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5">
            <span className="text-base">💡</span>
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-amber-700">짐 싸기 · 팁</span>
          </div>
        </div>
      </section>

      {/* Section B — Money */}
      <section id="money" data-toc>
        <Kicker idx="02" label="Money & Pay" />
        <SectionH2>
          동(VND), 카드, 그리고{' '}
          <span style={{ color: '#3db4dd' }}>소액 현금</span>
        </SectionH2>
        <p className="cur-reveal">
          베트남 화폐는 동(VND)이며, 1,000동이 약 50원이에요. 0이 많아 익숙해지는 데 며칠 걸리지만, "마지막 세 자리를 지우고 ÷2"가 가장 빠른 환산법입니다. 다낭·하노이 공항 환전소는 환율이 나쁘니, 시내 환전소(금은방)나 ATM을 이용하세요.
        </p>
        <p className="cur-reveal">
          트래블로그·하나머니 등 환율 우대 카드를 미리 준비하면 수수료를 크게 줄일 수 있어요. 시장이나 골목 식당은 현금만 받는 경우가 많으니 소액 현금은 꼭 챙기세요. 큰돈은 호텔 금고에, 다닐 때는 두세 군데로 나눠 보관하는 것이 안전합니다.
        </p>
      </section>

      {/* Break-out: text left, image right */}
      <section className="cur-reveal relative -mx-4 md:mx-0 my-16 md:my-24 md:grid md:grid-cols-12 md:gap-10 md:items-center">
        <div className="md:col-span-5 order-2 md:order-1 mt-7 md:mt-0 md:pr-2 px-4 md:px-0">
          <div className="font-extrabold text-teal-700 leading-none" style={{ fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
            ÷ 2
          </div>
          <p className="mt-3 font-extrabold text-[18px] md:text-[20px] leading-[1.45] text-slate-900 max-w-[28ch]">
            마지막 세 자리를 지운 뒤 반으로 —{' '}
            <br />
            <span style={{ color: '#3db4dd' }}>30,000 đ ≈ 1,500원</span>
          </p>
          <div className="mt-5 text-[11px] font-bold tracking-[0.22em] uppercase text-amber-600">
            — Field rule · 환산법
          </div>
        </div>
        <figure className="md:col-span-7 order-1 md:order-2 md:-mr-24 lg:-mr-32">
          <div className="relative overflow-hidden rounded-2xl aspect-[5/4] shadow-[0_14px_30px_rgba(13,58,76,0.18)]">
            <BlurImg src={IMG.money} alt="베트남 동(VND) 지폐와 동전" />
          </div>
          <Caption>
            <span className="font-bold tracking-wider text-[10px] uppercase mr-2 text-amber-600">Pl. 02</span>
            Hồ Chí Minh on every bill. 500,000 đ까지 0이 자그마치 다섯 개.
          </Caption>
        </figure>
      </section>

      <Intermission />

      {/* Section C — Apps */}
      <section id="apps" data-toc>
        <Kicker idx="04" label="Three Apps" />
        <SectionH2>
          휴대전화에 미리 깔아 둘{' '}
          <span style={{ color: '#3db4dd' }}>세 가지</span>
        </SectionH2>
        <p className="cur-reveal mb-10">
          여행은 누구와 가느냐가 절반, 무엇을 들고 가느냐가 나머지 절반입니다. 데이터·번역·이동을 한 번에 해결할 세 가지 앱. 출발 전 모두 깔아두고 한 번씩 켜봐 두세요.
        </p>
        <AppShelf />
      </section>

      {/* Section D — Health */}
      <section id="health" data-toc className="mt-20 md:mt-28">
        <Kicker idx="05" label="Health & Safety" />
        <SectionH2>
          잘 자고, 잘 먹고,{' '}
          <span style={{ color: '#3db4dd' }}>탈 없이</span>
        </SectionH2>
        <p className="cur-reveal">
          베트남 길거리 음식은 매력적이지만 배탈 위험도 있어요. 정장제(지사제), 소화제, 모기 기피제는 꼭 챙기세요. 여행자 보험도 출발 전 필수입니다. 일부 의료 서비스는 현금 결제가 필요하니 여유 현금도 준비하세요.
        </p>

        <aside className="cur-reveal relative my-10 rounded-2xl border border-sky-200 bg-sky-50/80 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 grid place-items-center h-9 w-9 rounded-xl bg-white shadow-sm text-lg">🦟</div>
            <div>
              <div className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-sky-700 mb-1">
                메이트가 알려드려요
              </div>
              <p className="font-extrabold text-[17px] md:text-[19px] leading-[1.55] text-sky-900">
                다낭 해변 주변은 저녁에 모기가 많아요. 기피제 + 긴팔 하나는 꼭 챙기세요.
              </p>
            </div>
          </div>
        </aside>

        <p className="cur-reveal">
          밤 외출 시에는 호텔 카드(주소 적힌 명함)를 챙기고, Grab으로 돌아오는 것이 안전합니다. 비상 시 한국 영사관 연락처는 미리 휴대전화에 저장해 두세요.
        </p>
      </section>
    </article>
  )
}

/* ─────────────────────────── Checklist ─────────────────────────── */
function ChecklistSection({ checked, toggle, onSaveAll, filter, setFilter, shake, setShake }) {
  const total = CHECKLIST_ITEMS.length
  const done = Object.values(checked).filter(Boolean).length
  const pct = Math.round((done / total) * 100)
  const pctDisplay = useCountUp(pct, 700)
  const doneDisplay = useCountUp(done, 600)
  const items = useMemo(
    () => (filter === '전체' ? CHECKLIST_ITEMS : CHECKLIST_ITEMS.filter((i) => i.cat === filter)),
    [filter],
  )

  return (
    <section id="checklist" data-toc className="relative">
      <div className="mx-auto max-w-3xl px-4 md:px-6 pt-6 pb-24">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-[0_14px_30px_rgba(13,58,76,0.10)] overflow-hidden">
          {/* Sticky save bar */}
          <div className="sticky top-14 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
            <div className="px-5 md:px-7 py-3.5 flex items-center gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="font-extrabold text-[18px] md:text-[20px] leading-none text-slate-900">
                  {doneDisplay}
                  <span className="text-slate-400 font-bold"> / {total}</span>
                </div>
                <div className="h-[10px] w-28 md:w-44 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[12px] font-extrabold tracking-wide text-teal-700">
                  {pctDisplay}
                  <span className="text-slate-400 font-bold">%</span>
                </div>
              </div>
              <button
                onClick={onSaveAll}
                className="ml-auto inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#6a4a00] font-bold text-[12.5px] tracking-wide px-4 md:px-5 py-2.5 shadow-sm shadow-amber-900/15 transition"
              >
                <span>전체 저장</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="px-5 md:px-7 pt-10 pb-2">
            <div className="cur-reveal">
              <Kicker idx="06" label="The Checklist" />
              <h2 className="font-extrabold text-[2rem] md:text-[2.6rem] leading-[1.15] tracking-tight text-slate-900 max-w-[18ch]">
                32가지,{' '}
                <span style={{ color: '#3db4dd' }}>완벽한 짐 하나</span>로
              </h2>
              <p className="mt-5 font-medium text-[15px] leading-relaxed text-gray-700 max-w-[50ch]">
                필요한 것만, 빠짐없이. 카테고리별로 골라 체크하고 저장해두면 출발 전 마지막 점검도 같은 곳에서 이어집니다.
              </p>
            </div>
          </div>

          {/* Filter chips */}
          <div className="cur-reveal px-5 md:px-7 mt-6">
            <div className="flex md:flex-wrap gap-2 overflow-x-auto cur-no-scrollbar pb-1 -mx-1 px-1">
              {CATEGORIES.map((c) => {
                const active = filter === c
                const count = c === '전체' ? total : CHECKLIST_ITEMS.filter((i) => i.cat === c).length
                return (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={
                      'shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-extrabold tracking-wide transition border ' +
                      (active
                        ? 'bg-teal-700 border-teal-700 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200 hover:text-teal-700')
                    }
                  >
                    {c}
                    <span className={'ml-1.5 font-bold text-[11px] ' + (active ? 'text-white/70' : 'text-slate-400')}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Items */}
          <ul role="list" className="px-5 md:px-7 mt-6 grid md:grid-cols-2 gap-x-8 pb-7">
            {items.map((it) => {
              const on = !!checked[it.id]
              const isShaking = shake === it.id
              return (
                <li
                  key={it.id}
                  className={'group flex items-start gap-3 border-b border-slate-100 py-3.5 cursor-pointer ' + (isShaking ? 'cur-shake' : '')}
                  onClick={() => {
                    toggle(it.id)
                    setShake(it.id)
                    setTimeout(() => setShake(null), 320)
                  }}
                  aria-label={it.label}
                >
                  <span
                    className={
                      'relative mt-0.5 h-5 w-5 shrink-0 rounded-md border transition-all duration-200 ' +
                      (on
                        ? 'bg-teal-700 border-teal-700'
                        : 'border-slate-300 group-hover:border-teal-500 bg-white')
                    }
                  >
                    {on && (
                      <svg
                        viewBox="0 0 24 24"
                        className="absolute inset-0 m-auto h-3.5 w-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-amber-600 mr-2">{it.cat}</span>
                    <span className={'font-medium text-[14.5px] leading-snug transition-colors ' + (on ? 'text-slate-400' : 'text-slate-800')}>
                      <span className={'cur-strike-line ' + (on ? 'cur-strike-on' : '')}>{it.label}</span>
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>

          {/* Bottom CTAs */}
          <div className="cur-reveal px-5 md:px-7 pb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={onSaveAll}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#6a4a00] font-bold text-[14px] tracking-wide px-6 py-3.5 shadow-sm shadow-amber-900/15 active:scale-[0.98] transition w-full"
            >
              ✅ 체크리스트 저장하기
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-800 font-bold text-[14px] tracking-wide px-6 py-3.5 shadow-sm active:scale-[0.98] transition w-full">
              ✈️ 내 여행 맞춤 체크리스트
            </button>
          </div>
          <p className="px-5 md:px-7 pb-7 text-center font-medium text-[12.5px] text-slate-500">
            AI가 여행 일정·동행·스타일에 맞춰 항목을 추가해 드려요.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── CTA Banner ─────────────────────────── */
function CtaBanner() {
  return (
    <section className="relative overflow-hidden">
      <img src={IMG.lantern} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(17,94,89,0.85) 0%, rgba(15,118,110,0.75) 50%, rgba(7,89,133,0.85) 100%)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28 text-white">
        <div className="cur-reveal grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="text-[10.5px] font-bold tracking-[0.26em] uppercase text-amber-300 mb-5">
              나만의 베트남, 메이트가 함께
            </div>
            <h2 className="font-extrabold text-[2rem] md:text-[3.4rem] leading-[1.1] tracking-tight max-w-[16ch]">
              지금 바로{' '}
              <span className="text-amber-300">맞춤 체크리스트</span>를 만들어 보세요
            </h2>
            <p className="mt-5 font-medium text-[15px] md:text-[16.5px] leading-relaxed text-white/85 max-w-[44ch]">
              여행 날짜·동행·스타일을 분석해 메이트가 딱 맞는 준비물·일정을 추천해 드려요.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col gap-3 md:items-end">
            <Link
              to="/trips/new/destination"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#6a4a00] font-bold text-[14px] tracking-wide px-7 py-3.5 shadow-md shadow-amber-900/20 transition w-full md:w-auto active:scale-[0.98]"
            >
              여행 준비 시작하기 →
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-white/40 hover:border-white text-white font-bold text-[13px] tracking-wide px-7 py-3.5 transition w-full md:w-auto"
            >
              큐레이션 더 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── Related ─────────────────────────── */
function Related() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28">
        <div className="cur-reveal flex items-end justify-between mb-10 md:mb-14 gap-6">
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.26em] uppercase text-amber-600 mb-3">
              Keep reading · 함께 보면 좋은 글
            </div>
            <h2 className="font-extrabold text-[1.9rem] md:text-[2.6rem] leading-[1.1] tracking-tight text-slate-900 max-w-[20ch]">
              베트남, 더 깊게{' '}
              <span style={{ color: '#3db4dd' }}>알고 떠나기</span>
            </h2>
          </div>
          <a href="#" className="hidden md:inline-flex items-center gap-1.5 text-[12.5px] font-extrabold tracking-wide text-teal-700 hover:text-teal-800">
            전체 가이드 보기{' '}
            <span className="text-amber-500" aria-hidden>→</span>
          </a>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {RELATED.map((r, i) => (
            <li key={i} className="cur-reveal group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-4 shadow-sm">
                <BlurImg src={r.img} alt={r.title} className="group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-600">{r.country}</div>
              <h3 className="mt-1.5 text-[15.5px] md:text-[17px] leading-tight font-extrabold text-slate-900 group-hover:text-teal-700 transition">
                {r.title}
              </h3>
              <div className="mt-1 text-[11.5px] font-semibold text-slate-500">{r.meta}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ─────────────────────────── Footer ─────────────────────────── */
function PageFooter() {
  return (
    <footer className="bg-white/60 backdrop-blur border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Link to="/" className="font-extrabold text-[24px] tracking-tight text-teal-700">
              CHECKMATE
            </Link>
            <p className="mt-4 font-extrabold text-[18px] leading-snug text-slate-800 max-w-[26ch]">
              준비는 가볍게, 여행은{' '}
              <span style={{ color: '#3db4dd' }}>완벽하게</span>.
            </p>
            <p className="mt-2 font-medium text-[13px] text-gray-600 max-w-[36ch] leading-relaxed">
              저장부터 체크까지 이어지는 여행 준비. CHECKMATE가 동행합니다.
            </p>
          </div>
          <div className="md:col-span-4">
            <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-slate-500 mb-4">
              다른 국가 가이드
            </div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {OTHER_COUNTRIES.map((c) => (
                <li key={c.code}>
                  <a href="#" className="group inline-flex items-baseline gap-2">
                    <span className="font-extrabold text-[15px] text-slate-800 group-hover:text-teal-700 transition">{c.name}</span>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-teal-500 transition">{c.en}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-slate-500 mb-4">
              About
            </div>
            <ul className="space-y-2.5 text-[13px] text-gray-700">
              <li><a href="#" className="hover:text-gray-900">서비스 소개</a></li>
              <li><a href="#" className="hover:text-gray-900">에디터</a></li>
              <li><a href="#" className="hover:text-gray-900">제휴·문의</a></li>
              <li><Link to="/privacy" className="hover:text-gray-900">개인정보 처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-slate-500">
          <span>© 2026 CHECKMATE</span>
          <span className="font-medium">베트남 에디션 · 2026.05</span>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */
export default function CurationArticlePage() {
  const progress = useReadingProgress()
  const [checked, setChecked] = useState({})
  const [filter, setFilter] = useState('전체')
  const [shake, setShake] = useState(null)
  const activeId = useActiveSection(TOC_SECTIONS.map((s) => s.id))
  useReveal()

  const toggle = useCallback((id) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }))
  }, [])

  const onSaveAll = useCallback(() => {
    const allOn = CHECKLIST_ITEMS.every((it) => checked[it.id])
    const next = {}
    CHECKLIST_ITEMS.forEach((it) => { next[it.id] = !allOn })
    setChecked(next)
  }, [checked])

  return (
    <>
      <style>{`
        /* Page background */
        .cur-page-bg {
          background-color: #f3fff8;
          background-image:
            radial-gradient(circle at 8% 12%,  rgba(117,221,255,0.32) 0%, rgba(117,221,255,0) 22%),
            radial-gradient(circle at 80% 16%, rgba(248,215,116,0.30) 0%, rgba(248,215,116,0) 26%),
            radial-gradient(circle at 12% 60%, rgba(117,221,255,0.16) 0%, rgba(117,221,255,0) 26%),
            radial-gradient(circle at 70% 78%, rgba(251,222,132,0.18) 0%, rgba(251,222,132,0) 32%),
            linear-gradient(180deg, #e8fffe 0%, #f4fff1 52%, #fff9e8 100%);
        }

        /* Reveal on scroll */
        .cur-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 1.1s cubic-bezier(.22,1,.36,1), transform 1.1s cubic-bezier(.22,1,.36,1);
        }
        .cur-reveal.is-in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .cur-reveal { opacity: 1; transform: none; transition: none; }
        }

        /* Image blur-in */
        .cur-img-fade {
          opacity: 0;
          filter: blur(14px);
          transform: scale(1.03);
          transition: opacity 1.1s ease, filter 1.1s ease, transform 1.4s ease;
        }
        .cur-img-fade.is-loaded { opacity: 1; filter: blur(0); transform: scale(1); }

        /* Shake on check */
        @keyframes cur-shake {
          0%, 100% { transform: translateX(0); }
          30%       { transform: translateX(-2px); }
          70%       { transform: translateX(2px); }
        }
        .cur-shake { animation: cur-shake 0.32s ease both; }

        /* Hide scrollbar */
        .cur-no-scrollbar { scrollbar-width: none; }
        .cur-no-scrollbar::-webkit-scrollbar { display: none; }

        /* TOC active indicator */
        .cur-toc-link { position: relative; transition: color .25s ease; }
        .cur-toc-link::before {
          content: '';
          position: absolute; left: -14px; top: 50%;
          width: 6px; height: 6px; border-radius: 9999px;
          background: #cbd5e1; transform: translateY(-50%);
          transition: background .25s ease, transform .25s ease;
        }
        .cur-toc-link.active { color: #0f766e; font-weight: 700; }
        .cur-toc-link.active::before { background: #f59e0b; transform: translateY(-50%) scale(1.5); }

        /* Strike-through on check */
        .cur-strike-line {
          background-image: linear-gradient(currentColor, currentColor);
          background-position: 0 50%;
          background-size: 0% 1.5px;
          background-repeat: no-repeat;
          transition: background-size .35s ease;
        }
        .cur-strike-on { background-size: 100% 1.5px; }

        /* Drop cap */
        .cur-drop-cap::first-letter {
          float: left;
          font-family: 'SeoulNotice', 'Inter', system-ui, sans-serif;
          font-size: 4.6rem;
          line-height: 0.92;
          font-weight: 900;
          color: #0f766e;
          margin: 0.34rem 0.7rem -0.1rem -0.06rem;
        }

        /* Editorial body text */
        .cur-editorial p {
          font-weight: 500;
          font-size: 1.0625rem;
          line-height: 1.85;
          letter-spacing: -0.003em;
          color: #1f2937;
        }
        @media (min-width: 768px) {
          .cur-editorial p { font-size: 1.125rem; line-height: 1.9; }
        }
        .cur-editorial p + p { margin-top: 1.3em; }
      `}</style>

      {/* Reading progress bar — fixed above the sticky RootLayout header */}
      <div className="fixed top-0 left-0 right-0 z-[70] h-[2px] bg-slate-200/60">
        <div
          className="h-full origin-left bg-gradient-to-r from-teal-700 via-teal-500 to-amber-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="cur-page-bg" style={{ wordBreak: 'keep-all' }}>
        <Hero />

        {/* Article + TOC */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-12 xl:gap-20">
          <div className="min-w-0 max-w-3xl mx-auto w-full lg:mx-0">
            <Article />
          </div>
          <TableOfContents activeId={activeId} />
        </div>

        <ChecklistSection
          checked={checked}
          toggle={toggle}
          onSaveAll={onSaveAll}
          filter={filter}
          setFilter={setFilter}
          shake={shake}
          setShake={setShake}
        />

        <CtaBanner />
        <Related />
        <PageFooter />
      </div>
    </>
  )
}
