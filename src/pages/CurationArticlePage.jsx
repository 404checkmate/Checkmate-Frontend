import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import vietnam from '@/data/curation/vietnam'
import japan from '@/data/curation/japan'
import thailand from '@/data/curation/thailand'
import usa from '@/data/curation/usa'

const DATA_MAP = { vietnam, japan, thailand, usa }

/* ─── flat checklist items ─── */
function buildFlatItems(checklist) {
  return checklist.flatMap((group, gi) =>
    group.items.map((label, ii) => ({ id: `${gi}-${ii}`, cat: group.cat, label }))
  )
}

/* ════════════════════════════════════════════
   Hooks
════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════
   Atoms
════════════════════════════════════════════ */
function BlurImg({ src, alt, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.complete && el.naturalWidth > 0) el.classList.add('is-loaded')
    const onload = () => el.classList.add('is-loaded')
    el.addEventListener('load', onload)
    return () => el.removeEventListener('load', onload)
  }, [src])
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

function TipBox({ icon, body }) {
  return (
    <aside className="cur-reveal relative my-10 rounded-2xl border border-sky-200 bg-sky-50/80 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl">{icon}</span>
          <span className="text-xs font-extrabold text-teal-600">Mate Tip!</span>
        </div>
        <p className="font-extrabold text-[17px] md:text-[19px] leading-[1.55] text-sky-900">
          {body}
        </p>
      </div>
    </aside>
  )
}

