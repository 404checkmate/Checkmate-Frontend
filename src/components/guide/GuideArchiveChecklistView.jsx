import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildGuideArchiveDateLine, buildGuideArchiveListTitle } from '@/utils/guideArchivePresentation'
import {
  loadEntryChecklistChecks,
  seedEntryChecksFromSavedIfEmpty,
  setEntryChecklistItemChecked,
} from '@/utils/guideArchiveEntryChecklistStorage'
import { loadSavedItems, setSavedItemChecked } from '@/utils/savedTripItems'

/**
 * 가이드 보관함 상세 — 이 여행 스냅샷에 담긴 필수품을 하나씩 체크하며 준비합니다.
 * 체크 상태는 entry 단위로 저장되어, 같은 trip에 다른 여행지 목록이 있어도 섞이지 않습니다.
 */
export default function GuideArchiveChecklistView({ tripId, entry }) {
  const items = entry.items ?? []
  const [checks, setChecks] = useState(() => loadEntryChecklistChecks(tripId, entry.id))

  useEffect(() => {
    seedEntryChecksFromSavedIfEmpty(tripId, entry.id, loadSavedItems(tripId), entry.items)
    setChecks(loadEntryChecklistChecks(tripId, entry.id))
  }, [tripId, entry.id, items.length])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const it of items) {
      const label = it.categoryLabel || it.category || '준비물'
      if (!map.has(label)) map.set(label, [])
      map.get(label).push(it)
    }
    return Array.from(map.entries())
  }, [items])

  const total = items.length
  const checkedCount = useMemo(() => items.filter((it) => checks[String(it.id)]).length, [items, checks])
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  const handleToggle = useCallback(
    (itemId) => {
      const id = String(itemId)
      const nextVal = !checks[id]
      setChecks((prev) => ({ ...prev, [id]: nextVal }))
      setEntryChecklistItemChecked(tripId, entry.id, id, nextVal)
      setSavedItemChecked(tripId, id, nextVal)
    },
    [checks, tripId, entry.id],
  )

  const title = buildGuideArchiveListTitle(entry)
  const dateLine = buildGuideArchiveDateLine(entry)

  if (total === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-lg font-bold text-slate-900">담긴 준비물이 없습니다</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          맞춤 여행 준비 탐색에서 필요한 항목을 저장하면 여기에서 하나씩 체크할 수 있어요.
        </p>
        <Link
          to={`/trips/${tripId}/search`}
          className="mt-6 inline-flex rounded-2xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-800"
        >
          준비물 검색하러 가기
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 md:pb-12 md:pt-6">
      <header className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-800/90">체크리스트 상세</p>
        <h1 className="mt-2 text-xl font-extrabold leading-snug text-slate-900 md:text-2xl">{title}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
          {dateLine}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          검색에서 골라 저장한 필수품을 빠짐없이 챙기세요. 체크한 내용은 이 목록에만 반영되며, 목록 화면의 진행률과
          연동됩니다.
        </p>
      </header>

      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-100/90 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 py-3 backdrop-blur-sm md:static md:mx-0 md:rounded-2xl md:border md:border-slate-100 md:bg-white md:px-5 md:py-4 md:shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-800">
            준비 진행 <span className="tabular-nums text-teal-700">{checkedCount}</span> /{' '}
            <span className="tabular-nums">{total}</span>
          </p>
          <span className="text-sm font-extrabold tabular-nums text-teal-800">{progress}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-teal-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {entry.weatherSummary ? (
        <section className="mb-6 rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-bold text-sky-800">날씨·환경 요약</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{entry.weatherSummary}</p>
          {(entry.temperatureRange || entry.rainChance) && (
            <p className="mt-2 text-xs text-slate-500">
              {entry.temperatureRange ? <>기온 {entry.temperatureRange}</> : null}
              {entry.temperatureRange && entry.rainChance ? ' · ' : null}
              {entry.rainChance || ''}
            </p>
          )}
        </section>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          to={`/trips/${tripId}/search`}
          className="inline-flex items-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-900 transition-colors hover:bg-teal-100"
        >
          준비물 더 검색·담기
        </Link>
        <Link
          to={`/trips/${tripId}/checklist`}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          통합 체크리스트 보기
        </Link>
      </div>

      <div className="space-y-8">
        {grouped.map(([categoryLabel, list]) => (
          <section key={categoryLabel}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{categoryLabel}</h2>
            <ul className="space-y-2">
              {list.map((it) => {
                const id = String(it.id)
                const on = Boolean(checks[id])
                return (
                  <li key={id}>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
                        on ? 'border-teal-200 bg-teal-50/80' : 'border-slate-100 bg-white shadow-sm hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => handleToggle(it.id)}
                        className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 accent-teal-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-bold ${on ? 'text-teal-950 line-through decoration-teal-700/50' : 'text-slate-900'}`}>
                          {it.title}
                        </span>
                        {it.description ? (
                          <span className={`mt-1 block text-xs leading-relaxed ${on ? 'text-teal-800/80' : 'text-slate-600'}`}>
                            {it.description}
                          </span>
                        ) : null}
                        {it.detail ? (
                          <span className={`mt-2 block border-l-2 border-teal-200 pl-2 text-xs leading-relaxed ${on ? 'text-teal-800/70' : 'text-slate-500'}`}>
                            {it.detail}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
