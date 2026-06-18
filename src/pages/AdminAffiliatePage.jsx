import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe } from '@/api/auth'
import {
  fetchAffiliateTemplates,
  upsertAffiliateLink,
  deleteAffiliateLink,
} from '@/api/affiliateLinks'

const PAGE_BG = { background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }

const PROVIDER_OPTS = [
  { value: '', label: '없음' },
  { value: 'coupang', label: '쿠팡 파트너스' },
  { value: 'mrt', label: '마이리얼트립' },
]

const isValidUrl = (u) => /^https?:\/\/.+/i.test(String(u || '').trim())

export default function AdminAffiliatePage() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState('checking') // checking | allowed | denied
  const [templates, setTemplates] = useState([])
  const [rows, setRows] = useState({}) // templateId → { provider, url, label }
  const [status, setStatus] = useState({}) // templateId → 'saving' | 'saved' | 'error'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const data = await fetchAffiliateTemplates()
      setTemplates(data)
      const init = {}
      for (const t of data) {
        init[t.templateId] = {
          provider: t.link?.provider ?? '',
          url: t.link?.url ?? '',
          label: t.link?.label ?? '',
        }
      }
      setRows(init)
    } catch (err) {
      setError(err?.response?.status === 403
        ? '관리자 권한이 없습니다.'
        : err?.response?.data?.error?.message || err?.message || '불러오기에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authState === 'allowed') load()
  }, [authState, load])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const t of templates) {
      const key = t.categoryLabel || `카테고리 ${t.categoryId}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(t)
    }
    return [...map.entries()]
  }, [templates])

  const linkedCount = useMemo(
    () => Object.values(rows).filter((r) => r.provider && r.url).length,
    [rows],
  )

  const setField = (id, field, value) => {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
    setStatus((prev) => ({ ...prev, [id]: undefined }))
  }

  const save = async (id) => {
    const row = rows[id]
    setStatus((prev) => ({ ...prev, [id]: 'saving' }))
    try {
      if (!row.provider) {
        await deleteAffiliateLink(id)
      } else {
        if (!isValidUrl(row.url)) {
          setStatus((prev) => ({ ...prev, [id]: 'error' }))
          return
        }
        await upsertAffiliateLink(id, {
          provider: row.provider,
          url: row.url.trim(),
          label: row.label?.trim() || undefined,
          isActive: true,
        })
      }
      setStatus((prev) => ({ ...prev, [id]: 'saved' }))
    } catch {
      setStatus((prev) => ({ ...prev, [id]: 'error' }))
    }
  }

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

  return (
    <div className="min-h-screen pb-16" style={PAGE_BG}>
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 md:text-2xl">제휴 링크 관리</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              시드 템플릿 항목별 제휴 링크(쿠팡/마이리얼트립) · 링크 설정 {linkedCount} / {templates.length}개 · AI 생성 항목은 대상 아님
            </p>
          </div>
          <Link to="/mypage" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
            ← 마이페이지
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {loading ? (
          <div className="mt-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500">불러오는 중…</div>
        ) : null}

        <div className="mt-5 space-y-6">
          {grouped.map(([category, items]) => (
            <section key={category} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-bold text-gray-900">{category}</h2>
              <div className="space-y-3">
                {items.map((t) => {
                  const row = rows[t.templateId] ?? { provider: '', url: '', label: '' }
                  const st = status[t.templateId]
                  return (
                    <div key={t.templateId} className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-800">{t.title}</p>
                        <div className="flex items-center gap-2">
                          {st === 'saved' ? <span className="text-xs font-semibold text-teal-600">저장됨</span> : null}
                          {st === 'error' ? <span className="text-xs font-semibold text-red-500">URL 확인</span> : null}
                          <button
                            type="button"
                            onClick={() => save(t.templateId)}
                            disabled={st === 'saving'}
                            className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                          >
                            {st === 'saving' ? '저장 중…' : '저장'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr_140px]">
                        <select
                          value={row.provider}
                          onChange={(e) => setField(t.templateId, 'provider', e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        >
                          {PROVIDER_OPTS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <input
                          type="url"
                          value={row.url}
                          onChange={(e) => setField(t.templateId, 'url', e.target.value)}
                          placeholder="https://link.coupang.com/... 또는 https://myrealt.rip/..."
                          disabled={!row.provider}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm disabled:bg-gray-50"
                        />
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => setField(t.templateId, 'label', e.target.value)}
                          placeholder={row.provider === 'mrt' ? '예약하러 가기' : '구매하러 가기'}
                          disabled={!row.provider}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