/* ════════════════════════════════════════════
   Hero
════════════════════════════════════════════ */
function Hero({ data }) {
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
    <section className="relative isolate overflow-hidden w-full bg-slate-900">
      <img
        ref={bgRef}
        src={data.photos.hero}
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
              여행 가이드 · {data.name}
            </span>
            <span className="h-px w-10 bg-amber-300/70" />
            <span className="font-bold text-[14px] text-white/85">{data.name.toUpperCase()}</span>
          </div>

          <h1 className="cur-reveal font-extrabold leading-[1.1] tracking-[-0.01em] text-[2.4rem] sm:text-[3rem] md:text-[4.4rem] lg:text-[5.2rem]">
            {data.hero.title.replace(/[🌴🗼🐘🗽]/gu, '').trim()}
          </h1>
          <p className="cur-reveal mt-6 max-w-2xl font-medium text-[16px] md:text-[19px] leading-relaxed text-white/90">
            {data.hero.subtitle}
          </p>

          {/* City chips */}
          <div className="cur-reveal mt-8 flex flex-wrap items-center gap-2">
            <span className="text-4xl">{data.flag}</span>
            {data.cities.map((city) => (
              <span
                key={city}
                className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-semibold text-white/90 backdrop-blur-sm"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   TOC
════════════════════════════════════════════ */
function TableOfContents({ sections, activeId }) {
  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <div className="sticky top-24 space-y-1">
        <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-slate-400 mb-3">
          IN THIS GUIDE
        </div>
        {sections.map((s, i) => {
          const isActive = activeId === `section-${s.id}`
          return (
            <a
              key={s.id}
              href={`#section-${s.id}`}
              className={
                'flex items-center gap-2 py-1.5 text-sm transition-colors group ' +
                (isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-teal-600')
              }
            >
              <span className={'text-xs shrink-0 ' + (isActive ? 'text-teal-400' : 'text-slate-300 group-hover:text-teal-400')}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="leading-snug">{s.title}</span>
            </a>
          )
        })}
        <a
          href="#checklist"
          className={'flex items-center gap-2 py-1.5 text-sm font-bold transition-colors mt-2 ' +
            (activeId === 'checklist' ? 'text-teal-500' : 'text-teal-600 hover:text-teal-500')}
        >
          → 체크리스트 저장
        </a>
      </div>
    </aside>
  )
}

/* ════════════════════════════════════════════
   App Shelf
════════════════════════════════════════════ */
function AppShelf({ apps }) {
  const TONES = ['teal', 'sky', 'amber', 'teal']
  return (
    <div className="cur-reveal">
      <ul className="grid grid-cols-2 gap-3">
        {apps.map((a, i) => {
          const tone = TONES[i % TONES.length]
          const toneCls =
            tone === 'teal'  ? 'bg-teal-50 text-teal-700' :
            tone === 'sky'   ? 'bg-sky-50 text-sky-700' :
                               'bg-amber-50 text-amber-700'
          return (
            <li
              key={a.name}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:border-sky-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={'h-12 w-12 rounded-xl grid place-items-center font-extrabold text-[22px] ' + toneCls}>
                  {a.emoji}
                </div>
                <div className="flex items-center gap-1.5">
                  {a.badge && (
                    <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {a.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-slate-400">
                    No. {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="text-[20px] font-extrabold leading-tight text-slate-900">{a.name}</div>
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

/* ════════════════════════════════════════════
   InlineCheckItem
════════════════════════════════════════════ */
function InlineCheckItem({ item }) {
  const [checked, setChecked] = useState(false)
  return (
    <div
      className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer"
      onClick={() => setChecked((v) => !v)}
    >
      <span
        className={
          'relative mt-0.5 h-5 w-5 shrink-0 rounded-md border transition-all duration-200 ' +
          (checked ? 'bg-teal-700 border-teal-700' : 'border-slate-300 bg-white')
        }
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-amber-600 mr-2">{item.cat}</span>
        <span className={'font-medium text-[14.5px] leading-snug transition-colors ' + (checked ? 'line-through text-slate-400' : 'text-slate-800')}>
          {item.label}
        </span>
      </span>
    </div>
  )
}

/* ════════════════════════════════════════════
   Article
════════════════════════════════════════════ */
function Article({ data }) {
  const KICKER_LABELS = ['Before You Pack', 'Money & Pay', 'Must-Have Apps', 'Health & Safety', 'Food & Culture', 'What to Know']

  return (
    <article className="cur-editorial">
      {data.sections.map((section, idx) => {
        const isAppsSection = section.id === 'apps'
        const imageLeft = idx % 2 === 0
        const paragraphs = section.body.split('\n\n').filter(Boolean)
        const relatedItems = section.relatedCats
          ? data.checklist
              .filter((g) => section.relatedCats.includes(g.cat))
              .flatMap((g) => g.items.map((label) => ({ cat: g.cat, label })))
          : []

        return (
          <div key={section.id}>
            <section id={`section-${section.id}`} data-toc className={idx > 0 ? 'mt-20 md:mt-28' : ''}>
              <Kicker idx={String(idx + 1).padStart(2, '0')} label={KICKER_LABELS[idx] || 'Guide'} />
              <SectionH2>
                {section.icon} {section.title}
              </SectionH2>

              {paragraphs.map((p, pi) => (
                <p
                  key={pi}
                  className={
                    'cur-reveal' +
                    (idx === 0 && pi === 0 ? ' cur-drop-cap' : '') +
                    (isAppsSection && pi === paragraphs.length - 1 ? ' mb-10' : '')
                  }
                >
                  {p}
                </p>
              ))}

              {isAppsSection && <AppShelf apps={data.apps} />}

              {section.tip && (
                <TipBox
                  icon={section.tip.icon}
                  body={section.tip.body}
                />
              )}

              {relatedItems.length > 0 && (
                <div className="mt-4 rounded-xl bg-white border border-slate-100 p-4">
                  <div className="text-xs font-bold text-slate-400 mb-2">이 섹션 체크리스트</div>
                  {relatedItems.map((item, i) => (
                    <InlineCheckItem key={i} item={item} />
                  ))}
                </div>
              )}
            </section>

            {/* Magazine breakout image — skip for apps section */}
            {!isAppsSection && section.photo && (
              <section className="cur-reveal relative -mx-4 md:mx-0 my-16 md:my-24 md:grid md:grid-cols-12 md:gap-10 md:items-center">
                {imageLeft ? (
                  <>
                    <figure className="md:col-span-7 md:-ml-24 lg:-ml-32">
                      <div className="relative overflow-hidden rounded-2xl aspect-[5/4] shadow-[0_14px_30px_rgba(13,58,76,0.18)]">
                        <BlurImg src={section.photo} alt={section.title} />
                      </div>
                      <Caption>
                        <span className="font-bold tracking-wider text-[10px] uppercase mr-2 text-amber-600">
                          Pl. {String(idx + 1).padStart(2, '0')}
                        </span>
                        {section.photoCaption}
                      </Caption>
                    </figure>
                    <div className="md:col-span-5 mt-7 md:mt-0 md:pl-2 px-4 md:px-0">
                      <div className="font-extrabold text-[22px] md:text-[26px] leading-[1.4] text-slate-900 max-w-[24ch]">
                        "{section.photoCaption}"
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5">
                        <span className="text-base">{section.icon}</span>
                        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-amber-700">
                          {section.title} · 팁
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="md:col-span-5 order-2 md:order-1 mt-7 md:mt-0 md:pr-2 px-4 md:px-0">
                      <div className="font-extrabold text-[22px] md:text-[26px] leading-[1.4] text-slate-900 max-w-[24ch]">
                        "{section.photoCaption}"
                      </div>
                      <div className="mt-5 text-[11px] font-bold tracking-[0.22em] uppercase text-amber-600">
                        — {data.name} · 여행 팁
                      </div>
                    </div>
                    <figure className="md:col-span-7 order-1 md:order-2 md:-mr-24 lg:-mr-32">
                      <div className="relative overflow-hidden rounded-2xl aspect-[5/4] shadow-[0_14px_30px_rgba(13,58,76,0.18)]">
                        <BlurImg src={section.photo} alt={section.title} />
                      </div>
                      <Caption>
                        <span className="font-bold tracking-wider text-[10px] uppercase mr-2 text-amber-600">
                          Pl. {String(idx + 1).padStart(2, '0')}
                        </span>
                        {section.photoCaption}
                      </Caption>
                    </figure>
                  </>
                )}
              </section>
            )}
          </div>
        )
      })}
    </article>
  )
}

/* ════════════════════════════════════════════
   Checklist
════════════════════════════════════════════ */
function ChecklistSection({ data, checked, toggle, onSaveAll, filter, setFilter, shake, setShake }) {
  const flatItems = useMemo(() => buildFlatItems(data.checklist), [data])
  const categories = useMemo(() => ['전체', ...data.checklist.map((g) => g.cat)], [data])
  const total = flatItems.length
  const done = Object.values(checked).filter(Boolean).length
  const pct = Math.round((done / total) * 100)
  const pctDisplay = useCountUp(pct, 700)
  const doneDisplay = useCountUp(done, 600)
  const items = useMemo(
    () => (filter === '전체' ? flatItems : flatItems.filter((i) => i.cat === filter)),
    [filter, flatItems],
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
              <Kicker idx={String(data.sections.length + 1).padStart(2, '0')} label="The Checklist" />
              <h2 className="font-extrabold text-[2rem] md:text-[2.6rem] leading-[1.15] tracking-tight text-slate-900 max-w-[18ch]">
                {total}가지,{' '}
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
              {categories.map((c) => {
                const active = filter === c
                const count = c === '전체' ? total : flatItems.filter((i) => i.cat === c).length
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
                      (on ? 'bg-teal-700 border-teal-700' : 'border-slate-300 group-hover:border-teal-500 bg-white')
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
            <Link
              to="/trips/new/destination"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-800 font-bold text-[14px] tracking-wide px-6 py-3.5 shadow-sm active:scale-[0.98] transition w-full"
            >
              ✈️ 내 여행 맞춤 체크리스트
            </Link>
          </div>
          <p className="px-5 md:px-7 pb-7 text-center font-medium text-[12.5px] text-slate-500">
            AI가 여행 일정·동행·스타일에 맞춰 항목을 추가해 드려요.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   CTA Banner
════════════════════════════════════════════ */
function CtaBanner({ data }) {
  const bgImg = data.photos.sections[data.photos.sections.length - 1] || data.photos.hero
  return (
    <section className="relative overflow-hidden">
      <img src={bgImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(17,94,89,0.88) 0%, rgba(15,118,110,0.78) 50%, rgba(7,89,133,0.88) 100%)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28 text-white">
        <div className="cur-reveal grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="text-[10.5px] font-bold tracking-[0.26em] uppercase text-amber-300 mb-5">
              나만의 {data.name}, 메이트가 함께
            </div>
            <h2 className="font-extrabold text-[2rem] md:text-[3.4rem] leading-[1.1] tracking-tight max-w-[16ch]">
              나만의 {data.name} 여행 체크리스트,<br />
              지금 바로 만들어보세요 🗺️
            </h2>
            <p className="mt-5 font-medium text-[15px] md:text-[16.5px] leading-relaxed text-white/85 max-w-[44ch]">
              {data.footerCta.subtitle}
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
              다른 가이드 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   Related (Other Countries)
════════════════════════════════════════════ */
function Related({ currentCode }) {
  const others = Object.values(DATA_MAP).filter((d) => d.code !== currentCode)
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28">
        <div className="cur-reveal flex items-end justify-between mb-10 md:mb-14 gap-6">
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.26em] uppercase text-amber-600 mb-3">
              Keep reading · 함께 보면 좋은 글
            </div>
            <h2 className="font-extrabold text-[1.9rem] md:text-[2.6rem] leading-[1.1] tracking-tight text-slate-900 max-w-[20ch]">
              다른 여행지도 같이 준비해볼까요? ✈️
            </h2>
          </div>
          <Link to="/" className="hidden md:inline-flex items-center gap-1.5 text-[12.5px] font-extrabold tracking-wide text-teal-700 hover:text-teal-800">
            홈으로 가기{' '}
            <span className="text-amber-500" aria-hidden>→</span>
          </Link>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
          {others.map((d) => (
            <li key={d.code} className="cur-reveal group">
              <Link to={`/guide/${d.code}`} className="block">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4 shadow-sm">
                  <BlurImg
                    src={d.photos.hero}
                    alt={d.name}
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-2xl">{d.flag}</span>
                    <span className="font-extrabold text-white text-[15px]">{d.name}</span>
                  </div>
                </div>
                <h3 className="text-[14.5px] md:text-[16px] leading-tight font-extrabold text-slate-900 group-hover:text-teal-700 transition">
                  {d.hero.title}
                </h3>
                <div className="mt-1 text-[11.5px] font-semibold text-slate-500">
                  {d.cities.slice(0, 3).join(' · ')}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   Footer
════════════════════════════════════════════ */
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
              준비는 <span style={{ color: '#FFB901' }}>가볍게</span>, 여행은{' '}
              <span style={{ color: '#3db4dd' }}>완벽하게</span>.
            </p>
            <p className="mt-2 font-medium text-[13px] text-gray-600 max-w-[36ch] leading-relaxed">
              저장부터 체크까지 이어지는 여행 준비. CHECKMATE가 동행합니다.
            </p>
          </div>
          <div className="md:col-span-4">
            <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-slate-500 mb-4">
              국가별 여행 가이드
            </div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {Object.values(DATA_MAP).map((d) => (
                <li key={d.code}>
                  <Link to={`/guide/${d.code}`} className="group inline-flex items-baseline gap-2">
                    <span className="text-base">{d.flag}</span>
                    <span className="font-extrabold text-[15px] text-slate-800 group-hover:text-teal-700 transition">{d.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-slate-500 mb-4">
              About
            </div>
            <ul className="space-y-2.5 text-[13px] text-gray-700">
              <li><Link to="/" className="hover:text-gray-900">서비스 소개</Link></li>
              <li><Link to="/trips/new/destination" className="hover:text-gray-900">여행 준비 시작</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900">개인정보 처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-slate-500">
          <span>© 2026 CHECKMATE</span>
          <span className="font-medium">Travel Guide · 2026.05</span>
        </div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════
   Content (hooks live here — called only when data exists)
════════════════════════════════════════════ */
function CurationArticleContent({ data }) {
  const progress = useReadingProgress()
  const [checked, setChecked] = useState({})
  const [filter, setFilter] = useState('전체')
  const [shake, setShake] = useState(null)

  const tocSectionIds = useMemo(
    () => [...data.sections.map((s) => `section-${s.id}`), 'checklist'],
    [data],
  )
  const activeId = useActiveSection(tocSectionIds)
  useReveal()

  const toggle = useCallback((id) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }))
  }, [])

  const flatItems = useMemo(() => buildFlatItems(data.checklist), [data])

  const onSaveAll = useCallback(() => {
    const allOn = flatItems.every((it) => checked[it.id])
    const next = {}
    flatItems.forEach((it) => { next[it.id] = !allOn })
    setChecked(next)
  }, [checked, flatItems])

  return (
    <>
      <style>{`
        .cur-page-bg {
          background-color: #f3fff8;
          background-image:
            radial-gradient(circle at 8% 12%,  rgba(117,221,255,0.32) 0%, rgba(117,221,255,0) 22%),
            radial-gradient(circle at 80% 16%, rgba(248,215,116,0.30) 0%, rgba(248,215,116,0) 26%),
            radial-gradient(circle at 12% 60%, rgba(117,221,255,0.16) 0%, rgba(117,221,255,0) 26%),
            radial-gradient(circle at 70% 78%, rgba(251,222,132,0.18) 0%, rgba(251,222,132,0) 32%),
            linear-gradient(180deg, #e8fffe 0%, #f4fff1 52%, #fff9e8 100%);
        }
        .cur-reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity 1.1s cubic-bezier(.22,1,.36,1), transform 1.1s cubic-bezier(.22,1,.36,1);
        }
        .cur-reveal.is-in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) { .cur-reveal { opacity: 1; transform: none; transition: none; } }

        .cur-img-fade { opacity: 0; filter: blur(14px); transform: scale(1.03); transition: opacity 1.1s ease, filter 1.1s ease, transform 1.4s ease; }
        .cur-img-fade.is-loaded { opacity: 1; filter: blur(0); transform: scale(1); }

        @keyframes cur-shake { 0%,100% { transform: translateX(0); } 30% { transform: translateX(-2px); } 70% { transform: translateX(2px); } }
        .cur-shake { animation: cur-shake 0.32s ease both; }

        .cur-no-scrollbar { scrollbar-width: none; }
        .cur-no-scrollbar::-webkit-scrollbar { display: none; }

        .cur-toc-link { position: relative; transition: color .25s ease; }
        .cur-toc-link::before { content: ''; position: absolute; left: -14px; top: 50%; width: 6px; height: 6px; border-radius: 9999px; background: #cbd5e1; transform: translateY(-50%); transition: background .25s ease, transform .25s ease; }
        .cur-toc-link.active { color: #0f766e; font-weight: 700; }
        .cur-toc-link.active::before { background: #f59e0b; transform: translateY(-50%) scale(1.5); }

        .cur-strike-line { background-image: linear-gradient(currentColor, currentColor); background-position: 0 50%; background-size: 0% 1.5px; background-repeat: no-repeat; transition: background-size .35s ease; }
        .cur-strike-on { background-size: 100% 1.5px; }

        .cur-drop-cap::first-letter { float: left; font-family: 'SeoulNotice','Inter',system-ui,sans-serif; font-size: 4.6rem; line-height: 0.92; font-weight: 900; color: #0f766e; margin: 0.34rem 0.7rem -0.1rem -0.06rem; }

        .cur-editorial p { font-weight: 500; font-size: 1.0625rem; line-height: 1.85; letter-spacing: -0.003em; color: #1f2937; }
        @media (min-width: 768px) { .cur-editorial p { font-size: 1.125rem; line-height: 1.9; } }
        .cur-editorial p + p { margin-top: 1.3em; }
      `}</style>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[70] h-[2px] bg-slate-200/60">
        <div
          className="h-full origin-left bg-gradient-to-r from-teal-700 via-teal-500 to-amber-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="cur-page-bg overflow-x-hidden" style={{ wordBreak: 'keep-all' }}>
        <Hero data={data} />

        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
          <div className="flex gap-12 items-start">
            <div className="flex-1 min-w-0 max-w-2xl mx-auto overflow-x-hidden">
              <Article data={data} />
            </div>
            <TableOfContents sections={data.sections} activeId={activeId} />
          </div>
        </div>

        <ChecklistSection
          data={data}
          checked={checked}
          toggle={toggle}
          onSaveAll={onSaveAll}
          filter={filter}
          setFilter={setFilter}
          shake={shake}
          setShake={setShake}
        />

        <CtaBanner data={data} />
        <Related currentCode={data.code} />
        <PageFooter />
      </div>
    </>
  )
}

/* ════════════════════════════════════════════
   Entry — route guard then content
════════════════════════════════════════════ */
export default function CurationArticlePage() {
  const { country } = useParams()
  const data = DATA_MAP[country]
  if (!data) return <Navigate to="/guide/vietnam" replace />
  return <CurationArticleContent data={data} />
}
