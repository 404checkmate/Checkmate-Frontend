import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { createTrip } from '@/api/trips'
import { createGuideArchive } from '@/api/guideArchives'
import { saveActiveTripId } from '@/utils/activeTripIdStorage'
import { buildCurationArchiveSnapshot } from '@/utils/tripSearchUtils'
import { saveEntryChecklistChecks } from '@/utils/guideArchiveEntryChecklistStorage'

// 큐레이션 코드 → 여행 자동생성에 쓸 기본 목적지 정보
const CURATION_COUNTRY_MAP = {
  vietnam:  { country: '베트남', countryCode: 'VN', city: '호치민', iata: 'SGN' },
  japan:    { country: '일본',   countryCode: 'JP', city: '도쿄',   iata: 'NRT' },
  thailand: { country: '태국',   countryCode: 'TH', city: '방콕',   iata: 'BKK' },
  usa:      { country: '미국',   countryCode: 'US', city: '로스앤젤레스', iata: 'LAX' },
}
const modules = import.meta.glob(
  '/src/data/curation/*.js',
  { eager: true }
)
const DATA_MAP = Object.fromEntries(
  Object.entries(modules)
    .filter(([path]) => !path.includes('template'))
    .map(([path, mod]) => {
      const code = path.match(/\/(\w+)\.js$/)[1]
      return [code, mod.default]
    })
)

/* ─── flat checklist items ─── */
function buildFlatItems(checklist) {
  return checklist.flatMap((group, gi) =>
    group.items.map((label, ii) => ({ id: `${gi}-${ii}`, cat: group.cat, prepType: group.prepType || 'item', label }))
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
    const onerror = () => {
      el.style.display = 'none'
      el.parentElement?.classList.add('img-error')
    }
    el.addEventListener('load', onload)
    el.addEventListener('error', onerror)
    return () => {
      el.removeEventListener('load', onload)
      el.removeEventListener('error', onerror)
    }
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
      <span className="text-[11px] font-bold tracking-[0.20em] uppercase text-amber-600">
        № {idx}
      </span>
      <span className="h-px flex-1 max-w-[64px] bg-slate-300" />
      <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-500">
        {label}
      </span>
    </div>
  )
}

function SectionH2({ children }) {
  return (
    <h2 className="cur-reveal text-[1.6rem] md:text-[2.1rem] leading-[1.2] font-extrabold tracking-[-0.02em] text-slate-900 mb-6">
      {children}
    </h2>
  )
}

