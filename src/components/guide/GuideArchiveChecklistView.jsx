import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadSavedItems, setSavedItemChecked } from '@/utils/savedTripItems'
import { patchGuideArchiveEntry } from '@/utils/guideArchiveStorage'
import { buildGuideArchiveDateLine, buildGuideArchiveListTitle } from '@/utils/guideArchivePresentation'
import GuideArchiveProgressBar from '@/components/guide/GuideArchiveProgressBar'
import {
  loadEntryChecklistChecks,
  seedEntryChecksFromSavedIfEmpty,
  setEntryChecklistItemChecked,
} from '@/utils/guideArchiveEntryChecklistStorage'

/**
 * 가이드 보관함 상세 — 이 여행 스냅샷에 담긴 필수품을 하나씩 체크하며 준비합니다.
 * 체크 상태는 entry 단위로 저장되어, 같은 trip에 다른 여행지 목록이 있어도 섞이지 않습니다.
 */
export default function GuideArchiveChecklistView({ tripId, entry }) {
  const navigate = useNavigate()
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
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

  const performSave = useCallback(() => {
    patchGuideArchiveEntry(tripId, entry.id, {
      checklistProgressPercent: progress,
      checklistSavedAt: new Date().toISOString(),
    })
    window.dispatchEvent(
      new CustomEvent('guide-archive-checklist-saved', {
        detail: { tripId: String(tripId), entryId: String(entry.id), progress },
      }),
    )
    setSaveConfirmOpen(false)
    navigate(`/trips/${tripId}/guide-archive`)
  }, [tripId, entry.id, progress, navigate])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  useEffect(() => {
    if (!saveConfirmOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSaveConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [saveConfirmOpen])

  const title = buildGuideArchiveListTitle(entry)
  const dateLine = buildGuideArchiveDateLine(entry)

  const bottomBar = (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 bg-transparent px-5 py-3 md:bottom-0 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-3xl gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="min-w-0 flex-1 basis-0 rounded-2xl border-2 border-gray-100 bg-white/95 px-4 py-3.5 text-sm font-bold text-gray-800 shadow-sm transition-colors hover:bg-cyan-50/80"
        >
          뒤로가기
        </button>
        <button
          type="button"
          onClick={() => setSaveConfirmOpen(true)}
          className="min-w-0 flex-1 basis-0 rounded-2xl bg-amber-400 px-4 py-3.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98]"
        >
          저장
        </button>
      </div>
    </div>
  )

  const saveConfirmModal = saveConfirmOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onClick={() => setSaveConfirmOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-archive-save-confirm-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="guide-archive-save-confirm-title" className="mb-8 text-center text-base font-bold leading-snug text-gray-900">
          저장하시겠습니까?
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={performSave}
            className="min-h-12 flex-1 rounded-2xl bg-amber-400 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md"
          >
            확인
          </button>
          <button
            type="button"
            onClick={() => setSaveConfirmOpen(false)}
            className="min-h-12 flex-1 rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  ) : null

  if (total === 0) {
    return (
      <>
        {saveConfirmModal}
        <div className="mx-auto max-w-2xl px-5 pb-36 pt-10 text-center md:px-4 md:pb-28">
          <p className="text-lg font-bold text-gray-900">담긴 준비물이 없습니다</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            맞춤 여행 준비 탐색에서 필요한 항목을 저장하면 여기에서 하나씩 체크할 수 있어요.
          </p>
          <Link
            to={`/trips/${tripId}/search`}
            className="mt-6 inline-flex rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98]"
          >
            준비물 검색하러 가기
          </Link>
        </div>
        {bottomBar}
      </>
    )
  }

  return (
    <>
      {saveConfirmModal}
      <div className="mx-auto max-w-3xl px-5 pb-36 pt-5 md:px-4 md:pb-28 md:pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-gray-900 md:text-3xl">{title}</h1>
        <p className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-700 md:text-lg">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal-600 md:h-2.5 md:w-2.5" aria-hidden />
          {dateLine}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          골라 저장한 체크리스트로 필수품을 빠짐없이 챙겨보세요!
        </p>
      </header>

      <div className="sticky top-0 z-20 -mx-5 mb-6 border-b border-slate-100/90 bg-white px-5 py-3 backdrop-blur-sm md:static md:mx-0 md:rounded-xl md:border md:border-slate-100 md:bg-white md:px-5 md:py-4 md:shadow-sm">
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
          <span>
            준비 진행도{' '}
            <span className="tabular-nums text-slate-800">
              {checkedCount} / {total}
            </span>
          </span>
          <span className="tabular-nums text-slate-800">{progress}%</span>
        </div>
        <GuideArchiveProgressBar value={progress} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          to={`/trips/${tripId}/search?archiveEntry=${encodeURIComponent(entry.id)}`}
          className="inline-flex items-center rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md active:scale-[0.98]"
        >
          준비물 더 검색·담기
        </Link>
        <Link
          to={`/trips/${tripId}/checklist`}
          className="inline-flex items-center rounded-2xl border-2 border-fuchsia-400/90 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/40 ring-2 ring-white/50 transition hover:brightness-110 hover:shadow-xl hover:shadow-fuchsia-500/30 active:scale-[0.98]"
        >
          이전 화면 UI 보기
        </Link>
      </div>

      <div className="space-y-8">
        {grouped.map(([categoryLabel, list]) => (
          <section key={categoryLabel}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">{categoryLabel}</h2>
            <ul className="space-y-2">
              {list.map((it) => {
                const id = String(it.id)
                const on = Boolean(checks[id])
                return (
                  <li key={id}>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 ${
                        on
                          ? 'border-amber-400 bg-amber-200/95 shadow-sm ring-1 ring-amber-300/70'
                          : 'border-gray-100 bg-white/95 shadow-sm hover:bg-cyan-50/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => handleToggle(it.id)}
                        className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 accent-amber-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-extrabold ${on ? 'text-gray-900 line-through decoration-amber-700/45' : 'text-gray-900'}`}
                        >
                          {it.title}
                        </span>
                        {it.description ? (
                          <span className={`mt-1 block text-xs leading-relaxed ${on ? 'text-gray-700' : 'text-gray-600'}`}>
                            {it.description}
                          </span>
                        ) : null}
                        {it.detail ? (
                          <span
                            className={`mt-2 block border-l-2 pl-2 text-xs leading-relaxed ${
                              on ? 'border-amber-300 text-gray-700' : 'border-cyan-200 text-gray-500'
                            }`}
                          >
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
      {bottomBar}
    </>
  )
}
