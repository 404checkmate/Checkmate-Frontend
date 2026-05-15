import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import mascotLuggageUrl from '@/assets/home-cta-mascot-luggage.png'
import { useAuth } from '@/hooks/useAuth'
import { fetchMyGuideArchives } from '@/api/guideArchives'
import HomeFooter from '@/components/home/HomeFooter'
import { formatTripNightsDaysLabel } from '@/utils/tripDateFormat'

const ServiceIntroPage = lazy(() => import('./ServiceIntroPage'))

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isDesktop
}

// ─── 큐레이션 데이터 ────────────────────────────────────────────────────────

const CURATION_COUNTRIES = [
  {
    id: 'vn',
    name: '베트남',
    sub: '가성비 최고의 선택',
    image: 'https://picsum.photos/seed/vietnam-bay/800/500',
  },
  {
    id: 'jp',
    name: '일본',
    sub: '가장 인기 있는 여행지',
    image: 'https://picsum.photos/seed/japan-nature/800/500',
  },
  {
    id: 'us',
    name: '미국',
    sub: '자유여행의 클래식',
    image: 'https://picsum.photos/seed/america-city/800/500',
  },
  {
    id: 'th',
    name: '태국',
    sub: '힐링이 필요할 때',
    image: 'https://picsum.photos/seed/thailand-temple/800/500',
  },
]

// ─── 큐레이션 카드 ───────────────────────────────────────────────────────────

function CurationCard({ country, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: `transform 0.65s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s,
                     opacity 0.55s ease ${index * 0.1}s`,
      }}
    >
      <button
        type="button"
        className="w-full bg-white rounded-2xl p-2 pb-3 shadow-lg shadow-gray-300/50 border border-gray-100 transition-transform active:scale-[0.97]"
      >
        {/* 이미지 액자 영역 */}
        <div className="overflow-hidden rounded-xl aspect-[4/3]">
          <img
            src={country.image}
            alt={country.name}
            className="h-full w-full object-cover"
            style={{
              transform: visible ? 'scale(1)' : 'scale(1.08)',
              transition: `transform 0.75s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s`,
            }}
            loading="lazy"
            draggable={false}
          />
        </div>

        {/* 폴라로이드 캡션 */}
        <div
          className="px-1 pt-2 text-left"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            opacity: visible ? 1 : 0,
            transition: `transform 0.6s cubic-bezier(0.22,1,0.36,1) ${index * 0.1 + 0.08}s,
                         opacity 0.5s ease ${index * 0.1 + 0.08}s`,
          }}
        >
          <p className="text-sm font-extrabold leading-tight text-[#04384a]">{country.name}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-gray-400">{country.sub}</p>
        </div>
      </button>
    </div>
  )
}

// ─── 내 체크리스트 가로 스크롤 섹션 ─────────────────────────────────────────

const DUMMY_ARCHIVES = [
  {
    id: 'demo-1',
    trip: { id: null },
    archivedAt: '2026-05-08T12:00:00Z',
    snapshot: { checklistProgressPercent: 78, country: '일본', tripStartDate: '2026-07-10', tripEndDate: '2026-07-13' },
  },
  {
    id: 'demo-2',
    trip: { id: null },
    archivedAt: '2026-04-20T09:00:00Z',
    snapshot: { checklistProgressPercent: 42, country: '일본', tripStartDate: '2026-08-01', tripEndDate: '2026-08-06' },
  },
  {
    id: 'demo-3',
    trip: { id: null },
    archivedAt: '2026-03-15T08:00:00Z',
    snapshot: { checklistProgressPercent: 100, country: '태국', tripStartDate: '2026-09-20', tripEndDate: '2026-09-24' },
  },
]

function formatKoreanFullDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${y}년 ${m}월 ${d}일`
}

function formatArchiveDate(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit' })
      .format(new Date(iso))
      .replace(/\.+\s*$/, '')
  } catch {
    return ''
  }
}

function ChecklistCard({ archive }) {
  const progress =
    archive.snapshot?.checklistProgressPercent ?? archive.completionRate ?? 0
  const tripId = archive.trip?.id
  const to =
    tripId
      ? `/trips/${tripId}/guide-archive/${archive.id}`
      : '/guide-archives'

  const snap = archive.snapshot ?? {}
  const country = snap.country
  const nightsDays = formatTripNightsDaysLabel(snap.tripStartDate, snap.tripEndDate)
  const mainText = country && nightsDays
    ? `${country} ${nightsDays}`
    : archive.trip?.title ?? archive.name ?? ''
  const subText = formatKoreanFullDate(snap.tripStartDate)

  return (
    <Link
      to={to}
      className="flex w-44 shrink-0 flex-col gap-2 overflow-hidden rounded-2xl bg-white p-3.5 shadow-sm shadow-gray-200/60 transition-all active:scale-[0.97]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-[#04384a]">{mainText}</p>
        {subText && (
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[#3db4dd]">
            {subText}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-gray-500">
          <span>진행도</span>
          <span className="tabular-nums text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-[#3db4dd] transition-all"
            style={{ width: `${Math.min(100, Math.round(progress))}%` }}
          />
        </div>
      </div>

      {archive.archivedAt && (
        <p className="text-[10px] text-gray-400">작성일: {formatArchiveDate(archive.archivedAt)}</p>
      )}
    </Link>
  )
}

function ChecklistSkeleton() {
  return (
    <div className="flex w-44 shrink-0 flex-col gap-2 rounded-2xl bg-white p-3.5 shadow-sm shadow-gray-200/60">
      <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
      <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100" />
    </div>
  )
}

function MyChecklistsSection() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [archives, setArchives] = useState([])
  const [fetching, setFetching] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    setFetching(true)
    fetchMyGuideArchives()
      .then((data) => {
        const list = Array.isArray(data?.archives)
          ? data.archives
          : Array.isArray(data)
            ? data
            : []
        setArchives(
          [...list]
            .sort((a, b) => new Date(b.archivedAt ?? 0) - new Date(a.archivedAt ?? 0))
            .slice(0, 5),
        )
      })
      .catch(() => setArchives([]))
      .finally(() => setFetching(false))
  }, [isLoggedIn])

  // auth 로딩 중이거나 비로그인이면 섹션 자체를 숨김
  if (authLoading || !isLoggedIn) return null

  const hasArchives = !fetching && archives.length > 0

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#04384a]">내 체크리스트</h2>
          {previewMode && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
              예시
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!fetching && !hasArchives && !previewMode && (
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className="rounded-full bg-teal-500 px-3 py-1 text-xs font-bold text-white transition-colors active:bg-teal-600"
            >
              예시 보기
            </button>
          )}
          {previewMode && (
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
              닫기
            </button>
          )}
          {(hasArchives || previewMode) && (
            <Link
              to="/guide-archives"
              className="text-xs font-semibold text-[#3db4dd] transition-colors hover:text-teal-600"
            >
              자세히
            </Link>
          )}
        </div>
      </div>

      {/* 로딩 중 */}
      {fetching && (
        <div
          className="flex gap-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[0, 1, 2].map((i) => <ChecklistSkeleton key={i} />)}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      )}

      {/* 저장된 체크리스트 없음 + 미리보기 꺼짐 */}
      {!fetching && !hasArchives && !previewMode && (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-white px-5 py-6 shadow-sm shadow-gray-200/60">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
            <svg className="h-5 w-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </span>
          <div className="text-center">
            <p className="text-sm font-bold text-[#04384a]">저장된 체크리스트가 없어요</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              여행을 준비하고 체크리스트를 저장하면<br />여기서 바로 확인할 수 있어요
            </p>
          </div>
        </div>
      )}

      {/* 예시 미리보기 */}
      {!fetching && !hasArchives && previewMode && (
        <div
          className="flex gap-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DUMMY_ARCHIVES.map((archive) => (
            <ChecklistCard key={archive.id} archive={archive} />
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      )}

      {/* 실제 체크리스트 목록 */}
      {hasArchives && (
        <div
          className="flex gap-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {archives.map((archive) => (
            <ChecklistCard key={archive.id} archive={archive} />
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      )}
    </section>
  )
}

// ─── 인기 취항지 태그 데이터 ─────────────────────────────────────────────────

const POPULAR_DESTINATION_TAGS = [
  { label: '도쿄',    name: '일본',      country: '일본',      countryCode: 'JP', iata: 'NRT', city: '도쿄(나리타)' },
  { label: '오사카',  name: '일본',      country: '일본',      countryCode: 'JP', iata: 'KIX', city: '오사카(간사이)' },
  { label: '방콕',   name: '태국',      country: '태국',      countryCode: 'TH', iata: 'BKK', city: '방콕(수완나품)' },
  { label: '다낭',   name: '베트남',    country: '베트남',    countryCode: 'VN', iata: 'DAD', city: '다낭' },
  { label: '싱가포르', name: '싱가포르',  country: '싱가포르',  countryCode: 'SG', iata: 'SIN', city: '싱가포르' },
  { label: '발리',   name: '인도네시아', country: '인도네시아', countryCode: 'ID', iata: 'DPS', city: '발리(응우라라이)' },
]

// ─── 모바일/태블릿 홈페이지 ──────────────────────────────────────────────────

function MobileHomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/trips/new/destination')
  }

  return (
    <div
      className="flex-1"
      style={{
        backgroundImage: `
          radial-gradient(circle at 8% 8%, rgba(61, 180, 221, 0.18) 0%, transparent 32%),
          radial-gradient(circle at 88% 6%, rgba(248, 215, 116, 0.26) 0%, transparent 28%),
          radial-gradient(circle at 12% 72%, rgba(61, 180, 221, 0.10) 0%, transparent 24%),
          linear-gradient(160deg, #ecfffe 0%, #f4fff1 55%, #fffcf0 100%)
        `,
      }}
    >
      <div className="flex flex-col gap-5 px-4 pb-6 pt-5">

        {/* 환영 배너 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-[#3db4dd] px-5 py-5 shadow-md shadow-teal-900/15">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-4 left-1/3 h-20 w-20 rounded-full bg-amber-300/20 blur-2xl"
            aria-hidden
          />
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-100">오늘도 설레는 여행 준비 ✨</p>
              <h1 className="mt-1 text-xl font-extrabold leading-tight text-white">
                어디로 떠날까요?
              </h1>
              <p className="mt-1 text-[11px] font-medium text-teal-100/80">
                조건만 입력하면 메이트가 자동으로 준비해드려요
              </p>
            </div>
            <img
              src={mascotLuggageUrl}
              alt="여행 가방을 든 메이트 마스코트"
              className="h-20 w-20 shrink-0 object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* 목적지 검색 카드 */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-gray-200/60">
          <div className="px-5 pb-4 pt-4">
            <h2 className="mb-3 text-sm font-bold text-[#04384a]">목적지 검색</h2>
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-left transition-colors focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 hover:border-teal-300"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-[#3db4dd]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="나라, 도시 이름을 입력해 주세요"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </button>
            </form>

            {/* 인기 취항지 태그 */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {POPULAR_DESTINATION_TAGS.map((tag) => (
                <button
                  key={`${tag.countryCode}-${tag.label}`}
                  type="button"
                  onClick={() =>
                    navigate('/trips/new/destination', {
                      state: {
                        preselectedCountry: {
                          name: tag.name,
                          country: tag.country,
                          countryCode: tag.countryCode,
                          iata: tag.iata,
                          city: tag.city,
                        },
                      },
                    })
                  }
                  className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700 transition-colors active:bg-teal-200 hover:bg-teal-100"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <MyChecklistsSection />

        {/* MATE 맞춤 큐레이션 */}
        <section>
          <div className="mb-4">
            <h2 className="text-[1.1rem] font-extrabold leading-snug text-[#04384a]">
              지금 떠나기 좋은 <span className="text-[#3db4dd]">인기여행지</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CURATION_COUNTRIES.map((country, index) => (
              <CurationCard key={country.id} country={country} index={index} />
            ))}
          </div>
        </section>

      </div>
      <HomeFooter />
    </div>
  )
}

// ─── 라우트 진입점 ────────────────────────────────────────────────────────────

export default function HomePage() {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Suspense fallback={null}>
        <ServiceIntroPage />
      </Suspense>
    )
  }

  return <MobileHomePage />
}
