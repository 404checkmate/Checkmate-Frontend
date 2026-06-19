import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { getMe } from '@/api/auth'
import {
  fetchFunnel,
  fetchLogins,
  fetchChannels,
  fetchContentGap,
  fetchRetention,
  fetchSaveRetention,
  fetchGuestPreview,
  fetchTravelTest,
  fetchTravelTestTypes,
  fetchCollab,
  fetchAdTargeting,
  fetchAffiliateClicks,
} from '@/api/admin'

const PAGE_BG = {
  background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
}

/** 서비스 지표 수집 시작 시점 — '전체' 프리셋의 from */
const SERVICE_EPOCH = '2026-01-01'

const PRESETS = [
  { key: '7d', label: '최근 7일', days: 7 },
  { key: '30d', label: '최근 30일', days: 30 },
  { key: '90d', label: '최근 90일', days: 90 },
  { key: 'all', label: '전체', days: null },
]

function toDateStr(d) {
  return d.toISOString().slice(0, 10)
}

function rangeFromPreset(preset) {
  const to = toDateStr(new Date())
  if (preset.days == null) return { from: SERVICE_EPOCH, to }
  const from = toDateStr(new Date(Date.now() - (preset.days - 1) * 86_400_000))
  return { from, to }
}

/** 기간 선택 — 프리셋 버튼 + 직접 입력 */
function RangePicker({ range, onChange }) {
  const [activePreset, setActivePreset] = useState('30d')

  const applyPreset = (preset) => {
    setActivePreset(preset.key)
    onChange(rangeFromPreset(preset))
  }

  const applyManual = (key, value) => {
    setActivePreset(null)
    onChange({ ...range, [key]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => applyPreset(p)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            activePreset === p.key
              ? 'bg-teal-600 text-white'
              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <input
          type="date"
          value={range.from}
          max={range.to}
          onChange={(e) => applyManual('from', e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5"
        />
        <span>~</span>
        <input
          type="date"
          value={range.to}
          min={range.from}
          onChange={(e) => applyManual('to', e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5"
        />
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900">{value ?? '—'}</p>
      {sub ? <p className="mt-0.5 text-xs text-gray-400">{sub}</p> : null}
    </div>
  )
}

function ChartCard({ title, note, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {note ? <p className="mt-0.5 text-xs text-gray-400">{note}</p> : null}
      <div className="mt-4 h-64">{children}</div>
    </section>
  )
}

function TableCard({ title, note, columns, rows, renderRow }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {note ? <p className="mt-0.5 text-xs text-gray-400">{note}</p> : null}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              {columns.map((c) => (
                <th key={c} className="py-2 pr-3 font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="py-4 text-center text-gray-400">데이터 없음</td></tr>
            ) : (
              rows.map(renderRow)
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const PCT = (v) => (v == null ? '—' : `${v}%`)

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState('checking') // checking | allowed | denied
  const [range, setRange] = useState(() => rangeFromPreset(PRESETS[1]))
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 관리자 여부 확인 — 백엔드 가드가 최종 방어선이고, 여기는 UX용 사전 차단
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await getMe()
        if (cancelled) return
        setAuthState(me?.isAdmin ? 'allowed' : 'denied')
      } catch {
        if (!cancelled) setAuthState('denied')
      }
    })()
    return () => { cancelled = true }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [funnel, logins, channels, contentGap, retention, saveRetention, guestPreview, travelTest, travelTestTypes, collab, adTargeting, affiliateClicks] =
        await Promise.all([
          fetchFunnel(range),
          fetchLogins(range),
          fetchChannels(range),
          fetchContentGap(),
          fetchRetention(range),
          fetchSaveRetention(),
          fetchGuestPreview(range),
          fetchTravelTest(range),
          fetchTravelTestTypes(range),
          fetchCollab(range),
          fetchAdTargeting(range),
          fetchAffiliateClicks(range),
        ])
      setData({ funnel, logins, channels, contentGap, retention, saveRetention, guestPreview, travelTest, travelTestTypes, collab, adTargeting, affiliateClicks })
    } catch (err) {
      setError(err?.response?.status === 403
        ? '관리자 권한이 없습니다.'
        : err?.response?.data?.error?.message || err?.message || '지표 조회에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    if (authState === 'allowed') load()
  }, [authState, load])

  // 기간 합계 KPI
  const kpi = useMemo(() => {
    const rows = data.funnel ?? []
    const sum = (key) => rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)
    const visited = sum('visited')
    const explored = sum('explored')
    const saved = sum('saved')
    const savedIntent = sum('saved_intent')
    const loggedIn = sum('logged_in')
    return {
      visited,
      explored,
      saved,
      savedIntent,
      loggedIn,
      // 탐색→저장시도: 게스트 포함·대칭(이벤트 기준) — 로그인 후순위 효과가 잡히는 "진짜" 전환율
      exploreToSaveIntent: explored > 0 ? Math.round((1000 * savedIntent) / explored) / 10 : null,
      // 탐색→실제저장: guide_archives 기준(로그인 저장만)
      exploreToSave: explored > 0 ? Math.round((1000 * saved) / explored) / 10 : null,
    }
  }, [data.funnel])

  if (authState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={PAGE_BG}>
        <p className="text-sm text-gray-500">권한 확인 중…</p>
      </div>
    )
  }

  if (authState === 'denied') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={PAGE_BG}>
        <p className="text-sm font-semibold text-gray-700">관리자만 접근할 수 있는 페이지입니다.</p>
        <button
          type="button"
          onClick={() => navigate('/mypage')}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          마이페이지로 돌아가기
        </button>
      </div>
    )
  }

  const funnel = data.funnel ?? []
  const logins = data.logins ?? []
  const channels = data.channels ?? []
  const contentGap = data.contentGap ?? []
  const retention = data.retention ?? []
  const saveRetention = data.saveRetention ?? []
  const guestPreview = data.guestPreview ?? []
  const travelTest = data.travelTest ?? []
  const travelTestTypes = data.travelTestTypes ?? []
  const collab = data.collab ?? []
  const adTargeting = data.adTargeting ?? []
  const affiliateClicks = data.affiliateClicks ?? {}
  const affDaily = affiliateClicks.daily ?? []
  const affTopItems = affiliateClicks.topItems ?? []
  const affSummary = affiliateClicks.summary ?? {}

  return (
    <div className="min-h-screen pb-16" style={PAGE_BG}>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 md:text-2xl">스크럼 대시보드</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              팀원/dev 제외 · 저장시도=이벤트(게스트 포함) · 실제저장=guide_archives(로그인만) · 60초 캐시
            </p>
          </div>
          <Link to="/mypage" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
            ← 마이페이지
          </Link>
        </div>

        <div className="mt-4">
          <RangePicker range={range} onChange={setRange} />
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {loading ? (
          <div className="mt-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500">
            지표 불러오는 중…
          </div>
        ) : null}

        {/* KPI 카드 — 선택 기간 합계 */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="방문 세션" value={kpi.visited} />
          <KpiCard label="탐색 세션" value={kpi.explored} />
          <KpiCard label="저장 시도" value={kpi.savedIntent} sub="이벤트·게스트 포함" />
          <KpiCard label="실제 저장" value={kpi.saved} sub="guide_archives·로그인만" />
          <KpiCard label="로그인 세션" value={kpi.loggedIn} />
          <KpiCard label="탐색→저장시도" value={PCT(kpi.exploreToSaveIntent)} sub="게스트 포함·대칭" />
          <KpiCard label="탐색→실제저장" value={PCT(kpi.exploreToSave)} sub="로그인 저장만" />
        </div>

        {/* 쿼리 14 — 광고 타겟 항목 (수익화) */}
        <section className="mt-6 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">💰 광고 타겟 항목 — 탐색 선택 점유율</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            탐색 단계 "담기" 클릭 기준 상위 15 · <span className="font-semibold text-teal-700">색칠된 막대 = 제휴/광고 매칭 가능</span> · 저장 유저수는 구매의도 지속 확인용
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-[420px]">
              <ResponsiveContainer>
                <BarChart data={adTargeting} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" fontSize={11} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={150}
                    fontSize={10}
                    interval={0}
                    tickFormatter={(t) => (t && t.length > 14 ? `${t.slice(0, 13)}…` : t)}
                  />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="select_share_pct" name="선택점유율" radius={[0, 3, 3, 0]}>
                    {adTargeting.map((d, i) => (
                      <Cell key={i} fill={d.ad_category ? '#0d9488' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    {['항목', '선택클릭', '점유율', '저장유저', '광고 매칭'].map((c) => (
                      <th key={c} className="py-2 pr-3 font-semibold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adTargeting.length === 0 ? (
                    <tr><td colSpan={5} className="py-4 text-center text-gray-400">데이터 없음</td></tr>
                  ) : (
                    adTargeting.map((r, i) => (
                      <tr key={`${r.title}-${i}`} className="border-b border-gray-50 text-gray-700">
                        <td className="py-2 pr-3">{r.title}</td>
                        <td className="py-2 pr-3">{r.select_clicks}</td>
                        <td className="py-2 pr-3">{PCT(r.select_share_pct)}</td>
                        <td className="py-2 pr-3">{r.save_users}</td>
                        <td className="py-2 pr-3">
                          {r.ad_category ? (
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                              {r.ad_category}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 쿼리 15 — 제휴 클릭 지표 */}
        <section className="mt-6 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">🔗 제휴 클릭 지표 — 쿠팡·마이리얼트립</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            제휴 버튼 클릭 기준 · 구매 전환·수익은 제휴사 리포트에서 확인(우리 DB 밖) · 팀원/dev 제외
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="제휴 클릭" value={affSummary.total_clicks} />
            <KpiCard label="클릭 세션" value={affSummary.click_sessions} />
            <KpiCard label="탐색→클릭" value={PCT(affSummary.explore_to_click_pct)} sub="탐색 세션 중" />
            <KpiCard label="저장→클릭" value={PCT(affSummary.save_to_click_pct)} sub="저장 세션 중" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-64">
              <p className="mb-2 text-xs font-semibold text-gray-500">일별 제휴 클릭</p>
              <ResponsiveContainer>
                <LineChart data={affDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => (d ? d.slice(5) : d)} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="전체" stroke="#0d9488" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="coupang" name="쿠팡" stroke="#f59e0b" dot={false} />
                  <Line type="monotone" dataKey="mrt" name="마리트" stroke="#0ea5e9" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <p className="mb-2 text-xs font-semibold text-gray-500">항목별 클릭 TOP 15</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    {['항목', 'provider', '클릭', '세션'].map((c) => (
                      <th key={c} className="py-2 pr-3 font-semibold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {affTopItems.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-400">데이터 없음</td></tr>
                  ) : (
                    affTopItems.map((r, i) => (
                      <tr key={`${r.item}-${i}`} className="border-b border-gray-50 text-gray-700">
                        <td className="py-2 pr-3">{r.item}</td>
                        <td className="py-2 pr-3">{r.provider === 'mrt' ? '마리트' : r.provider === 'coupang' ? '쿠팡' : r.provider}</td>
                        <td className="py-2 pr-3">{r.clicks}</td>
                        <td className="py-2 pr-3">{r.sessions}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 쿼리 1 — 일별 퍼널 추이 */}
          <ChartCard title="일별 핵심 퍼널" note="방문 → 탐색 → 항목선택 → 저장시도(게스트 포함) → 실제저장">
            <ResponsiveContainer>
              <LineChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visited" name="방문" stroke="#94a3b8" dot={false} />
                <Line type="monotone" dataKey="explored" name="탐색" stroke="#0ea5e9" dot={false} />
                <Line type="monotone" dataKey="selected" name="항목선택" stroke="#8b5cf6" dot={false} />
                <Line type="monotone" dataKey="saved_intent" name="저장시도" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="saved" name="실제저장" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 쿼리 2 — 탐색→저장 전환율 */}
          <ChartCard title="탐색→저장 전환율 추이" note="저장 = guide_archives 기준">
            <ResponsiveContainer>
              <LineChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis fontSize={11} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="explore_to_save_pct" name="탐색→저장%" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 쿼리 3 — 신규/누적 로그인 */}
          <ChartCard title="신규 로그인 + 누적" note="login_completed 최초 발생일 기준">
            <ResponsiveContainer>
              <ComposedChart data={logins}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis yAxisId="left" fontSize={11} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="new_logins" name="신규" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" name="누적" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 쿼리 10 — 게스트 프리뷰 퍼널 */}
          <ChartCard title="게스트 프리뷰 퍼널" note="비로그인 저장 플로우 (2026-06-04 신설)">
            <ResponsiveContainer>
              <BarChart data={guestPreview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="preview_opened" name="프리뷰진입" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="complete_clicked" name="완료클릭" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Bar dataKey="login_redirected" name="로그인이동" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="guest_saved" name="저장완료" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 쿼리 11 — 여행 스타일 테스트 퍼널 */}
          <ChartCard title="여행 스타일 테스트 퍼널" note="진입 → 시작 → 완료 → 공유/체크리스트 세션 수 (2026-06-05 신설)">
            <ResponsiveContainer>
              <BarChart data={travelTest}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="landing_viewed" name="진입" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="started" name="시작" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" name="완료" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="shared" name="공유" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="checklist_created" name="체크리스트" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 쿼리 13 — 친구·협업 퍼널 */}
          <ChartCard title="친구·협업 퍼널" note="초대 → 수락 일별 이벤트 수 (2026-06-05 신설)">
            <ResponsiveContainer>
              <BarChart data={collab}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="friend_invites" name="친구초대" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="friends_made" name="친구성립" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Bar dataKey="trip_invites" name="트립초대" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="trip_joins" name="합류" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="trip_declines" name="거절" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 쿼리 8 — 리텐션 */}
          <TableCard
            title="가입 코호트별 D1/D7 리텐션"
            note="가입일이 선택 기간 안인 코호트"
            columns={['가입일', '가입', 'D1 복귀', 'D7 복귀', 'D1%', 'D7%']}
            rows={retention}
            renderRow={(r) => (
              <tr key={r.cohort_day} className="border-b border-gray-50 text-gray-700">
                <td className="py-2 pr-3">{r.cohort_day}</td>
                <td className="py-2 pr-3">{r.signups}</td>
                <td className="py-2 pr-3">{r.d1_returned}</td>
                <td className="py-2 pr-3">{r.d7_returned}</td>
                <td className="py-2 pr-3">{PCT(r.d1_pct)}</td>
                <td className="py-2 pr-3">{PCT(r.d7_pct)}</td>
              </tr>
            )}
          />

          {/* 쿼리 4 — 유입 채널 */}
          <TableCard
            title="유입 채널별 세션"
            note="⚠️ session_start에 utm_source/referrer 계측 전까지 대부분 direct/unknown"
            columns={['날짜', '채널', '세션수']}
            rows={channels}
            renderRow={(r, i) => (
              <tr key={`${r.day}-${r.channel}-${i}`} className="border-b border-gray-50 text-gray-700">
                <td className="py-2 pr-3">{r.day}</td>
                <td className="py-2 pr-3">{r.channel}</td>
                <td className="py-2 pr-3">{r.sessions}</td>
              </tr>
            )}
          />

          {/* 쿼리 7 — 콘텐츠 갭 */}
          <TableCard
            title="목적지 탐색수 vs 아티클 보유"
            note="전체 기간 기준 · 아티클 추가 시 백엔드 ARTICLE_DESTINATIONS 업데이트 필요"
            columns={['목적지', '탐색수', '아티클']}
            rows={contentGap}
            renderRow={(r) => (
              <tr key={r.dest} className="border-b border-gray-50 text-gray-700">
                <td className="py-2 pr-3">{r.dest}</td>
                <td className="py-2 pr-3">{r.trips}</td>
                <td className="py-2 pr-3">{r.has_article ? '✅' : <span className="font-semibold text-red-500">❌ 갭</span>}</td>
              </tr>
            )}
          />

          {/* 쿼리 12 — 여행 테스트 결과 유형 분포 */}
          <TableCard
            title="여행 테스트 결과 유형 분포"
            note="travel_test_completed 기준 · 공유 유입(shared_inflow)은 퍼널 차트 참고"
            columns={['결과 유형', '횟수', '비율']}
            rows={travelTestTypes}
            renderRow={(r) => (
              <tr key={r.result_type} className="border-b border-gray-50 text-gray-700">
                <td className="py-2 pr-3">{r.result_type}</td>
                <td className="py-2 pr-3">{r.cnt}</td>
                <td className="py-2 pr-3">{PCT(r.pct)}</td>
              </tr>
            )}
          />

          {/* 쿼리 9 — 저장 vs 비저장 재방문 */}
          <TableCard
            title="저장 유저 vs 비저장 유저 재방문율"
            note="전체 기간 기준"
            columns={['저장 경험', '유저수', '평균 방문일수', '재방문 유저', '재방문율']}
            rows={saveRetention}
            renderRow={(r) => (
              <tr key={String(r.ever_saved)} className="border-b border-gray-50 text-gray-700">
                <td className="py-2 pr-3">{r.ever_saved ? '있음' : '없음'}</td>
                <td className="py-2 pr-3">{r.users}</td>
                <td className="py-2 pr-3">{r.avg_visit_days}</td>
                <td className="py-2 pr-3">{r.returned_users}</td>
                <td className="py-2 pr-3">{PCT(r.return_pct)}</td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  )
}