function TipBox({ icon, body }) {
  return (
    <aside
      className="cur-reveal cur-tipbox my-5 rounded-2xl border bg-white"
      style={{ borderColor: '#e0ede6' }}
    >
      <div
        className="flex items-center gap-3 px-3.5 py-3 min-[480px]:gap-4 min-[480px]:px-4 min-[480px]:py-3.5 md:gap-5 md:px-5 md:py-4"
        style={{ minHeight: '44px' }}
      >
        {/* Icon badge */}
        <div
          className="flex shrink-0 items-center justify-center rounded-xl"
          style={{
            background: '#e6f9f0',
            width: 'clamp(32px, 8vw, 48px)',
            height: 'clamp(32px, 8vw, 48px)',
          }}
        >
          <span style={{ fontSize: 'clamp(16px, 4vw, 22px)' }}>{icon}</span>
        </div>

        {/* Vertical divider */}
        <div className="self-stretch" style={{ width: '1px', background: '#e0ede6', flexShrink: 0 }} />

        {/* Text */}
        <div>
          <span
            className="block font-extrabold uppercase tracking-[0.16em] mb-1"
            style={{ fontSize: 'clamp(10px, 2.5vw, 11px)', color: '#2dba76' }}
          >
            Mate Tip
          </span>
          <p
            className="font-medium leading-[1.65]"
            style={{ fontSize: 'clamp(10px, 3.5vw, 15px)', color: '#3a4a40' }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </div>
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
        onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
        style={{
          transform: 'scale(1.08)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)'
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.45) 50%, rgba(15,23,42,0.1) 80%, rgba(15,23,42,0) 100%)' }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3"
        style={{ background: 'linear-gradient(to top, #e8fffe 0%, rgba(232,255,254,0.85) 25%, rgba(232,255,254,0.4) 60%, rgba(232,255,254,0) 100%)' }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-24 pb-36 md:pt-32 md:pb-44 lg:pt-40 lg:pb-52 text-white">
        <div ref={titleRef} className="will-change-transform max-w-3xl">
          <div className="cur-reveal flex flex-wrap items-center gap-3 mb-7">
            <span className="text-[11px] font-bold tracking-[0.20em] uppercase text-amber-300">
              여행 가이드 · {data.name}
            </span>
            <span className="h-px w-10 bg-amber-300/70" />
          </div>

          <h1 className="cur-reveal font-extrabold leading-[1.1] tracking-[-0.02em] text-[2rem] sm:text-[2.6rem] md:text-[3.4rem] lg:text-[4rem]">
            {data.hero.title.replace(/[🌴🗼🐘🗽]/gu, '').trim().split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
          <p className="cur-reveal mt-6 max-w-2xl lg:max-w-none font-medium text-[15px] md:text-[17px] leading-relaxed text-white/90">
            {data.hero.subtitle}
          </p>
        </div>
      </div>

      {/* City chips — 히어로 하단 고정 */}
      <div className="absolute bottom-8 left-0 right-0 px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="cur-reveal flex items-start gap-3">
            <span className="text-4xl shrink-0 leading-none mt-1">{data.flag}</span>
            <div className="flex flex-wrap gap-2">
              {data.cities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[13px] font-semibold text-gray-900 backdrop-blur-sm"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   TOC
════════════════════════════════════════════ */
function TableOfContents({ sections, activeSection }) {
  return (
    <aside className="w-52 shrink-0 sticky top-24">
      <div className="space-y-1">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
          In This Guide
        </div>
        {sections.map((s, i) => (
          <a
            key={s.id}
            href={`#section-${s.id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(`section-${s.id}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`block border-l-2 pl-3 py-1.5 text-[13px] transition-colors ${
              activeSection === s.id
                ? 'border-teal-500 font-bold text-teal-600'
                : 'border-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="mr-1.5 text-[11px] text-slate-300">
              {String(i + 1).padStart(2, '0')}
            </span>
            {s.title}
          </a>
        ))}
        <a
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('checklist')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="block border-l-2 border-teal-300 pl-3 pt-3 text-[13px] font-bold text-teal-500 hover:text-teal-600 cursor-pointer"
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
function AppCard({ a, i }) {
  const [open, setOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const TONES = ['teal', 'sky', 'amber', 'teal']
  const tone = TONES[i % TONES.length]
  const toneCls =
    tone === 'teal'  ? 'bg-teal-50' :
    tone === 'sky'   ? 'bg-sky-50' :
                       'bg-amber-50'
  return (
    <li className="rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:border-sky-200 hover:shadow-md">
      <button
        className="w-full text-left px-5 py-4"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <div className={'h-12 w-12 shrink-0 rounded-xl grid place-items-center ' + toneCls}>
            {a.iconUrl && !imgError
              ? <img src={a.iconUrl} alt={a.name} className="h-8 w-8 object-contain" onError={() => setImgError(true)} />
              : <span className="text-[22px]">{a.emoji}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-extrabold leading-tight text-slate-900">{a.name}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">
              {open ? '닫기' : '상세보기'}
            </span>
            <span className={'text-slate-400 transition-transform duration-200 inline-block text-[11px] ' + (open ? 'rotate-180' : '')}>
              ▾
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1">
          <p className="font-medium text-[14px] leading-relaxed text-gray-700">{a.desc}</p>
          <div className="mt-3">
            {a.storeUrl && (
              <a
                href={a.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-teal-700 hover:text-teal-500"
              >
                <span>설치하러 가기</span>
                <span aria-hidden className="text-amber-500">→</span>
              </a>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

function AppShelf({ apps }) {
  return (
    <div className="cur-reveal">
      <ul className="grid grid-cols-1 gap-3">
        {apps.map((a, i) => <AppCard key={a.name} a={a} i={i} />)}
      </ul>
    </div>
  )
}

/* ════════════════════════════════════════════
   InlineCheckItem
════════════════════════════════════════════ */
function InlineCheckItem({ item, checked, onToggle }) {
  return (
    <div
      className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer"
      onClick={onToggle}
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
        <span className={'font-medium text-[14px] md:text-[15px] leading-snug transition-colors ' + (checked ? 'line-through text-slate-400' : 'text-slate-800')}>
          {item.label}
        </span>
      </span>
    </div>
  )
}

/* ════════════════════════════════════════════
   Article
════════════════════════════════════════════ */
function Article({ data, checked, toggle }) {
  const KICKER_LABELS = ['Before You Pack', 'Money & Pay', 'Must-Have Apps', 'Health & Safety', 'Food & Culture', 'What to Know']

  return (
    <article className="cur-editorial">
      {data.sections.map((section, idx) => {
        const isAppsSection = section.id === 'apps'
        const imageLeft = idx % 2 === 0
        const paragraphs = (section.body.includes('<br/>')
          ? section.body.split('<br/><br/>')
          : section.body.split('\n\n')
        ).filter(Boolean)
        const mainTitle = section.title.split('—')[0].trim()
        // section에 연결된 그룹을 원본 인덱스 보존 후 cat으로 병합
        const relatedGroups = (() => {
          const merged = []
          const catIndex = {}
          data.checklist.forEach((g, gi) => {
            if (!g.section?.includes(section.id)) return
            const items = g.items.map((label, ii) => ({ id: `${gi}-${ii}`, label }))
            if (catIndex[g.cat] !== undefined) {
              merged[catIndex[g.cat]].items.push(...items)
            } else {
              catIndex[g.cat] = merged.length
              merged.push({ cat: g.cat, items })
            }
          })
          return merged
        })()

        return (
          <div key={section.id}>
            <section id={`section-${section.id}`} data-toc className={idx > 0 ? 'mt-20 md:mt-28' : ''}>
              <Kicker idx={String(idx + 1).padStart(2, '0')} label={section.kicker || KICKER_LABELS[idx] || 'Guide'} />
              <SectionH2>
                {section.icon} {mainTitle}
              </SectionH2>

              {!isAppsSection && section.photo && (
                <figure className="cur-reveal my-6 overflow-hidden rounded-2xl aspect-[7/4] shadow-[0_14px_30px_rgba(13,58,76,0.18)]">
                  <BlurImg src={section.photo} alt={section.title} />
                </figure>
              )}

              <div>
                {paragraphs.map((p, pi) => (
                  <p
                    key={pi}
                    className={
                      'cur-reveal' +
                      (isAppsSection && pi === paragraphs.length - 1 ? ' mb-10' : '')
                    }
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                ))}

                {isAppsSection && <AppShelf apps={data.apps} />}

                {section.tip && (
                  <TipBox
                    icon={section.tip.icon}
                    body={section.tip.body}
                  />
                )}

                {relatedGroups.length > 0 && (
                  <div className="mt-3 rounded-xl bg-white border border-slate-100 p-4">
                    {relatedGroups.map((group) => (
                      <div key={group.cat} className="mb-3 last:mb-0">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs font-extrabold tracking-[0.18em] uppercase text-amber-700 mb-3">{group.cat}</div>
                        {group.items.map((it) => (
                          <InlineCheckItem
                            key={it.id}
                            item={{ label: it.label }}
                            checked={!!checked[it.id]}
                            onToggle={() => toggle(it.id)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )
      })}
    </article>
  )
}

/* ════════════════════════════════════════════
   Checklist
════════════════════════════════════════════ */
const PREP_TYPE_ORDER = [
  'essentials', 'clothing', 'health', 'toiletries', 'beauty', 'electronics', 'travel_goods',
  'item', 'pre_booking', 'pre_departure_check', 'etc',
]
const PREP_TYPE_LABEL = {
  essentials: '필수 준비물', clothing: '입을 옷', health: '상비약',
  toiletries: '세면도구', beauty: '미용용품', electronics: '전자제품',
  travel_goods: '여행용품', item: '준비물', pre_booking: '사전 예약/신청',
  pre_departure_check: '출국 전 확인사항', etc: '기타',
}

function ChecklistSection({ data, checked, toggle, onSaveAll, shake, setShake, onSave, saving }) {
  const flatItems = useMemo(() => buildFlatItems(data.checklist), [data])
  const total = flatItems.length
  const done = Object.values(checked).filter(Boolean).length
  const [collapsed, setCollapsed] = useState(() => new Set())
  const toggleCollapse = useCallback((cat) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }, [])
  const allGroups = useMemo(() => {
    const merged = []
    const catIndex = {}
    data.checklist.forEach((group, gi) => {
      const prepType = group.prepType || 'item'
      const items = group.items.map((label, ii) => ({ id: `${gi}-${ii}`, label, prepType }))
      if (catIndex[group.cat] !== undefined) {
        merged[catIndex[group.cat]].items.push(...items)
      } else {
        catIndex[group.cat] = merged.length
        merged.push({ cat: group.cat, items })
      }
    })
    return merged
  }, [data])

  return (
    <section id="checklist" data-toc className="relative">
      <div className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 md:px-3 lg:px-2 pt-6 md:pt-3 pb-24 md:pb-10">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-[0_14px_30px_rgba(13,58,76,0.10)] overflow-hidden">

          {/* Header */}
          <div className="px-5 md:px-7 pt-10 pb-2">
            <div className="cur-reveal">
              <Kicker idx={String(data.sections.length + 1).padStart(2, '0')} label="The Checklist" />
              <h2 className="font-extrabold text-[1.6rem] md:text-[2rem] leading-[1.2] tracking-[-0.02em] text-slate-900 max-w-[18ch]">
                여행 준비, 한 번에 체크하세요
              </h2>
              <p className="mt-5 font-medium text-[14px] md:text-[15px] leading-relaxed text-gray-700 whitespace-nowrap">
                준비물부터 출국 전 확인사항까지, 필요한 항목을 저장하여 한 번에 관리해보세요.
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={onSaveAll}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#6a4a00] font-bold text-[13px] tracking-wide px-5 py-2.5 shadow-sm shadow-amber-900/15 transition active:scale-[0.98]"
                >
                  전체 체크
                </button>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-5 md:px-7 mt-6 pb-7">
            {allGroups.map((group) => {
              const isCollapsed = collapsed.has(group.cat)
              const groupDone = group.items.filter((it) => checked[it.id]).length
              return (
              <div key={group.cat} className="mb-4 last:mb-0">
                <button
                  type="button"
                  onClick={() => toggleCollapse(group.cat)}
                  className="flex w-full items-center gap-2 mb-3 group/hdr"
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-extrabold tracking-[0.15em] uppercase text-amber-700">
                    {group.cat}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium tabular-nums">
                    {groupDone}/{group.items.length}
                  </span>
                  <svg
                    className={`ml-auto h-4 w-4 shrink-0 text-amber-500 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {!isCollapsed && (() => {
                  const uniquePrepTypes = [...new Set(group.items.map((it) => it.prepType))]
                  const hasSubGroups = uniquePrepTypes.length >= 4
                  const orderedPrepTypes = PREP_TYPE_ORDER.filter((pt) => uniquePrepTypes.includes(pt))
                    .concat(uniquePrepTypes.filter((pt) => !PREP_TYPE_ORDER.includes(pt)))

                  const renderItem = (it) => {
                    const on = !!checked[it.id]
                    const isShaking = shake === it.id
                    return (
                      <li
                        key={it.id}
                        className={'group flex items-start gap-3 border-b border-slate-100 py-3.5 cursor-pointer ' + (isShaking ? 'cur-shake' : '')}
                        onClick={() => { toggle(it.id); setShake(it.id); setTimeout(() => setShake(null), 320) }}
                        aria-label={it.label}
                      >
                        <span className={'relative mt-0.5 h-5 w-5 shrink-0 rounded-md border transition-all duration-200 ' + (on ? 'bg-teal-700 border-teal-700' : 'border-slate-300 group-hover:border-teal-500 bg-white')}>
                          {on && (
                            <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={'font-medium text-[14px] leading-snug transition-colors ' + (on ? 'text-slate-400' : 'text-slate-800')}>
                            <span className={'cur-strike-line ' + (on ? 'cur-strike-on' : '')}>{it.label}</span>
                          </span>
                        </span>
                      </li>
                    )
                  }

                  if (!hasSubGroups) return <ul>{group.items.map(renderItem)}</ul>

                  return (
                    <div>
                      {orderedPrepTypes.map((pt) => {
                        const subItems = group.items.filter((it) => it.prepType === pt)
                        if (subItems.length === 0) return null
                        return (
                          <div key={pt} className="mb-4 last:mb-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
                                {PREP_TYPE_LABEL[pt] ?? pt}
                              </span>
                              <span className="h-px flex-1 bg-slate-100" />
                            </div>
                            <ul>{subItems.map(renderItem)}</ul>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )})}
          </div>

          {/* Bottom CTA */}
          <div className="cur-reveal px-5 md:px-7 pb-8">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#6a4a00] font-bold text-[13px] tracking-wide px-6 py-3.5 shadow-sm shadow-amber-900/15 active:scale-[0.98] transition w-full"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   CTA Banner
════════════════════════════════════════════ */
function CtaBanner({ data }) {
  const navigate = useNavigate()
  const bgImg = data.photos.sections[data.photos.sections.length - 1] || data.photos.hero

  const handleCtaClick = () => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      const dest = CURATION_COUNTRY_MAP[data.code]
      navigate('/trips/new/destination', {
        state: {
          preselectedCountry: dest
            ? { name: dest.country, country: dest.country, countryCode: dest.countryCode, iata: dest.iata, city: dest.city }
            : { name: data.name, country: data.name, countryCode: data.code?.toUpperCase() },
        },
      })
    } else {
      navigate('/', { state: { preselectedCountry: data.code } })
    }
  }

  return (
    <section className="relative overflow-hidden">
      <img src={bgImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(17,94,89,0.88) 0%, rgba(15,118,110,0.78) 50%, rgba(7,89,133,0.88) 100%)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28 text-white">
        <div className="cur-reveal grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="text-[11px] font-bold tracking-[0.20em] uppercase text-amber-300 mb-5">
              나만의 {data.name}, 메이트가 함께
            </div>
            <h2 className="font-extrabold text-[1.4rem] md:text-[2.1rem] leading-[1.1] tracking-[-0.02em] max-w-none">
              나만의 {data.name} 여행 체크리스트,<br />
              지금 바로 만들어보세요 🗺️
            </h2>
            <p className="mt-5 font-medium text-[14px] md:text-[16px] leading-relaxed text-white/85 max-w-[44ch]">
              {(data.footerCta.subtitle || '').replace(/AI/g, 'MATE')}
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col gap-3 md:items-end">
            <button
              type="button"
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#6a4a00] font-bold text-[14px] tracking-wide px-7 py-3.5 shadow-md shadow-amber-900/20 transition w-full md:w-auto active:scale-[0.98]"
            >
              여행 준비 시작하기 →
            </button>
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
            <div className="text-[11px] font-bold tracking-[0.20em] uppercase text-amber-600 mb-3">
              Keep reading · 함께 보면 좋은 글
            </div>
            <h2 className="font-extrabold text-[1.6rem] md:text-[2.1rem] leading-[1.1] tracking-[-0.02em] text-slate-900 max-w-[20ch]">
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
              <Link to={`/curation/${d.code}`} className="block">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4 shadow-sm">
                  <img
                    src={d.photos.hero}
                    alt={d.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=85'
                      e.target.onerror = null
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-2">
                    <span className="text-2xl">{d.flag}</span>
                    <span className="font-extrabold text-white text-[15px]">{d.name}</span>
                  </div>
                </div>
                <h3 className="text-[14px] md:text-[15px] leading-tight font-extrabold text-slate-900 group-hover:text-teal-700 transition">
                  {d.hero.title}
                </h3>
                <div className="mt-1 text-[11px] font-semibold text-slate-500">
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
   Content (hooks live here — called only when data exists)
════════════════════════════════════════════ */
function CurationArticleContent({ data }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const progress = useReadingProgress()
  const [checked, setChecked] = useState({})
  const [shake, setShake] = useState(null)

  const tocSectionIds = useMemo(
    () => [...data.sections.map((s) => `section-${s.id}`), 'checklist'],
    [data],
  )
  const activeId = useActiveSection(tocSectionIds)
  const activeSection = activeId?.replace('section-', '') ?? null
  useReveal()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [data.code])

  useEffect(() => {
    document.documentElement.classList.add('curation-page')
    return () => document.documentElement.classList.remove('curation-page')
  }, [])

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

  const [curationSaving, setCurationSaving] = useState(false)

  const handleCurationSave = useCallback(async () => {
    if (curationSaving) return
    const checkedItems = flatItems.filter((it) => checked[it.id])
    const dest = CURATION_COUNTRY_MAP[data.code]

    if (!user) {
      sessionStorage.setItem('curationSave', JSON.stringify({
        items: checkedItems.map((it) => ({ label: it.label, cat: it.cat, prepType: it.prepType })),
        country: data.code,
        countryName: data.name,
        dest: dest || null,
        timestamp: Date.now(),
      }))
      navigate('/trips/guest/search')
      return
    }

    if (!dest) {
      sessionStorage.setItem('curationSave', JSON.stringify({
        items: checkedItems.map((it) => ({ label: it.label, cat: it.cat, prepType: it.prepType })),
        country: data.code,
        countryName: data.name,
        dest: null,
        timestamp: Date.now(),
      }))
      navigate('/trips/guest/search')
      return
    }

    // 로그인 → 여행 자동생성 + 보관함 바로 생성 → 나의 체크리스트 페이지 이동
    setCurationSaving(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
      const created = await createTrip({
        countryCode: dest.countryCode,
        title: `${dest.country} 여행`,
        tripStart: today,
        tripEnd: nextWeek,
        bookingStatus: 'not_booked',
        status: 'planning',
        cities: [{ cityIata: dest.iata, orderIndex: 0, isAutoSynced: false }],
        flights: [],
        companions: [{ companionCode: 'alone', hasPet: false }],
        travelStyles: [{ styleCode: 'healing' }],
      })
      const createdId = created?.id ?? created?.tripId
      if (!createdId) throw new Error('여행 생성 실패')

      saveActiveTripId(String(createdId))

      const snapshot = buildCurationArchiveSnapshot(checkedItems, dest)
      const archiveCreated = await createGuideArchive(createdId, { name: snapshot.pageTitle, snapshot })

      if (archiveCreated?.id) {
        const checksInit = Object.fromEntries(snapshot.items.map((it) => [String(it.id), false]))
        saveEntryChecklistChecks(String(createdId), archiveCreated.id, checksInit)
        sessionStorage.setItem('lastSavedArchiveId', String(archiveCreated.id))
      }
      sessionStorage.removeItem('curationSave')
      navigate('/guide-archives')
    } catch (err) {
      console.warn('[CurationArticlePage] save 실패:', err?.message)
      navigate('/trips/guest/search')
    } finally {
      setCurationSaving(false)
    }
  }, [curationSaving, checked, flatItems, data, navigate, user])

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

        .cur-img-fade { opacity: 0.3; filter: blur(8px); transform: scale(1.03); transition: opacity 1.1s ease, filter 1.1s ease, transform 1.4s ease; }
        .cur-img-fade.is-loaded { opacity: 1; filter: blur(0); transform: scale(1); }
        .img-error { background: linear-gradient(135deg, #e2e8f0, #cbd5e1); }

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

        .cur-checklist-item { word-break: break-word; overflow-wrap: break-word; }

        @media (hover: hover) and (pointer: fine) {
          .cur-tipbox { transition: border-color .2s ease, box-shadow .2s ease; }
          .cur-tipbox:hover { border-color: #2dba76; box-shadow: 0 4px 16px rgba(45,186,118,0.10); }
        }

.cur-editorial p { font-weight: 500; font-size: 1rem; line-height: 1.8; letter-spacing: -0.02em; color: #1f2937; text-align: justify; text-justify: inter-character; word-break: keep-all; overflow-wrap: break-word; }
        @media (min-width: 768px) { .cur-editorial p { font-size: 1.0625rem; line-height: 1.9; } }
        .cur-editorial p + p { margin-top: 1.15em; }
        .cur-editorial aside p { text-align: left; font-size: 0.9375rem; }
        @media (max-width: 767px) {
          .cur-editorial p { font-size: 14px; letter-spacing: -0.025em; }
          .cur-editorial aside p { font-size: 0.75rem; letter-spacing: inherit; }
          .cur-tipbox p { font-size: 14px !important; }
        }
      `}</style>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[70] h-[2px] bg-slate-200/60">
        <div
          className="h-full origin-left bg-gradient-to-r from-teal-700 via-teal-500 to-amber-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="cur-page-bg [overflow-x:clip]" style={{ wordBreak: 'keep-all' }}>
        <Hero data={data} />

        <div className="relative mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl px-[22px] md:px-3 lg:px-2 pt-16 pb-10 md:pt-20 md:pb-4">
          <Article data={data} checked={checked} toggle={toggle} />
          <div className="hidden xl:block absolute top-0 left-full h-full pl-8">
            <TableOfContents sections={data.sections} activeSection={activeSection} />
          </div>
        </div>

        <ChecklistSection
          data={data}
          checked={checked}
          toggle={toggle}
          onSaveAll={onSaveAll}
          shake={shake}
          setShake={setShake}
          onSave={handleCurationSave}
          saving={curationSaving}
        />

        <CtaBanner data={data} />
        <Related currentCode={data.code} />
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
  if (!data) return <Navigate to="/curation/vietnam" replace />
  return <CurationArticleContent key={data.code} data={data} />
}
